import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'

function fmt(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  )
}

export default function DetalheAgendamento() {
  const router = useRouter()
  const { id } = router.query
  const [ag, setAg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [erro, setErro] = useState('')

  async function carregar() {
    if (!id) return
    const res = await fetch(`/api/agendamentos/${id}`)
    if (res.ok) setAg(await res.json())
    setLoading(false)
  }

  useEffect(() => { carregar() }, [id])

  async function gerarPix() {
    setGerando(true)
    setErro('')
    const res = await fetch('/api/pagamentos/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agendamentoId: id }),
    })
    const data = await res.json()
    if (!res.ok) {
      setErro(data.error || 'Erro ao gerar Pix')
    } else {
      setAg(data)
    }
    setGerando(false)
  }

  async function marcarPago() {
    const res = await fetch(`/api/agendamentos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagamentoStatus: 'pago', status: 'concluido' }),
    })
    if (res.ok) setAg(await res.json())
  }

  function copiar() {
    navigator.clipboard.writeText(ag.pixCode)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      </Layout>
    )
  }

  if (!ag) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
          <p className="text-gray-400 text-sm">Agendamento não encontrado.</p>
          <button onClick={() => router.back()} className="text-emerald-600 text-sm font-medium">Voltar</button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <div className="bg-emerald-700 rounded-b-3xl px-5 pt-10 pb-7 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-white"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="text-white font-bold text-xl">Detalhes</h1>
        </div>
      </div>

      <div className="px-4 pt-5 max-w-md mx-auto w-full space-y-3">
        {/* Banner pago */}
        {ag.pagamentoStatus === 'pago' && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-emerald-800 font-semibold text-sm">Pagamento confirmado</p>
              <p className="text-emerald-600 text-xs">Este agendamento está pago</p>
            </div>
          </div>
        )}

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-lg leading-tight">{ag.clienteNome}</h2>
              <p className="text-emerald-600 font-medium text-sm mt-0.5">{ag.servico}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p className="font-bold text-gray-900 text-xl">R$ {ag.valor.toFixed(2)}</p>
              <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                ag.pagamentoStatus === 'pago'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {ag.pagamentoStatus === 'pago' ? 'Pago' : 'Pendente'}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Data e hora */}
            <div className="flex items-start gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <p className="text-gray-600 text-sm capitalize">{fmt(ag.dataHora)}</p>
            </div>

            {/* Status do agendamento */}
            <div className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                ag.status === 'concluido'
                  ? 'bg-blue-100 text-blue-700'
                  : ag.status === 'cancelado'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {ag.status === 'agendado' ? 'Agendado' : ag.status === 'concluido' ? 'Concluído' : 'Cancelado'}
              </span>
            </div>
          </div>
        </div>

        {/* Seção Pix — só se não pago */}
        {ag.pagamentoStatus !== 'pago' && (
          <div className="space-y-3">
            {!ag.pixCode ? (
              <button
                onClick={gerarPix}
                disabled={gerando}
                className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm disabled:opacity-60 shadow-sm shadow-emerald-100 transition-opacity"
              >
                {gerando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Gerando Pix...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                    </svg>
                    Gerar Pix
                  </>
                )}
              </button>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-sm font-bold text-gray-900">Pix gerado</p>
                </div>

                {ag.pixQrCodeUrl && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={ag.pixQrCodeUrl}
                      alt="QR Code Pix"
                      className="w-52 h-52 rounded-xl border border-gray-100 shadow-sm"
                    />
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
                  <p className="text-[11px] text-gray-500 break-all font-mono leading-relaxed">{ag.pixCode}</p>
                </div>

                <button
                  onClick={copiar}
                  className={`w-full flex items-center justify-center gap-2 border py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    copiado
                      ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {copiado ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                      </svg>
                      Copiado!
                    </>
                  ) : (
                    <>
                      <CopyIcon />
                      Copiar código Pix
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Marcar pago manualmente */}
            <button
              onClick={marcarPago}
              className="w-full flex items-center justify-center gap-2 border border-emerald-200 text-emerald-700 py-3 rounded-2xl text-sm font-semibold hover:bg-emerald-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Marcar como Pago manualmente
            </button>
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-red-600 text-sm">{erro}</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
