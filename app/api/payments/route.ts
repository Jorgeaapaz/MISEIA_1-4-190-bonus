import { NextRequest } from 'next/server'
import { getCollection } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { Payment } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const auth = getTokenFromRequest(req)
    if (!auth) return Response.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const bondId = searchParams.get('bondId')
    const status = searchParams.get('status')

    const query: Record<string, unknown> = {}
    if (auth.role === 'investor') query.investorId = new ObjectId(auth.userId)
    if (bondId) query.bondId = new ObjectId(bondId)
    if (status) query.status = status

    const col = await getCollection<Payment>('payments')
    const payments = await col.find(query).sort({ scheduledDate: 1 }).toArray()
    return Response.json(payments)
  } catch (err) {
    console.error('payments GET error:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = getTokenFromRequest(req)
    if (!auth || auth.role !== 'admin') {
      return Response.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { paymentId, status } = await req.json()

    if (!paymentId || !status) {
      return Response.json({ error: 'paymentId y status requeridos' }, { status: 400 })
    }

    const col = await getCollection<Payment>('payments')
    await col.updateOne(
      { _id: new ObjectId(paymentId) },
      {
        $set: {
          status,
          processedDate: status === 'completed' ? new Date() : undefined,
        },
      }
    )

    const updated = await col.findOne({ _id: new ObjectId(paymentId) })
    return Response.json(updated)
  } catch (err) {
    console.error('payments PATCH error:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
