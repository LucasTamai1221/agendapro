import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useRouter } from 'next/router'

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  )
}

export default function Clientes() {
  const router = useRouter()
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState({ nome: '', telefone: '', email: '' })
  const [editando, setEditando] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function carregar() {
    const res = await fetch('/api/clientes')
    setClientes(await res.json())
  }

  useEffect(() => { carregar() }, [])

  async function salvar(e) {
    e.preventDefault()
    setLoading(true)
    if (editando) {
      await fetch(`/api/clientes/${editando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setForm({ nome: '', telefone: '', email: '' })
    setEditando(null)
    setShowForm(false)
    await carregar()
    setLoading(false)
  }

  async function remover(id) {
    if (!confirm('Remover cliente?')) return
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
    await carregar()
  }

  function editar(c) {
    setEditando(c.id)
    setForm({ nome: c.nome, telefone: c.telefone || '', email: c.email || '' })
    setShowForm(true)
  }

  function cancelar() {
    setEditando(null)
    setForm({ nome: '', telefone: '', email: '' })
    setShowForm(false)
  }

  return (
    <Layout>
      {/* Top bar */}
      <div className="bg-emerald-700 rounded-b-3xl px-5 pt-10 pb-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-white"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="text-white font-bold text-xl flex-1">Clientes</h1>
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {clientes.length}
          </span>
        </div>

        <button
          onClick={() => { cancelar(); setShowForm(v => !v) }}
          className="w-full flex items-center justify-center gap-2 bg-white text-emerald-700 font-semibold text-sm py-2.5 rounded-xl shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {showForm && !editando ? 'Cancelar' : 'Novo Cliente'}
        </button>
      </div>

      <div className="px-4 pt-5 max-w-md mx-auto w-full">
        {/* Formulário */}
        {(showForm || editando) && (
          <form onSubmit={salvar} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5 space-y-3">
            <h2 className="font-semibold text-gray-900 text-base mb-1">
              {editando ? 'Editar cliente' : 'Novo cliente'}
            </h2>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nome *</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="Nome completo"
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Telefone</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={e => setForm({ ...form, telefone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">E-mail</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="email@exemplo.com"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-opacity"
              >
                {loading ? 'Salvando...' : editando ? 'Atualizar' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={cancelar}
                className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista */}
        <div className="space-y-2">
          {clientes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <p className="text-gray-400 text-sm font-medium">Nenhum cliente cadastrado</p>
            </div>
          )}

          {clientes.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3"
            >
              {/* Avatar */}
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm select-none">
                {getInitials(c.nome)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{c.nome}</p>
                {c.telefone && (
                  <p className="text-xs text-gray-500 truncate">{c.telefone}</p>
                )}
                {c.email && (
                  <p className="text-xs text-gray-400 truncate">{c.email}</p>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => editar(c)}
                  className="flex items-center justify-center w-8 h-8 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                  title="Editar"
                >
                  <PencilIcon />
                </button>
                <button
                  onClick={() => remover(c.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
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
