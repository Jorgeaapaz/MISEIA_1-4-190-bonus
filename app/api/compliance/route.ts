import { NextRequest } from 'next/server'
import { getCollection } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { ComplianceDocument } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const auth = getTokenFromRequest(req)
    if (!auth) return Response.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const bondId = searchParams.get('bondId')

    const query: Record<string, unknown> = {}
    if (bondId) query.bondId = new ObjectId(bondId)

    const col = await getCollection<ComplianceDocument>('compliance_docs')
    const docs = await col.find(query).sort({ generatedAt: -1 }).toArray()
    return Response.json(docs)
  } catch (err) {
    console.error('compliance GET error:', err)
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

    const doc: Omit<ComplianceDocument, '_id'> = {
      bondId: new ObjectId(body.bondId),
      documentType: body.documentType,
      title: body.title,
      s3Key: body.s3Key || `compliance/${body.bondId}/${body.documentType}-${Date.now()}.pdf`,
      generatedAt: new Date(),
      period: body.period,
      createdBy: new ObjectId(auth.userId),
    }

    const col = await getCollection<ComplianceDocument>('compliance_docs')
    const result = await col.insertOne(doc)
    return Response.json({ _id: result.insertedId, ...doc }, { status: 201 })
  } catch (err) {
    console.error('compliance POST error:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
