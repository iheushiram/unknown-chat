'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function ChatPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

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
          <p className="text-gray-600">
            チャット機能は次のステップで実装します
          </p>

          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium texxt-gray-900 mb-2">ユーザ情報</h3>
            <div className="text-sm space-y-1">
              <p>
                <span className="fotn-medium">ID: </span> {user.id}
              </p>
              <p>
                <span className="font-medium">ニックネーム: </span>{' '}
                {user.nickname}
              </p>
              <p>
                <span className="font-medium">匿名ユーザ: </span>{' '}
                {user.isAnonymous}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
