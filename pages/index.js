import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import Link from 'next/link'
import { getProfissao } from '../lib/profissao'

const START_HOUR = 7
const END_HOUR = 22
const HOUR_HEIGHT = 64
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
const TOTAL_H = HOUR_HEIGHT * (END_HOUR - START_HOUR)
const DIAS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function isoDate(d) {
  return d.toISOString().split('T')[0]
}

function moeda(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function apptTop(iso) {
  const d = new Date(iso)
  return Math.max(0, (d.getHours() + d.getMinutes() / 60 - START_HOUR) * HOUR_HEIGHT)
}

function apptHora(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function Agenda() {
  const [modo, setModo] = useState('dia')
  const [dataBase, setDataBase] = useState(new Date())
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(false)
  const [marcando, setMarcando] = useState(null)
  const [labels, setLabels] = useState({ cliente: 'Cliente', servico: 'Serviço' })
  const [nowPx, setNowPx] = useState(null)
  const gridRef = useRef(null)

  useEffect(() => { setLabels(getProfissao()) }, [])

  // Ponteiro de hora atual
  useEffect(() => {
    function tick() {
      const now = new Date()
      const px = (now.getHours() + now.getMinutes() / 60 - START_HOUR) * HOUR_HEIGHT
      setNowPx(px >= 0 && px <= TOTAL_H ? px : null)
    }
    tick()
    const t = setInterval(tick, 60000)
    return () => clearInterval(t)
  }, [])

  // Auto-scroll para hora atual
  useEffect(() => {
    if (gridRef.current && nowPx !== null) {
      gridRef.current.scrollTop = Math.max(0, nowPx - 120)
    }
  }, [nowPx, modo])

  function getDias() {
    if (modo === 'dia') return [new Date(dataBase)]
    const d = new Date(dataBase)
    d.setDate(d.getDate() - d.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(d)
      day.setDate(d.getDate() + i)
      return day
    })
  }

  useEffect(() => {
    setLoading(true)
    const dias = getDias()
    const params = dias.map(d => `data=${isoDate(d)}`).join('&')
    fetch(`/api/agendamentos?${params}`)
      .then(r => r.json())
      .then(data => setAgendamentos(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [dataBase, modo])

  function navegar(delta) {
    const d = new Date(dataBase)
    d.setDate(d.getDate() + (modo === 'dia' ? delta : delta * 7))
    setDataBase(d)
  }

  async function marcarPago(e, id) {
    e.preventDefault()
    e.stopPropagation()
    setMarcando(id)
    try {
      const res = await fetch(`/api/agendamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagamentoStatus: 'pago', status: 'concluido' }),
      })
      if (res.ok) {
        setAgendamentos(prev =>
          prev.map(a => a.id === id ? { ...a, pagamentoStatus: 'pago', status: 'concluido' } : a)
        )
      }
    } finally {
      setMarcando(null)
    }
  }

  const dias = getDias()
  const hoje = isoDate(new Date())
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  function agsDia(dia) {
    return agendamentos.filter(a => a.dataHora.startsWith(isoDate(dia)))
  }

  // Earnings do dia
  const agHoje = modo === 'dia' ? agsDia(dataBase) : []
  const ganho = agHoje.filter(a => a.pagamentoStatus === 'pago').reduce((s, a) => s + a.valor, 0)
  const pendente = agHoje.filter(a => a.pagamentoStatus !== 'pago').reduce((s, a) => s + a.valor, 0)
  const pendCount = agHoje.filter(a => a.pagamentoStatus !== 'pago').length

  return (
    <Layout>
      {/* Header */}
      <div className="bg-emerald-700 px-4 pt-10 pb-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-full bg-white/20 text-white font-bold text-xs flex items-center justify-center select-none">
            AP
          </div>
          <p className="text-emerald-200 text-sm font-medium">{saudacao}!</p>
          <Link href="/clientes" className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>
        </div>

        {/* Date nav */}
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => navegar(-1)} className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-white font-bold text-base leading-tight capitalize">
              {modo === 'dia'
                ? dataBase.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
                : `Semana de ${dias[1]?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) || ''}`}
            </h1>
          </div>
          <button onClick={() => navegar(1)} className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex justify-center">
          <div className="flex bg-white/20 rounded-full p-0.5">
            <button
              onClick={() => setModo('dia')}
              className={`px-6 py-1.5 rounded-full text-xs font-semibold transition-all ${modo === 'dia' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white/80'}`}
            >
              Dia
            </button>
            <button
              onClick={() => setModo('semana')}
              className={`px-6 py-1.5 rounded-full text-xs font-semibold transition-all ${modo === 'semana' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white/80'}`}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      {/* Earnings bar */}
      {!loading && modo === 'dia' && agHoje.length > 0 && (
        <div className="flex items-center gap-2 bg-white border-b border-gray-100 px-4 py-2">
          <span className="text-xs font-semibold text-emerald-600">{moeda(ganho)} recebido</span>
          {pendente > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs font-semibold text-amber-500">{moeda(pendente)} pendente</span>
              <div className="ml-auto w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold flex items-center justify-center">
                {pendCount}
              </div>
            </>
          )}
        </div>
      )}

      {/* Day headers — week view */}
      {modo === 'semana' && (
        <div className="bg-white border-b border-gray-100 flex">
          <div className="w-10 flex-shrink-0" />
          {dias.map(dia => {
            const isToday = isoDate(dia) === hoje
            return (
              <div key={isoDate(dia)} className="flex-1 flex flex-col items-center py-2 min-w-0">
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">
                  {DIAS_PT[dia.getDay()]}
                </span>
                <span className={`text-sm font-bold mt-0.5 w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-emerald-600 text-white' : 'text-gray-800'
                }`}>
                  {dia.getDate()}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Calendar grid */}
      <div
        ref={gridRef}
        className="overflow-auto bg-white"
        style={{ height: 'calc(100vh - 260px)', minHeight: 280 }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex" style={{ height: TOTAL_H }}>

            {/* Time labels */}
            <div className="w-10 flex-shrink-0 relative bg-white" style={{ height: TOTAL_H }}>
              {HOURS.map(h => (
                <div
                  key={h}
                  style={{ position: 'absolute', top: (h - START_HOUR) * HOUR_HEIGHT - 7 }}
                  className="w-full pr-1.5 text-right"
                >
                  <span className="text-[10px] text-gray-400 font-medium">{h}h</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {dias.map(dia => {
              const isToday = isoDate(dia) === hoje
              const items = agsDia(dia)
              return (
                <div
                  key={isoDate(dia)}
                  className="flex-1 relative border-l border-gray-100"
                  style={{ height: TOTAL_H, minWidth: modo === 'semana' ? 48 : 0 }}
                >
                  {/* Hoje highlight */}
                  {isToday && <div className="absolute inset-0 bg-emerald-50/40 pointer-events-none" />}

                  {/* Linhas de hora */}
                  {HOURS.map(h => (
                    <div
                      key={h}
                      style={{ position: 'absolute', top: (h - START_HOUR) * HOUR_HEIGHT, left: 0, right: 0 }}
                      className="border-t border-gray-100"
                    />
                  ))}

                  {/* Linhas de meia hora */}
                  {HOURS.map(h => (
                    <div
                      key={`m${h}`}
                      style={{ position: 'absolute', top: (h - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2, left: 0, right: 0 }}
                      className="border-t border-gray-50 border-dashed"
                    />
                  ))}

                  {/* Ponteiro de hora atual */}
                  {isToday && nowPx !== null && (
                    <div
                      style={{ position: 'absolute', top: nowPx, left: -1, right: 0, zIndex: 10 }}
                      className="flex items-center pointer-events-none"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 -ml-1" />
                      <div className="flex-1 border-t-2 border-red-500" />
                    </div>
                  )}

                  {/* Agendamentos */}
                  {items.map(a => {
                    const top = apptTop(a.dataHora)
                    const isPago = a.pagamentoStatus === 'pago'
                    const height = HOUR_HEIGHT - 6
                    return (
                      <Link
                        key={a.id}
                        href={`/agendamentos/${a.id}`}
                        style={{ position: 'absolute', top: top + 2, left: 3, right: 3, height, zIndex: 5 }}
                        className={`rounded-lg border-l-4 overflow-hidden flex flex-col justify-between px-2 py-1 shadow-sm active:opacity-75 transition-opacity ${
                          isPago
                            ? 'bg-emerald-50 border-emerald-500'
                            : 'bg-blue-50 border-blue-400'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className={`text-[11px] font-bold leading-tight ${isPago ? 'text-emerald-700' : 'text-blue-700'}`}>
                            {apptHora(a.dataHora)}
                          </p>
                          <p className="text-[11px] font-semibold text-gray-800 truncate leading-tight">
                            {a.clienteNome}
                          </p>
                          {modo === 'dia' && (
                            <p className="text-[10px] text-gray-500 truncate">{a.servico}</p>
                          )}
                        </div>

                        {/* Quick mark as paid — dia view */}
                        {modo === 'dia' && !isPago && (
                          <button
                            onClick={(e) => marcarPago(e, a.id)}
                            disabled={marcando === a.id}
                            className="self-end flex items-center gap-1 bg-white border border-emerald-200 text-emerald-600 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                          >
                            {marcando === a.id ? (
                              <div className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                Pago
                              </>
                            )}
                          </button>
                        )}
                      </Link>
                    )
                  })}

                  {/* Empty state — dia view */}
                  {modo === 'dia' && items.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                      <p className="text-gray-300 text-xs font-medium">Nenhum agendamento</p>
                      <Link
                        href="/agendamentos/novo"
                        className="pointer-events-auto flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Novo agendamento
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
