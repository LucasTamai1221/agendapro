import '../styles/globals.css'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { isOnboardingDone } from '../lib/profissao'

const Onboarding = dynamic(() => import('../components/Onboarding'), { ssr: false })

export default function App({ Component, pageProps }) {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!isOnboardingDone()) setShowOnboarding(true)
  }, [])

  return (
    <>
      <Component {...pageProps} />
      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
    </>
  )
}
