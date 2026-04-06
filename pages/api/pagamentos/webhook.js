import { getAgendamentoByPagamentoId, updateAgendamento } from '../../../lib/db'
import { verificarAssinatura } from '../../../lib/abacatepay'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = await getRawBody(req)
  const signature = req.headers['x-webhook-secret'] || ''

  if (!verificarAssinatura(rawBody, signature)) {
    console.warn('[webhook] assinatura inválida')
    return res.status(401).json({ error: 'Assinatura inválida' })
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return res.status(400).json({ error: 'Payload inválido' })
  }

  console.log('[webhook] evento recebido:', payload.event, payload.data?.id)

  const event = payload.event
  const pagamentoId = payload.data?.id
  const status = payload.data?.status

  if (!pagamentoId) return res.status(400).json({ error: 'pagamentoId ausente' })

  if (event === 'billing.paid' || status === 'PAID') {
    const agendamento = await getAgendamentoByPagamentoId(pagamentoId)

    if (!agendamento) {
      console.warn('[webhook] agendamento não encontrado para pagamentoId:', pagamentoId)
      return res.status(200).json({ received: true })
    }

    await updateAgendamento(agendamento.id, {
      pagamentoStatus: 'pago',
      status: 'concluido',
    })

    console.log('[webhook] agendamento marcado como pago:', agendamento.id)
  }

  return res.status(200).json({ received: true })
}
