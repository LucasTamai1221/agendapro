import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { getProfissao } from '../../lib/profissao'

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  )
}

export default function NovoAgendamento() {
  const router = useRouter()
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState({
    clienteId: '',
    clienteNome: '',
    servico: '',
    valor: '',
    dataHora: '',
  })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [labels, setLabels] = useState({ cliente: 'Cliente', servico: 'Serviço' })

  useEffect(() => {
    fetch('/api/clientes').then(r => r.json()).then(setClientes)
    setLabels(getProfissao())
  }, [])

  function handleCliente(e) {
    const id = e.target.value
    const c = clientes.find(c => c.id === id)
    setForm({ ...form, clienteId: id, clienteNome: c ? c.nome : '' })
  }

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const res = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          clienteNome: form.clienteNome || 'Cliente avulso',
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setErro(data.error || 'Erro ao salvar')
        return
      }
      const novo = await res.json()
      router.push(`/agendamentos/${novo.id}`)
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-white font-bold text-xl">Novo Agendamento</h1>
        </div>
      </div>

      <div className="px-4 pt-5 max-w-md mx-auto w-full">
        <form onSubmit={salvar} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">

          {/* Cliente */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              {labels.cliente}
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition pr-9"
                value={form.clienteId}
                onChange={handleCliente}
              >
                <option value="">Cliente avulso</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Nome avulso */}
          {!form.clienteId && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Nome do cliente
              </label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="Ex: João Silva"
                value={form.clienteNome}
                onChange={e => setForm({ ...form, clienteNome: e.target.value })}
              />
            </div>
          )}

          {/* Serviço */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              {labels.servico} *
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder={`Ex: ${labels.servico}`}
              value={form.servico}
              onChange={e => setForm({ ...form, servico: e.target.value })}
              required
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Valor (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium select-none">
                R$
              </span>
              <input
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={form.valor}
                onChange={e => setForm({ ...form, valor: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Data e Hora */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Data e Hora *
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              type="datetime-local"
              value={form.dataHora}
              onChange={e => setForm({ ...form, dataHora: e.target.value })}
              required
            />
          </div>

          {/* Erro */}
          {erro && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-red-600 text-xs font-medium">{erro}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-60 transition-opacity shadow-sm shadow-emerald-100"
          >
            {loading ? 'Salvando...' : 'Criar Agendamento'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
