import { NextRequest } from 'next/server'
import { getCollection } from '@/lib/db'
import { sendMagicLink } from '@/lib/email'
import { generateMagicToken } from '@/lib/auth'
import { MagicToken, User } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email requerido' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Email inválido' }, { status: 400 })
    }

    const usersCol = await getCollection<User>('users')
    const tokensCol = await getCollection<MagicToken>('magic_tokens')

    // Upsert user
    await usersCol.updateOne(
      { email: email.toLowerCase() },
      {
        $setOnInsert: {
          email: email.toLowerCase(),
          name: name || email.split('@')[0],
          role: 'investor',
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    // Invalidate old tokens
    await tokensCol.updateMany(
      { email: email.toLowerCase(), used: false },
      { $set: { used: true } }
    )

    const token = generateMagicToken()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await tokensCol.insertOne({
      email: email.toLowerCase(),
      token,
      expiresAt,
      used: false,
    })

    await sendMagicLink(email.toLowerCase(), token)

    return Response.json({ message: 'Enlace enviado' }, { status: 200 })
  } catch (err) {
    console.error('send magic link error:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
