import { useState } from 'react'
import { useRouter } from 'next/router'
import { PROFISSOES, setProfissao } from '../lib/profissao'

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0) // 0 = welcome, 1 = profissao, 2 = pronto
  const [selecionada, setSelecionada] = useState(null)
  const router = useRouter()

  function confirmarProfissao() {
    setProfissao(selecionada || 'manicure')
    setStep(2)
  }

  function irParaAgendamento() {
    onDone()
    router.push('/agendamentos/novo')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-6 sm:pb-0">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div className="p-7 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Bem-vindo ao AgendaPro</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-7">
              Organize sua agenda, reduza faltas e garanta seus pagamentos via Pix — tudo em um lugar.
            </p>
            <button
              onClick={() => setStep(1)}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-sm shadow-emerald-100"
            >
              Configurar em 30 segundos
            </button>
          </div>
        )}

        {/* Step 1 — Profissao */}
        {step === 1 && (
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Qual é sua profissão?</h2>
            <p className="text-gray-400 text-xs mb-5">Isso personaliza os termos dentro do app.</p>
            <div className="space-y-2 mb-5">
              {PROFISSOES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelecionada(p.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-left transition-all ${
                    selecionada === p.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <span className={`text-sm font-semibold ${selecionada === p.id ? 'text-emerald-700' : 'text-gray-700'}`}>
                    {p.label}
                  </span>
                  <span className="text-xs text-gray-400">{p.cliente} / {p.servico}</span>
                </button>
              ))}
            </div>
            <button
              onClick={confirmarProfissao}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-sm shadow-emerald-100"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 2 — Pronto */}
        {step === 2 && (
          <div className="p-7 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tudo pronto!</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-7">
              Crie seu primeiro agendamento agora e veja como é simples.
            </p>
            <button
              onClick={irParaAgendamento}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-sm shadow-emerald-100 mb-3"
            >
              Criar primeiro agendamento
            </button>
            <button
              onClick={onDone}
              className="w-full text-gray-400 text-sm py-1"
            >
              Fazer isso depois
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
