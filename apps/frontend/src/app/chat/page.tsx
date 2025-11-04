'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function ChatPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<{ id: string; text: string }[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/chat/list')
        const data = await res.json()
        if (data.success) {
          setMessages(
            data.messages.map((m: any) => ({
              id: m.user_id,
              text: m.content,
            })),
          )
        }
      } catch (err) {
        console.log('メッセージ取得失敗：', err)
      }
    }

    // 初回取得
    fetchMessages()

    // 2秒ごとに更新
    const interval = setInterval(fetchMessages, 2000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">認証を確認中</div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const handleSend = async () => {
    if (!input.trim()) return

    // 先に楽観的にローカル反映（送信体験を即時表示）
    const newMessage = { id: user.id, text: input.trim() }
    setMessages((prev) => [...prev, newMessage])
    const messageText = input.trim()
    setInput('')

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          content: messageText,
        }),
      })

      const data = await res.json()
      if (!data.success) {
        console.log('送信失敗：', data.error)
      }
    } catch (err) {
      console.log('API送信エラー：', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-990">
              Unknown Chat
            </h1>
            <p className="text-sm text-gray-600">
              ようこそ、 {user.nickname} さん
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">チャット機能</h2>

          <div className="flex-1 overflow-y-auto border rounded-md p-4 bg-gray-50 space-y-2">
            {messages.length === 0 && (
              <p className="text-sm text-gray-500">
                メッセージはまだありません
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.id === user.id
                    ? 'bg-blue-500 text-white self-end ml-auto'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center space-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 border rounded-lg p-2"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              送信
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
