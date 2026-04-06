import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Link from 'next/link'
import { useRouter } from 'next/router'

function moeda(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmt(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function defaultInicio() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function defaultFim() {
  return new Date().toISOString().split('T')[0]
}

export default function Pendentes() {
  const router = useRouter()
  const [dataInicio, setDataInicio] = useState(defaultInicio)
  const [dataFim, setDataFim] = useState(defaultFim)
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(false)
  const [marcando, setMarcando] = useState(null)

  async function carregar() {
    if (!dataInicio || !dataFim || dataInicio > dataFim) return
    setLoading(true)
    try {
      const inicio = new Date(dataInicio + 'T00:00:00').toISOString()
      const fim = new Date(dataFim + 'T23:59:59').toISOString()
      const res = await fetch(`/api/agendamentos/range?inicio=${inicio}&fim=${fim}`)
      const data = await res.json()
      const lista = Array.isArray(data) ? data : []
      setAgendamentos(lista.filter(a => a.pagamentoStatus !== 'pago'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [dataInicio, dataFim])

  async function marcarPago(id) {
    setMarcando(id)
    try {
      const res = await fetch(`/api/agendamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagamentoStatus: 'pago', status: 'concluido' }),
      })
      if (res.ok) setAgendamentos(prev => prev.filter(a => a.id !== id))
    } finally {
      setMarcando(null)
    }
  }

  const total = agendamentos.reduce((s, a) => s + a.valor, 0)

  return (
    <Layout>
      {/* Header */}
      <div className="bg-amber-500 rounded-b-3xl px-5 pt-10 pb-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-white flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-xl">Pendentes</h1>
            {!loading && agendamentos.length > 0 && (
              <p className="text-amber-100 text-sm font-medium">{moeda(total)} a receber</p>
            )}
          </div>
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
            <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Carregando...</p>
          </div>
        )}

        {!loading && agendamentos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-700 font-semibold text-sm">Nenhum pendente!</p>
              <p className="text-gray-400 text-xs mt-1">Tudo pago neste período.</p>
            </div>
          </div>
        )}

        {!loading && agendamentos.length > 0 && (
          <>
            {/* Banner de total */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Total a receber</p>
                <p className="text-2xl font-bold text-amber-700 mt-0.5">{moeda(total)}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-2xl">
                <span className="text-xl font-bold text-amber-500">{agendamentos.length}</span>
              </div>
            </div>

            {/* Lista */}
            <div className="space-y-3">
              {agendamentos.map(a => (
                <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                    <div className="flex-shrink-0 w-1 self-stretch rounded-full bg-amber-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{a.clienteNome}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{a.servico}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">{fmt(a.dataHora)}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-bold text-gray-900 text-base">R$ {a.valor.toFixed(2)}</p>
                      {a.pixCode ? (
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Pix gerado</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Sem Pix</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 pb-3 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => marcarPago(a.id)}
                      disabled={marcando === a.id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50 px-3 py-2 rounded-xl disabled:opacity-50 transition-opacity"
                    >
                      {marcando === a.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                      Marcar pago
                    </button>
                    <Link
                      href={`/agendamentos/${a.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-2 rounded-xl"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                      </svg>
                      {a.pixCode ? 'Ver Pix' : 'Gerar Pix'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
