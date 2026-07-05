'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">エラーが発生しました</h2>
        <p className="text-muted-foreground mb-6">
          予期しないエラーが発生しました。問題が解決しない場合は、ページをリロードしてください。
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            再試行
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            ホームに戻る
          </button>
        </div>
        {error.digest && (
          <p className="text-xs text-muted-foreground mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
