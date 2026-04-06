import { useState, useEffect } from 'react'
import Layout from '../components/Layout'

function moeda(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function StatCard({ label, value, accent, icon }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 overflow-hidden relative`}>
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${accent}`} />

      <div className="flex items-start justify-between mt-1">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
          <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        </div>
        <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl ${icon.bg} ml-2`}>
          {icon.svg}
        </div>
      </div>
    </div>
  )
}

export default function Resumo() {
  const agora = new Date()
  const [mes, setMes] = useState(agora.getMonth() + 1)
  const [ano, setAno] = useState(agora.getFullYear())
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(false)

  async function carregar() {
    setLoading(true)
    const res = await fetch(`/api/resumo?mes=${mes}&ano=${ano}`)
    setDados(await res.json())
    setLoading(false)
  }

  useEffect(() => { carregar() }, [mes, ano])

  function navMes(delta) {
    let nm = mes + delta
    let na = ano
    if (nm < 1) { nm = 12; na-- }
    if (nm > 12) { nm = 1; na++ }
    setMes(nm)
    setAno(na)
  }

  const cards = dados ? [
    {
      label: 'Agendamentos',
      value: String(dados.totalAgendamentos),
      accent: 'bg-sky-400',
      icon: {
        bg: 'bg-sky-50',
        svg: (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        ),
      },
    },
    {
      label: 'Total Recebido',
      value: moeda(dados.totalPago),
      accent: 'bg-emerald-500',
      icon: {
        bg: 'bg-emerald-50',
        svg: (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        ),
      },
    },
    {
      label: 'A Receber',
      value: moeda(dados.totalPendente),
      accent: 'bg-amber-400',
      icon: {
        bg: 'bg-amber-50',
        svg: (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    },
    {
      label: 'Total Geral',
      value: moeda(dados.totalGeral),
      accent: 'bg-slate-400',
      icon: {
        bg: 'bg-slate-50',
        svg: (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l5.25-5.25 4.5 4.5 5.25-6 3 3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 20.25h18" />
          </svg>
        ),
      },
    },
  ] : []

  return (
    <Layout>
      {/* Header */}
      <div className="bg-emerald-700 rounded-b-3xl px-5 pt-10 pb-7 shadow-md">
        <h1 className="text-white font-bold text-xl mb-5">Resumo Financeiro</h1>

        {/* Navegação de mês */}
        <div className="flex items-center justify-between bg-white/15 rounded-2xl px-4 py-3">
          <button
            onClick={() => navMes(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white"
          >
            <ChevronLeftIcon />
          </button>
          <span className="font-bold text-white text-base">
            {MESES[mes - 1]} {ano}
          </span>
          <button
            onClick={() => navMes(1)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="px-4 pt-5 max-w-md mx-auto w-full">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Carregando...</p>
          </div>
        )}

        {!loading && dados && (
          <div className="grid grid-cols-2 gap-3">
            {cards.map(card => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>
        )}

        {!loading && !dados && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l5.25-5.25 4.5 4.5 5.25-6 3 3M3 20.25h18" />
            </svg>
            <p className="text-gray-400 text-sm font-medium">Sem dados para este período</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
