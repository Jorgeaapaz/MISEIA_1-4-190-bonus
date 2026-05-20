import { NextRequest } from 'next/server'
import { getCollection } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { MagicToken, User } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token || typeof token !== 'string') {
      return Response.json({ error: 'Token requerido' }, { status: 400 })
    }

    const tokensCol = await getCollection<MagicToken>('magic_tokens')
    const usersCol = await getCollection<User>('users')

    const magicToken = await tokensCol.findOne({ token, used: false })

    if (!magicToken) {
      return Response.json({ error: 'Token inválido' }, { status: 401 })
    }

    if (new Date() > magicToken.expiresAt) {
      return Response.json({ error: 'Token expirado' }, { status: 401 })
    }

    // Mark as used
    await tokensCol.updateOne({ token }, { $set: { used: true } })

    const user = await usersCol.findOne({ email: magicToken.email })
    if (!user) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const jwt = signToken({
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    })

    return Response.json({ token: jwt, user: { email: user.email, name: user.name, role: user.role } })
  } catch (err) {
    console.error('verify magic link error:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
