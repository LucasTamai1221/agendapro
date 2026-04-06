import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Link from 'next/link'

function moeda(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function isoDate(d) {
  return d.toISOString().split('T')[0]
}

function diasEntre(inicioStr, fimStr) {
  const dias = []
  const d = new Date(inicioStr + 'T00:00:00')
  const fim = new Date(fimStr + 'T00:00:00')
  while (d <= fim) {
    dias.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return dias
}

function agruparPorDia(ags) {
  const map = {}
  ags.forEach(a => {
    const dia = a.dataHora.slice(0, 10)
    if (!map[dia]) map[dia] = { pago: 0, pendente: 0 }
    if (a.pagamentoStatus === 'pago') map[dia].pago += a.valor
    else map[dia].pendente += a.valor
  })
  return map
}

function buildBars(ags, inicioStr, fimStr) {
  const byDay = agruparPorDia(ags)
  const todos = diasEntre(inicioStr, fimStr)
  const diffDias = todos.length

  if (diffDias <= 31) {
    // Diário
    return todos.map(d => {
      const key = isoDate(d)
      const v = byDay[key] || { pago: 0, pendente: 0 }
      return { label: String(d.getDate()), ...v }
    })
  } else {
    // Semanal — agrupa por início de semana
    const semanas = {}
    todos.forEach(d => {
      const ini = new Date(d)
      ini.setDate(d.getDate() - d.getDay())
      const key = isoDate(ini)
      if (!semanas[key]) semanas[key] = { label: `${ini.getDate()}/${ini.getMonth() + 1}`, pago: 0, pendente: 0 }
      const dayKey = isoDate(d)
      if (byDay[dayKey]) {
        semanas[key].pago += byDay[dayKey].pago
        semanas[key].pendente += byDay[dayKey].pendente
      }
    })
    return Object.values(semanas)
  }
}

// ── Gráfico de barras SVG ──────────────────────────────────
function BarChart({ bars }) {
  const maxVal = Math.max(...bars.map(b => b.pago + b.pendente), 1)
  const CHART_H = 90
  const LABEL_H = 20
  const BAR_W = Math.max(10, Math.min(30, Math.floor(260 / bars.length) - 6))
  const GAP = Math.max(3, Math.floor(BAR_W * 0.2))
  const totalW = bars.length * (BAR_W + GAP)

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalW} ${CHART_H + LABEL_H}`}
        width={Math.max(totalW, 280)}
        height={CHART_H + LABEL_H}
        style={{ display: 'block', margin: '0 auto' }}
      >
        {bars.map((b, i) => {
          const x = i * (BAR_W + GAP)
          const totalH = ((b.pago + b.pendente) / maxVal) * CHART_H
          const pagoH = (b.pago / maxVal) * CHART_H
          const pendH = (b.pendente / maxVal) * CHART_H

          return (
            <g key={`${b.label}-${i}`}>
              {pendH > 0 && (
                <rect x={x} y={CHART_H - totalH} width={BAR_W} height={pendH} rx={2} fill="#fcd34d" />
              )}
              {pagoH > 0 && (
                <rect x={x} y={CHART_H - pagoH} width={BAR_W} height={pagoH} rx={pagoH === totalH ? 2 : 0} fill="#10b981" />
              )}
              {totalH === 0 && (
                <rect x={x} y={CHART_H - 3} width={BAR_W} height={3} rx={1.5} fill="#e5e7eb" />
              )}
              <text x={x + BAR_W / 2} y={CHART_H + LABEL_H - 4} textAnchor="middle" fontSize={Math.max(6, BAR_W * 0.35)} fill="#9ca3af" fontFamily="sans-serif">
                {b.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────────
function StatCard({ label, value, accent, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 overflow-hidden relative">
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

// ── Defaults ──────────────────────────────────────────────
function defaultInicio() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function defaultFim() {
  return new Date().toISOString().split('T')[0]
}

export default function Resumo() {
  const [dataInicio, setDataInicio] = useState(defaultInicio)
  const [dataFim, setDataFim] = useState(defaultFim)
  const [dados, setDados] = useState(null)
  const [ags, setAgs] = useState([])
  const [loading, setLoading] = useState(false)

  async function carregar() {
    if (!dataInicio || !dataFim || dataInicio > dataFim) return
    setLoading(true)
    try {
      const inicio = new Date(dataInicio + 'T00:00:00').toISOString()
      const fim = new Date(dataFim + 'T23:59:59').toISOString()
      const res = await fetch(`/api/agendamentos/range?inicio=${inicio}&fim=${fim}`)
      const lista = await res.json()
      const data = Array.isArray(lista) ? lista : []

      setAgs(data)
      setDados({
        totalAgendamentos: data.length,
        totalPago: data.filter(a => a.pagamentoStatus === 'pago').reduce((s, a) => s + a.valor, 0),
        totalPendente: data.filter(a => a.pagamentoStatus !== 'pago').reduce((s, a) => s + a.valor, 0),
        totalGeral: data.reduce((s, a) => s + a.valor, 0),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [dataInicio, dataFim])

  const bars = ags.length > 0 ? buildBars(ags, dataInicio, dataFim) : []
  const pendCount = ags.filter(a => a.pagamentoStatus !== 'pago').length
  const totalPendente = dados?.totalPendente || 0

  const cards = dados ? [
    {
      label: 'Agendamentos', value: String(dados.totalAgendamentos), accent: 'bg-sky-400',
      icon: { bg: 'bg-sky-50', svg: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
    },
    {
      label: 'Recebido', value: moeda(dados.totalPago), accent: 'bg-emerald-500',
      icon: { bg: 'bg-emerald-50', svg: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg> },
    },
    {
      label: 'A Receber', value: moeda(dados.totalPendente), accent: 'bg-amber-400',
      icon: { bg: 'bg-amber-50', svg: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    },
    {
      label: 'Total', value: moeda(dados.totalGeral), accent: 'bg-slate-400',
      icon: { bg: 'bg-slate-50', svg: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l5.25-5.25 4.5 4.5 5.25-6 3 3" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 20.25h18" /></svg> },
    },
  ] : []

  return (
    <Layout>
      {/* Header */}
      <div className="bg-emerald-700 rounded-b-3xl px-5 pt-10 pb-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-bold text-xl">Resumo</h1>
          {pendCount > 0 && (
            <Link href="/pendentes" className="flex items-center gap-1.5 bg-amber-400 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {pendCount} pendente{pendCount !== 1 ? 's' : ''}
            </Link>
          )}
        </div>

        {/* Date pickers */}
        <div className="flex gap-2">
          <label className="flex-1 bg-white rounded-xl px-3 py-2 cursor-pointer">
            <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">De</p>
            <input
              type="date"
              value={dataInicio}
              max={dataFim}
              onChange={e => setDataInicio(e.target.value)}
              className="text-gray-900 text-sm font-semibold w-full outline-none bg-transparent"
            />
          </label>
          <label className="flex-1 bg-white rounded-xl px-3 py-2 cursor-pointer">
            <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">Até</p>
            <input
              type="date"
              value={dataFim}
              min={dataInicio}
              onChange={e => setDataFim(e.target.value)}
              className="text-gray-900 text-sm font-semibold w-full outline-none bg-transparent"
            />
          </label>
        </div>
      </div>

      <div className="px-4 pt-5 max-w-md mx-auto w-full pb-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Carregando...</p>
          </div>
        )}

        {!loading && dados && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {cards.map(card => <StatCard key={card.label} {...card} />)}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-800">Recebimentos</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    <span className="text-[10px] text-gray-500">Recebido</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                    <span className="text-[10px] text-gray-500">Pendente</span>
                  </div>
                </div>
              </div>
              {bars.some(b => b.pago > 0 || b.pendente > 0) ? (
                <BarChart bars={bars} />
              ) : (
                <div className="flex items-center justify-center h-24">
                  <p className="text-gray-300 text-xs">Sem dados para exibir</p>
                </div>
              )}
            </div>

            {pendCount > 0 && (
              <Link href="/pendentes" className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
                <div>
                  <p className="text-sm font-bold text-amber-800">Pagamentos pendentes</p>
                  <p className="text-xs text-amber-600 mt-0.5">{pendCount} agendamento{pendCount !== 1 ? 's' : ''} · {moeda(totalPendente)} a receber</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            )}
          </>
        )}

        {!loading && dados && dados.totalAgendamentos === 0 && (
          <p className="text-center text-gray-400 text-sm mt-4">Sem agendamentos neste período.</p>
        )}
      </div>
    </Layout>
  )
}
