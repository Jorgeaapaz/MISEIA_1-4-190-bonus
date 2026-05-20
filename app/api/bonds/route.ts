import { NextRequest } from 'next/server'
import { getCollection } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { Bond } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const sector = searchParams.get('sector')
    const rating = searchParams.get('rating')
    const minYtm = searchParams.get('minYtm')
    const maxMaturity = searchParams.get('maxMaturity')

    const query: Record<string, unknown> = {}
    if (status) query.status = status
    if (sector) query.sector = sector
    if (rating) query.creditRating = rating
    if (maxMaturity) query.maturityDate = { $lte: new Date(maxMaturity) }

    const col = await getCollection<Bond>('bonds')
    const bonds = await col.find(query).sort({ createdAt: -1 }).toArray()

    // Filter by YTM if provided (calculated field)
    const result = minYtm
      ? bonds.filter(b => {
          const annual = (b.faceValue * b.couponRate) / 10000
          const approxYtm = annual / b.faceValue
          return approxYtm * 10000 >= parseFloat(minYtm)
        })
      : bonds

    return Response.json(result)
  } catch (err) {
    console.error('bonds GET error:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getTokenFromRequest(req)
    if (!auth || auth.role !== 'admin') {
      return Response.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await req.json()

    const bond: Omit<Bond, '_id'> = {
      bondName: body.bondName,
      companyName: body.companyName,
      faceValue: Math.round(body.faceValue),
      totalIssuance: Math.round(body.totalIssuance),
      couponType: body.couponType,
      couponRate: Math.round(body.couponRate),
      paymentFrequency: body.paymentFrequency,
      maturityDate: new Date(body.maturityDate),
      issueDate: new Date(body.issueDate),
      maturityType: body.maturityType,
      status: 'draft',
      creditRating: body.creditRating,
      sector: body.sector,
      description: body.description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const col = await getCollection<Bond>('bonds')
    const result = await col.insertOne(bond)

    return Response.json({ _id: result.insertedId, ...bond }, { status: 201 })
  } catch (err) {
    console.error('bonds POST error:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
