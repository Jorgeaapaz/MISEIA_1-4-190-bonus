import { NextRequest } from 'next/server'
import { getCollection } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { Bond } from '@/lib/types'
import { ObjectId } from 'mongodb'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    const col = await getCollection<Bond>('bonds')
    const bond = await col.findOne({ _id: new ObjectId(id) })
    if (!bond) return Response.json({ error: 'Bono no encontrado' }, { status: 404 })
    return Response.json(bond)
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const auth = getTokenFromRequest(req)
    if (!auth || auth.role !== 'admin') {
      return Response.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = await ctx.params
    const body = await req.json()

    const col = await getCollection<Bond>('bonds')
    const update: Partial<Bond> = { ...body, updatedAt: new Date() }

    if (body.maturityDate) update.maturityDate = new Date(body.maturityDate)
    if (body.issueDate) update.issueDate = new Date(body.issueDate)
    if (body.faceValue) update.faceValue = Math.round(body.faceValue)
    if (body.totalIssuance) update.totalIssuance = Math.round(body.totalIssuance)
    if (body.couponRate) update.couponRate = Math.round(body.couponRate)

    await col.updateOne({ _id: new ObjectId(id) }, { $set: update })
    const updated = await col.findOne({ _id: new ObjectId(id) })
    return Response.json(updated)
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const auth = getTokenFromRequest(req)
    if (!auth || auth.role !== 'admin') {
      return Response.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = await ctx.params
    const col = await getCollection<Bond>('bonds')
    await col.deleteOne({ _id: new ObjectId(id) })
    return Response.json({ message: 'Bono eliminado' })
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
