import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Link from 'next/link'

function fmt(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)

  async function carregar() {
    setLoading(true)
    const res = await fetch('/api/agendamentos')
    const data = await res.json()
    setAgendamentos(Array.isArray(data) ? data.reverse() : [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function marcarPago(id) {
    await fetch(`/api/agendamentos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagamentoStatus: 'pago', status: 'concluido' }),
    })
    carregar()
  }

  async function remover(id) {
    if (!confirm('Remover agendamento?')) return
    await fetch(`/api/agendamentos/${id}`, { method: 'DELETE' })
    carregar()
  }

  return (
    <Layout>
      {/* Header */}
      <div className="bg-emerald-700 rounded-b-3xl px-5 pt-10 pb-7 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-bold text-xl">Agendamentos</h1>
          <Link
            href="/agendamentos/novo"
            className="flex items-center gap-1.5 bg-white text-emerald-700 font-semibold text-xs px-3 py-2 rounded-xl shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo
          </Link>
        </div>
      </div>

      <div className="px-4 pt-5 max-w-md mx-auto w-full">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Carregando...</p>
          </div>
        )}

        {!loading && agendamentos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p className="text-gray-400 text-sm font-medium">Nenhum agendamento</p>
          </div>
        )}

        <div className="space-y-3">
          {agendamentos.map(a => (
            <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Linha principal */}
              <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                {/* Avatar do serviço */}
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-base select-none">
                  {(a.servico || 'S')[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/agendamentos/${a.id}`} className="font-bold text-gray-900 text-sm hover:text-emerald-700 transition-colors">
                    {a.clienteNome}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{a.servico}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmt(a.dataHora)}</p>
                </div>

                {/* Valor + badge */}
                <div className="flex-shrink-0 text-right">
                  <p className="font-bold text-gray-900 text-sm">R$ {a.valor.toFixed(2)}</p>
                  <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    a.pagamentoStatus === 'pago'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {a.pagamentoStatus === 'pago' ? 'Pago' : 'Pendente'}
                  </span>
                </div>
              </div>

              {/* Barra de ações */}
              <div className="flex items-center gap-2 px-4 pb-3 border-t border-gray-50 pt-2">
                {a.pagamentoStatus !== 'pago' && (
                  <button
                    onClick={() => marcarPago(a.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Marcar pago
                  </button>
                )}

                <Link
                  href={`/agendamentos/${a.id}`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                  </svg>
                  {a.pixCode ? 'Ver Pix' : 'Gerar Pix'}
                </Link>

                <button
                  onClick={() => remover(a.id)}
                  className="flex items-center justify-center ml-auto w-8 h-8 rounded-xl text-red-400 bg-red-50 hover:bg-red-100 transition-colors"
                  title="Excluir"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
