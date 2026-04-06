import { getAgendamentoById, updateAgendamento } from '../../../lib/db'
import { criarCobrancaPix } from '../../../lib/abacatepay'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { agendamentoId } = req.body

  if (!agendamentoId) return res.status(400).json({ error: 'agendamentoId obrigatório' })

  const agendamento = await getAgendamentoById(agendamentoId)

  if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' })

  if (agendamento.pagamentoStatus === 'pago') {
    return res.status(400).json({ error: 'Agendamento já pago' })
  }

  try {
    const cobranca = await criarCobrancaPix({
      valor: agendamento.valor,
      descricao: `${agendamento.servico} - ${agendamento.clienteNome}`,
      clienteNome: agendamento.clienteNome,
      clienteEmail: 'cliente@agendapro.com',
      clienteTelefone: '11999999999',
      externalId: agendamento.id,
    })

    const updated = await updateAgendamento(agendamentoId, {
      pagamentoId: cobranca.pagamentoId,
      pixCode: cobranca.pixCode,
      pixQrCodeUrl: cobranca.pixQrCodeUrl,
    })

    console.log('[pagamentos] pix gerado para agendamento:', agendamentoId)
    return res.status(200).json(updated)
  } catch (err) {
    console.error('[pagamentos] erro ao gerar pix:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
