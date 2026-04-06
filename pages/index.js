import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getProfissao } from '../lib/profissao'

function fmt(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function fmtData(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

function fmtDataLonga(d) {
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

function isoDate(d) {
  return d.toISOString().split('T')[0]
}

function moeda(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  )
}

function QrIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}

export default function Agenda() {
  const [modo, setModo] = useState('dia')
  const [dataBase, setDataBase] = useState(new Date())
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(false)
  const [marcando, setMarcando] = useState(null) // id do agendamento sendo marcado
  const [labels, setLabels] = useState({ cliente: 'Cliente', servico: 'Serviço' })
  const router = useRouter()

  useEffect(() => {
    setLabels(getProfissao())
  }, [])

  function getDias() {
    if (modo === 'dia') return [new Date(dataBase)]
    const dias = []
    const inicio = new Date(dataBase)
    const dow = inicio.getDay()
    inicio.setDate(inicio.getDate() - dow)
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicio)
      d.setDate(inicio.getDate() + i)
      dias.push(d)
    }
    return dias
  }

  useEffect(() => {
    setLoading(true)
    const dias = getDias()
    const params = dias.map(d => `data=${isoDate(d)}`).join('&')
    fetch(`/api/agendamentos?${params}`)
      .then(r => r.json())
      .then(data => {
        setAgendamentos(Array.isArray(data) ? data : [])
      })
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

  function agendamentosDoDia(dia) {
    const prefixo = isoDate(dia)
    return agendamentos.filter(a => a.dataHora.startsWith(prefixo))
  }

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  // Earnings bar — only for day view
  const hoje = isoDate(new Date())
  const isHoje = modo === 'dia' && isoDate(dataBase) === hoje
  const agendamentosHoje = agendamentos.filter(a => a.dataHora.startsWith(isoDate(dataBase)))
  const ganhoHoje = agendamentosHoje.filter(a => a.pagamentoStatus === 'pago').reduce((s, a) => s + a.valor, 0)
  const pendenteHoje = agendamentosHoje.filter(a => a.pagamentoStatus !== 'pago').reduce((s, a) => s + a.valor, 0)
  const pendentesCount = agendamentosHoje.filter(a => a.pagamentoStatus !== 'pago').length

  return (
    <Layout>
      {/* Header verde */}
      <div className="bg-emerald-700 rounded-b-3xl px-5 pt-10 pb-8 shadow-md">
        {/* Row: avatar + ícones */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white font-bold text-sm select-none">
            AP
          </div>
          <div className="flex items-center gap-3">
            <Link href="/clientes" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Saudação */}
        <div className="mb-5">
          <p className="text-emerald-200 text-sm font-medium">{saudacao}!</p>
          <h1 className="text-white text-2xl font-bold leading-tight">
            {modo === 'dia'
              ? fmtDataLonga(dataBase)
              : `Semana de ${fmtData(dias[0].toISOString())}`}
          </h1>
        </div>

        {/* Pill toggle Dia / Semana + navegação */}
        <div className="flex items-center justify-between">
          <div className="flex bg-white/20 rounded-full p-1 gap-1">
            <button
              onClick={() => setModo('dia')}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                modo === 'dia' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white/80'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setModo('semana')}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                modo === 'semana' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white/80'
              }`}
            >
              Semana
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navegar(-1)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => navegar(1)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="px-4 pt-4 max-w-md mx-auto w-full">

        {/* Earnings bar — dia view com agendamentos */}
        {!loading && modo === 'dia' && agendamentosHoje.length > 0 && (
          <div className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                {isHoje ? 'Hoje' : fmtData(dataBase.toISOString())}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-emerald-600">{moeda(ganhoHoje)} recebido</span>
                {pendenteHoje > 0 && (
                  <>
                    <span className="text-gray-200">·</span>
                    <span className="text-sm font-semibold text-amber-500">{moeda(pendenteHoje)} pendente</span>
                  </>
                )}
              </div>
            </div>
            {pendentesCount > 0 && (
              <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold">
                {pendentesCount}
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Carregando...</p>
          </div>
        )}

        {!loading && dias.map(dia => {
          const items = agendamentosDoDia(dia)
          return (
            <div key={isoDate(dia)} className="mb-5">
              {modo === 'semana' && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                  {fmtData(dia.toISOString())}
                </p>
              )}

              {items.length === 0 ? (
                modo === 'semana' ? (
                  <p className="text-xs text-gray-300 pl-2 pb-1">sem agendamentos</p>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm font-medium">Nenhum agendamento</p>
                      <p className="text-gray-300 text-xs mt-0.5">Toque em + para adicionar</p>
                    </div>
                    <Link
                      href="/agendamentos/novo"
                      className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-semibold text-sm shadow-sm shadow-emerald-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Novo agendamento
                    </Link>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  {items.map(a => (
                    <Link
                      key={a.id}
                      href={`/agendamentos/${a.id}`}
                      className="flex items-center bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 gap-3 active:scale-[0.99] transition-transform"
                    >
                      {/* Horário */}
                      <div className="flex-shrink-0 w-14">
                        <p className="text-sm font-bold text-emerald-600">{fmt(a.dataHora)}</p>
                      </div>

                      {/* Divisor */}
                      <div className="w-px h-8 bg-gray-100 flex-shrink-0" />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{a.clienteNome}</p>
                        <p className="text-xs text-gray-500 truncate">{a.servico}</p>
                      </div>

                      {/* Ações à direita */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {a.pagamentoStatus === 'pago' ? (
                          <CheckCircleIcon />
                        ) : (
                          <>
                            {a.pixCode && <QrIcon />}
                            {/* Quick mark as paid */}
                            <button
                              onClick={(e) => marcarPago(e, a.id)}
                              disabled={marcando === a.id}
                              className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 active:scale-95 transition-transform disabled:opacity-50"
                              title="Marcar como pago"
                            >
                              {marcando === a.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </button>
                          </>
                        )}
                        <ChevronRightIcon />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* CTAs */}
        {!loading && (
          <div className="flex gap-3 mt-2 pb-4">
            <Link
              href="/clientes"
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-2xl font-semibold text-sm shadow-sm shadow-emerald-100 active:scale-[0.98] transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              {labels.cliente}s
            </Link>
            <Link
              href="/agendamentos/novo"
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-2xl font-semibold text-sm shadow-sm shadow-orange-100 active:scale-[0.98] transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z" />
              </svg>
              Agendar
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}
