import prisma from './prisma'

// ── Clientes ──────────────────────────────────────────────

export async function getClientes() {
  return prisma.cliente.findMany({ orderBy: { criadoEm: 'desc' } })
}

export async function getClienteById(id) {
  return prisma.cliente.findUnique({ where: { id } })
}

export async function saveCliente(data) {
  return prisma.cliente.create({ data })
}

export async function updateCliente(id, data) {
  return prisma.cliente.update({ where: { id }, data }).catch(() => null)
}

export async function deleteCliente(id) {
  return prisma.cliente.delete({ where: { id } }).catch(() => null)
}

// ── Agendamentos ──────────────────────────────────────────

export async function getAgendamentos(dataFiltros) {
  const where = dataFiltros?.length
    ? {
        OR: dataFiltros.map(data => ({
          dataHora: {
            gte: new Date(`${data}T00:00:00`),
            lte: new Date(`${data}T23:59:59`),
          },
        })),
      }
    : {}

  return prisma.agendamento.findMany({
    where,
    orderBy: { dataHora: 'asc' },
  })
}

export async function getAgendamentoById(id) {
  return prisma.agendamento.findUnique({ where: { id } })
}

export async function saveAgendamento(data) {
  return prisma.agendamento.create({ data })
}

export async function updateAgendamento(id, data) {
  return prisma.agendamento.update({ where: { id }, data }).catch(() => null)
}

export async function deleteAgendamento(id) {
  return prisma.agendamento.delete({ where: { id } }).catch(() => null)
}

export async function getAgendamentosByRange(inicio, fim) {
  return prisma.agendamento.findMany({
    where: { dataHora: { gte: new Date(inicio), lte: new Date(fim) } },
    orderBy: { dataHora: 'asc' },
  })
}

export async function getAgendamentoByPagamentoId(pagamentoId) {
  return prisma.agendamento.findFirst({ where: { pagamentoId } })
}

export async function getResumoMensal(mes, ano) {
  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 1)

  const agendamentos = await prisma.agendamento.findMany({
    where: { dataHora: { gte: inicio, lt: fim } },
    select: { valor: true, pagamentoStatus: true },
  })

  const totalAgendamentos = agendamentos.length
  const totalPago = agendamentos
    .filter(a => a.pagamentoStatus === 'pago')
    .reduce((s, a) => s + a.valor, 0)
  const totalPendente = agendamentos
    .filter(a => a.pagamentoStatus === 'pendente')
    .reduce((s, a) => s + a.valor, 0)
  const totalGeral = agendamentos.reduce((s, a) => s + a.valor, 0)

  return { totalAgendamentos, totalPago, totalPendente, totalGeral }
}
