import { NextRequest } from 'next/server'
import { getCollection } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { Holding, Bond, Payment } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const auth = getTokenFromRequest(req)
    if (!auth) return Response.json({ error: 'No autorizado' }, { status: 401 })

    const investorId = new ObjectId(auth.userId)

    const holdingsCol = await getCollection<Holding>('holdings')
    const bondsCol = await getCollection<Bond>('bonds')
    const paymentsCol = await getCollection<Payment>('payments')

    const holdings = await holdingsCol.find({ investorId }).toArray()

    const bondIds = [...new Set(holdings.map(h => h.bondId.toString()))]
    const bonds = await bondsCol
      .find({ _id: { $in: bondIds.map(id => new ObjectId(id)) } })
      .toArray()

    const bondMap = new Map(bonds.map(b => [b._id!.toString(), b]))

    // Enrich holdings
    const enriched = holdings.map(h => ({
      ...h,
      bond: bondMap.get(h.bondId.toString()) || null,
    }))

    // Upcoming payments
    const upcoming = await paymentsCol
      .find({
        investorId,
        status: 'scheduled',
        scheduledDate: { $gte: new Date() },
      })
      .sort({ scheduledDate: 1 })
      .limit(10)
      .toArray()

    // Historical payments
    const historical = await paymentsCol
      .find({ investorId, status: 'completed' })
      .sort({ processedDate: -1 })
      .limit(20)
      .toArray()

    // Totals
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
    const totalCost = holdings.reduce((sum, h) => sum + h.purchasePrice * h.quantity, 0)

    return Response.json({
      holdings: enriched,
      upcoming,
      historical,
      summary: {
        totalValue,
        totalCost,
        unrealizedGain: totalValue - totalCost,
        holdingsCount: holdings.length,
      },
    })
  } catch (err) {
    console.error('portfolio GET error:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
