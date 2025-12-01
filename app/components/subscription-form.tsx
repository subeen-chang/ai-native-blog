'use client'

import { useState, FormEvent } from 'react'

export default function SubscriptionForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage(data.message)
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.message)
      }
    } catch (error) {
      setStatus('error')
      setMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <div className="mb-16 p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900">
      <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">
        새 글 알림 받기
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        새로운 블로그 글이 발행되면 이메일로 알려드립니다.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="email" className="sr-only">
            이메일 주소
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={status === 'loading'}
            className="w-full px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md
                     bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                     placeholder:text-neutral-500 dark:placeholder:text-neutral-500
                     focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
            aria-describedby={message ? 'subscription-message' : undefined}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900
                   rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 dark:focus:ring-neutral-100
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
        >
          {status === 'loading' ? '처리 중...' : '구독하기'}
        </button>
      </form>

      {message && (
        <div
          id="subscription-message"
          role="alert"
          className={`mt-4 p-3 text-sm rounded-md ${
            status === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}
