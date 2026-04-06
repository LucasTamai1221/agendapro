import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Layout({ children }) {
  const router = useRouter()
  const p = router.pathname

  const items = [
    {
      href: '/',
      label: 'Agenda',
      active: p === '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75v-4.5h-4.5V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
        </svg>
      ),
    },
    {
      href: '/pendentes',
      label: 'Pendentes',
      active: p === '/pendentes',
      amber: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: '/agendamentos/novo',
      label: 'Novo',
      active: p === '/agendamentos/novo',
      plus: true,
    },
    {
      href: '/resumo',
      label: 'Resumo',
      active: p === '/resumo',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l5.25-5.25 4.5 4.5 5.25-6 3 3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 20.25h18" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg">
        <div className="max-w-md mx-auto flex items-end justify-around px-2 pt-2 pb-2">
          {items.map(item => {
            if (item.plus) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 -mt-5"
                >
                  <span className="flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-full shadow-lg shadow-emerald-200 border-4 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </span>
                  <span className={`text-[10px] font-medium ${item.active ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </Link>
              )
            }

            const activeColor = item.amber
              ? (item.active ? 'text-amber-500' : 'text-gray-400')
              : (item.active ? 'text-emerald-600' : 'text-gray-400')

            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 py-1 px-2">
                <span className={activeColor}>{item.icon}</span>
                <span className={`text-[10px] font-medium ${activeColor}`}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
