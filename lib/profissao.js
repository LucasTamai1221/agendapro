export const PROFISSOES = [
  { id: 'manicure', label: 'Manicure / Estética', cliente: 'Cliente', servico: 'Atendimento' },
  { id: 'personal', label: 'Personal Trainer', cliente: 'Aluno', servico: 'Sessão' },
  { id: 'freelancer', label: 'Freelancer / Designer', cliente: 'Cliente', servico: 'Projeto' },
  { id: 'outro', label: 'Outro', cliente: 'Cliente', servico: 'Serviço' },
]

export function getProfissao() {
  if (typeof window === 'undefined') return PROFISSOES[0]
  const id = localStorage.getItem('agendapro_profissao') || 'manicure'
  return PROFISSOES.find(p => p.id === id) || PROFISSOES[0]
}

export function setProfissao(id) {
  localStorage.setItem('agendapro_profissao', id)
  localStorage.setItem('agendapro_onboarding', '1')
}

export function isOnboardingDone() {
  if (typeof window === 'undefined') return true
  return !!localStorage.getItem('agendapro_onboarding')
}
