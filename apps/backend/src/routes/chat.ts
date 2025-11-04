import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

interface Bindings {
  DB: D1Database
  SESSIONS: KVNamespace
}

export const chat = new Hono<{ Bindings: Bindings }>()

// メッセージ送信用スキーマ
const sendMessageSchema = z.object({
  userId: z.string().min(1),
  content: z.string().min(1),
  roomId: z.string().optional(), // 将来的に部屋制に対応
})

chat.post('/send', zValidator('json', sendMessageSchema), async (c) => {
  try {
    const { userId, content, roomId } = c.req.valid('json')

    // デフォルトルーム（今は全員共通ルーム扱い）
    const targetRoomId = roomId || 'global'

    // D1 にメッセージを保存
    await c.env.DB.prepare(
      `
      INSERT INTO messages (id, room_id, user_id, content, type, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
    )
      .bind(
        crypto.randomUUID(),
        targetRoomId,
        userId,
        content,
        'text',
        Date.now(),
      )
      .run()

    return c.json({ success: true })
  } catch (error) {
    console.error('Send message error:', error)
    return c.json({ success: false, error: 'Failed to send message' }, 500)
  }
})

chat.get('/list', async (c) => {
  try {
    const roomId = c.req.query('roomId') || 'global'

    const { results } = await c.env.DB.prepare(
      `
            SELECT m.id, m.user_id, u.nickname, m.content, m.created_at
            FROM messages m
            LEFT JOIN users u ON m.user_id = u.id
            WHERE m.room_id = ?
            ORDER BY m.created_at ASC
            `,
    )
      .bind(roomId)
      .all()

    return c.json({ success: true, messages: results })
  } catch (error) {
    console.error('Fetch message error:', error)
    return c.json({ success: false, error: 'Failed to fetch messages' }, 500)
  }
})
