'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const user = localStorage.getItem('user')
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/auth/login')
    }
  }, [router])

  return null
}
