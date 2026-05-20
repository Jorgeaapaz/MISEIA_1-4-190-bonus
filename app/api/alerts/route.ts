import { NextRequest } from 'next/server'
import { getCollection } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { Alert } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const auth = getTokenFromRequest(req)
    if (!auth) return Response.json({ error: 'No autorizado' }, { status: 401 })

    const col = await getCollection<Alert>('alerts')
    const alerts = await col
      .find({ investorId: new ObjectId(auth.userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return Response.json(alerts)
  } catch (err) {
    console.error('alerts GET error:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = getTokenFromRequest(req)
    if (!auth) return Response.json({ error: 'No autorizado' }, { status: 401 })

    const { alertId } = await req.json()
    if (!alertId) return Response.json({ error: 'alertId requerido' }, { status: 400 })

    const col = await getCollection<Alert>('alerts')
    await col.updateOne(
      { _id: new ObjectId(alertId), investorId: new ObjectId(auth.userId) },
      { $set: { read: true } }
    )

    return Response.json({ message: 'Alerta marcada como leída' })
  } catch (err) {
    console.error('alerts PATCH error:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
