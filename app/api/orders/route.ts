import { NextRequest } from 'next/server'
import { getCollection } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { Order, Bond, Holding, Payment, PaymentType, PaymentStatus } from '@/lib/types'
import { ObjectId } from 'mongodb'
import { paymentDates, couponPerPeriod } from '@/lib/payments'

type PaymentDoc = Omit<Payment, '_id'>

export async function GET(req: NextRequest) {
  try {
    const auth = getTokenFromRequest(req)
    if (!auth) return Response.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const bondId = searchParams.get('bondId')

    const query: Record<string, unknown> = {}

    if (auth.role === 'investor') {
      query.investorId = new ObjectId(auth.userId)
    }
    if (bondId) query.bondId = new ObjectId(bondId)

    const col = await getCollection<Order>('orders')
    const orders = await col.find(query).sort({ createdAt: -1 }).toArray()
    return Response.json(orders)
  } catch (err) {
    console.error('orders GET error:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getTokenFromRequest(req)
    if (!auth) return Response.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()

    const bondsCol = await getCollection<Bond>('bonds')
    const bond = await bondsCol.findOne({ _id: new ObjectId(body.bondId) })
    if (!bond) return Response.json({ error: 'Bono no encontrado' }, { status: 404 })
    if (bond.status !== 'offering' && bond.status !== 'active') {
      return Response.json({ error: 'Bono no disponible para compra' }, { status: 400 })
    }

    const quantity = parseInt(body.quantity)
    if (!quantity || quantity < 1) {
      return Response.json({ error: 'Cantidad inválida' }, { status: 400 })
    }

    const totalAmount = bond.faceValue * quantity

    const order: Omit<Order, '_id'> = {
      bondId: new ObjectId(body.bondId),
      investorId: new ObjectId(auth.userId),
      requestedAmount: totalAmount,
      filledAmount: totalAmount,
      pricePerBond: bond.faceValue,
      quantity,
      status: 'confirmed',
      notes: body.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const ordersCol = await getCollection<Order>('orders')
    const result = await ordersCol.insertOne(order)

    // Create holding
    const holdingsCol = await getCollection<Holding>('holdings')
    await holdingsCol.insertOne({
      investorId: new ObjectId(auth.userId),
      bondId: new ObjectId(body.bondId),
      orderId: result.insertedId,
      quantity,
      purchasePrice: bond.faceValue,
      currentValue: totalAmount,
      acquiredAt: new Date(),
    })

    // Schedule coupon payments
    const paymentsCol = await getCollection<Payment>('payments')
    const dates = paymentDates(bond)
    const coupon = couponPerPeriod(bond)

    const paymentDocs: PaymentDoc[] = dates.map(date => ({
      bondId: bond._id!,
      investorId: new ObjectId(auth.userId),
      orderId: result.insertedId,
      paymentType: 'coupon' as PaymentType,
      amount: coupon * quantity,
      scheduledDate: date,
      status: 'scheduled' as PaymentStatus,
      reference: `CPN-${result.insertedId}-${date.toISOString().slice(0, 10)}`,
      createdAt: new Date(),
    }))

    // Principal repayment
    paymentDocs.push({
      bondId: bond._id!,
      investorId: new ObjectId(auth.userId),
      orderId: result.insertedId,
      paymentType: 'principal' as PaymentType,
      amount: totalAmount,
      scheduledDate: bond.maturityDate,
      status: 'scheduled' as PaymentStatus,
      reference: `PRN-${result.insertedId}`,
      createdAt: new Date(),
    })

    await paymentsCol.insertMany(paymentDocs)

    return Response.json({ _id: result.insertedId, ...order }, { status: 201 })
  } catch (err) {
    console.error('orders POST error:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
