import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Link from 'next/link'

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]
const DIAS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function moeda(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function isoDate(d) {
  return d.toISOString().split('T')[0]
}

// Calcula início e fim da semana que contém `d`
function semanaRange(d) {
  const inicio = new Date(d)
  inicio.setDate(d.getDate() - d.getDay())
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date(inicio)
  fim.setDate(inicio.getDate() + 6)
  fim.setHours(23, 59, 59, 999)
  return { inicio, fim }
}

// Calcula início e fim do mês
function mesRange(mes, ano) {
  const inicio = new Date(ano, mes - 1, 1, 0, 0, 0)
  const fim = new Date(ano, mes, 0, 23, 59, 59)
  return { inicio, fim }
}

// Agrupa agendamentos por dia → { 'YYYY-MM-DD': { pago, pendente } }
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

// Gera array de dias entre inicio e fim
function diasEntre(inicio, fim) {
  const dias = []
  const d = new Date(inicio)
  while (d <= fim) {
    dias.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return dias
}

// ── Gráfico de barras SVG ──────────────────────────────────
function BarChart({ bars, periodo }) {
  // bars: [{ label, pago, pendente }]
  const maxVal = Math.max(...bars.map(b => b.pago + b.pendente), 1)
  const CHART_H = 90
  const BAR_W = periodo === 'semana' ? 30 : 18
  const GAP = periodo === 'semana' ? 10 : 6
  const LABEL_H = 20
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
            <g key={b.label}>
              {/* Barra pendente (cima) */}
              {pendH > 0 && (
                <rect
                  x={x} y={CHART_H - totalH}
                  width={BAR_W} height={pendH}
                  rx={3} fill="#fcd34d"
                />
              )}
              {/* Barra pago (baixo) */}
              {pagoH > 0 && (
                <rect
                  x={x} y={CHART_H - pagoH}
                  width={BAR_W} height={pagoH}
                  rx={pagoH === totalH ? 3 : 0}
                  style={{ borderRadius: 0 }}
                  fill="#10b981"
                />
              )}
              {/* Sem dados */}
              {totalH === 0 && (
                <rect x={x} y={CHART_H - 3} width={BAR_W} height={3} rx={1.5} fill="#e5e7eb" />
              )}
              {/* Label */}
              <text
                x={x + BAR_W / 2}
                y={CHART_H + LABEL_H - 4}
                textAnchor="middle"
                fontSize={periodo === 'semana' ? 9 : 7}
                fill="#9ca3af"
                fontFamily="sans-serif"
              >
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

export default function Resumo() {
  const agora = new Date()
  const [periodo, setPeriodo] = useState('mes')
  const [mes, setMes] = useState(agora.getMonth() + 1)
  const [ano, setAno] = useState(agora.getFullYear())
  const [semanaBase, setSemanaBase] = useState(agora)
  const [dados, setDados] = useState(null)
  const [ags, setAgs] = useState([])
  const [loading, setLoading] = useState(false)

  async function carregar() {
    setLoading(true)
    try {
      let inicio, fim

      if (periodo === 'semana') {
        const r = semanaRange(semanaBase)
        inicio = r.inicio
        fim = r.fim
      } else {
        const r = mesRange(mes, ano)
        inicio = r.inicio
        fim = r.fim
      }

      const [resumoRes, agsRes] = await Promise.all([
        // Para os cards de totais, calculamos a partir dos agendamentos
        fetch(`/api/agendamentos/range?inicio=${inicio.toISOString()}&fim=${fim.toISOString()}`),
        fetch(`/api/agendamentos/range?inicio=${inicio.toISOString()}&fim=${fim.toISOString()}`),
      ])

      const agendamentos = await agsRes.json()
      const lista = Array.isArray(agendamentos) ? agendamentos : []

      const totalAgendamentos = lista.length
      const totalPago = lista.filter(a => a.pagamentoStatus === 'pago').reduce((s, a) => s + a.valor, 0)
      const totalPendente = lista.filter(a => a.pagamentoStatus !== 'pago').reduce((s, a) => s + a.valor, 0)
      const totalGeral = lista.reduce((s, a) => s + a.valor, 0)

      setDados({ totalAgendamentos, totalPago, totalPendente, totalGeral })
      setAgs(lista)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [periodo, mes, ano, semanaBase])

  function navMes(delta) {
    let nm = mes + delta, na = ano
    if (nm < 1) { nm = 12; na-- }
    if (nm > 12) { nm = 1; na++ }
    setMes(nm); setAno(na)
  }

  function navSemana(delta) {
    const d = new Date(semanaBase)
    d.setDate(d.getDate() + delta * 7)
    setSemanaBase(d)
  }

  // Construir dados do gráfico
  function buildChartBars() {
    const byDay = agruparPorDia(ags)

    if (periodo === 'semana') {
      const { inicio, fim } = semanaRange(semanaBase)
      return diasEntre(inicio, fim).map(d => {
        const key = isoDate(d)
        const v = byDay[key] || { pago: 0, pendente: 0 }
        return { label: DIAS_PT[d.getDay()], ...v }
      })
    } else {
      // Agrupar por semana do mês (S1..S5)
      const semanas = {}
      const { inicio, fim } = mesRange(mes, ano)
      diasEntre(inicio, fim).forEach(d => {
        const w = `S${Math.ceil(d.getDate() / 7)}`
        if (!semanas[w]) semanas[w] = { pago: 0, pendente: 0 }
        const key = isoDate(d)
        if (byDay[key]) {
          semanas[w].pago += byDay[key].pago
          semanas[w].pendente += byDay[key].pendente
        }
      })
      return Object.entries(semanas).map(([label, v]) => ({ label, ...v }))
    }
  }

  const bars = buildChartBars()
  const totalPendente = dados?.totalPendente || 0
  const pendCount = ags.filter(a => a.pagamentoStatus !== 'pago').length

  const cards = dados ? [
    {
      label: 'Agendamentos',
      value: String(dados.totalAgendamentos),
      accent: 'bg-sky-400',
      icon: { bg: 'bg-sky-50', svg: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
    },
    {
      label: 'Recebido',
      value: moeda(dados.totalPago),
      accent: 'bg-emerald-500',
      icon: { bg: 'bg-emerald-50', svg: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg> },
    },
    {
      label: 'A Receber',
      value: moeda(dados.totalPendente),
      accent: 'bg-amber-400',
      icon: { bg: 'bg-amber-50', svg: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    },
    {
      label: 'Total',
      value: moeda(dados.totalGeral),
      accent: 'bg-slate-400',
      icon: { bg: 'bg-slate-50', svg: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l5.25-5.25 4.5 4.5 5.25-6 3 3" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 20.25h18" /></svg> },
    },
  ] : []

  // Rótulo do período para o título
  const { inicio: ini, fim } = periodo === 'semana' ? semanaRange(semanaBase) : mesRange(mes, ano)
  const tituloSemana = `${ini.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${fim.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`

  return (
    <Layout>
      {/* Header */}
      <div className="bg-emerald-700 rounded-b-3xl px-5 pt-10 pb-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-bold text-xl">Resumo</h1>
          {pendCount > 0 && (
            <Link
              href="/pendentes"
              className="flex items-center gap-1.5 bg-amber-400 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {pendCount} pendente{pendCount !== 1 ? 's' : ''}
            </Link>
          )}
        </div>

        {/* Semana / Mês toggle */}
        <div className="flex justify-center mb-4">
          <div className="flex bg-white/20 rounded-full p-0.5">
            <button
              onClick={() => setPeriodo('semana')}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${periodo === 'semana' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white/80'}`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriodo('mes')}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${periodo === 'mes' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white/80'}`}
            >
              Mês
            </button>
          </div>
        </div>

        {/* Navegação de período */}
        <div className="flex items-center justify-between bg-white/15 rounded-2xl px-4 py-2.5">
          <button
            onClick={() => periodo === 'mes' ? navMes(-1) : navSemana(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <span className="font-bold text-white text-sm">
            {periodo === 'mes' ? `${MESES[mes - 1]} ${ano}` : tituloSemana}
          </span>
          <button
            onClick={() => periodo === 'mes' ? navMes(1) : navSemana(1)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
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
            {/* Cards de resumo */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {cards.map(card => <StatCard key={card.label} {...card} />)}
            </div>

            {/* Gráfico */}
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
                <BarChart bars={bars} periodo={periodo} />
              ) : (
                <div className="flex items-center justify-center h-24">
                  <p className="text-gray-300 text-xs">Sem dados para exibir</p>
                </div>
              )}
            </div>

            {/* Link para pendentes */}
            {pendCount > 0 && (
              <Link
                href="/pendentes"
                className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5"
              >
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

        {!loading && !dados && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-gray-400 text-sm font-medium">Sem dados para este período</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
