'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { anonymousLogin, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/chat')
    }
  }, [isAuthenticated, router])

  const handleAnonymousLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setError('')

    const result = await anonymousLogin(nickname)

    if (result.success) {
      router.push('/chat')
    } else {
      setError(result.error || 'ログインに失敗しました')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Unknown Chat
          </h1>
          <p className="text-gray-600">匿名でチャットを始めましょう</p>
        </div>

        <form onSubmit={handleAnonymousLogin} className="space-y-6">
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              ニックネーム（オプション）
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="空欄でランダムな名前が生成されます"
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '接続中...' : '匿名でチャットに参加'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            匿名ログインではアカウント情報は保存されません。
            <br />
            ブラウザを閉じると自動的にログアウトされます。
          </p>
        </div>
      </div>
    </div>
  )
}
