import Link from 'next/link'
import { useRouter } from 'next/router'

function HomeIcon({ active }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`w-6 h-6 ${active ? 'text-emerald-600' : 'text-gray-400'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75v-4.5h-4.5V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z"
      />
    </svg>
  )
}

function ChartIcon({ active }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`w-6 h-6 ${active ? 'text-emerald-600' : 'text-gray-400'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l5.25-5.25 4.5 4.5 5.25-6 3 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20.25h18" />
    </svg>
  )
}

export default function Layout({ children }) {
  const router = useRouter()
  const isHome = router.pathname === '/'
  const isResumo = router.pathname === '/resumo'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around px-6 py-2">
          <Link href="/" className="flex flex-col items-center gap-0.5 py-1 px-4">
            <HomeIcon active={isHome} />
            <span className={`text-[10px] font-medium ${isHome ? 'text-emerald-600' : 'text-gray-400'}`}>
              Agenda
            </span>
          </Link>

          <Link
            href="/agendamentos/novo"
            className="flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-full shadow-lg shadow-emerald-200 -mt-6 border-4 border-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </Link>

          <Link href="/resumo" className="flex flex-col items-center gap-0.5 py-1 px-4">
            <ChartIcon active={isResumo} />
            <span className={`text-[10px] font-medium ${isResumo ? 'text-emerald-600' : 'text-gray-400'}`}>
              Resumo
            </span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
