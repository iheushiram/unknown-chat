import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

interface Bindings {
  DB: D1Database
  SESSIONS: KVNamespace
}

const auth = new Hono<{ Bindings: Bindings }>()

const anonymousLoginSchema = z.object({
  nickname: z.string().min(1).max(20).optional(),
})

auth.post('/anonymous', zValidator('json', anonymousLoginSchema), async (c) => {
  try {
    const { nickname } = c.req.valid('json')

    const userId = `anon_${nanoid()}`
    const sessionToken = nanoid(32)

    const randomNames = ['Guest', 'Anonymous', 'Unknown', 'Visitor', 'User']
    const randomNumber = Math.floor(Math.random() * 9999)
    const finalNickname =
      nickname ||
      `${randomNames[Math.floor(Math.random() * randomNames.length)]}${randomNumber}`

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // user作成
    await c.env.DB.prepare(
      `
            INSERT INTO users (id, nickname, is_anonymous, created_at, last_active)
            VALUES (?, ?, ?, ?, ?)
            `,
    )
      .bind(userId, finalNickname, 1, Date.now(), Date.now())
      .run()

    await c.env.DB.prepare(
      `
                INSERT INTO user_sessions (id, user_id, token, expires_at, created_at)
                VALUES (?, ?, ?, ?, ?)
            `,
    )
      .bind(nanoid(), userId, sessionToken, expiresAt.getTime(), Date.now())
      .run()

    // KVストアにも保存（高速アクセス用）
    await c.env.SESSIONS.put(
      `session:${sessionToken}`,
      JSON.stringify({
        userId,
        nickname: finalNickname,
        isAnonymous: true,
        expiresAt: expiresAt.getTime(),
      }),
      { expirationTtl: 24 * 60 * 60 },
    )

    return c.json({
      success: true,
      user: {
        id: userId,
        nickname: finalNickname,
        isAnonymous: true,
      },
      sesison: {
        token: sessionToken,
        expiresAt: expiresAt.toISOString(),
      },
    })
  } catch (error) {
    console.log(`Anonymous login error: `, error)
    return c.json(
      {
        success: false,
        error: 'Failed to create anonymous user',
      },
      501,
    )
  }
})

auth.get('/verify', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'No token provided' }, 401)
    }

    const token = authHeader.substring(7)

    const sessionData = await c.env.SESSIONS.get(`session:${token}`)
    if (!sessionData) {
      return c.json({ success: false, error: 'Invalid token' }, 401)
    }

    const session = JSON.parse(sessionData)

    if (session.expiresAt < Date.now()) {
      await c.env.SESSIONS.delete(`session:${token}`)
      return c.json({ success: false, error: 'Token expired' }, 401)
    }

    return c.json({
      success: true,
      user: {
        id: session.userId,
        nickname: session.nickname,
        isAnonymous: session.is_anonymous,
      },
    })
  } catch (error) {
    console.error('Token verification error: ', error)
    return c.json({ success: false, error: 'Token verification failed' }, 500)
  }
})

export { auth }
