import { v4 as uuidv4 } from 'uuid'
import { getAgendamentos, saveAgendamento } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data } = req.query
    const filtros = data ? (Array.isArray(data) ? data : [data]) : []
    const agendamentos = await getAgendamentos(filtros)
    return res.status(200).json(agendamentos)
  }

  if (req.method === 'POST') {
    const { clienteId, clienteNome, servico, valor, dataHora } = req.body

    if (!servico || !valor || !dataHora) {
      return res.status(400).json({ error: 'servico, valor e dataHora são obrigatórios' })
    }

    const agendamento = await saveAgendamento({
      id: uuidv4(),
      clienteId: clienteId || null,
      clienteNome: clienteNome || 'Cliente avulso',
      servico,
      valor: parseFloat(valor),
      dataHora: new Date(dataHora),
      status: 'agendado',
      pagamentoStatus: 'pendente',
    })

    console.log('[agendamentos] criado:', agendamento.id)
    return res.status(201).json(agendamento)
  }

  res.status(405).end()
}
