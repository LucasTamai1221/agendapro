import { getAgendamentoById, updateAgendamento, deleteAgendamento } from '../../../lib/db'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    const agendamento = await getAgendamentoById(id)
    if (!agendamento) return res.status(404).json({ error: 'Não encontrado' })
    return res.status(200).json(agendamento)
  }

  if (req.method === 'PUT') {
    const data = { ...req.body }
    if (data.dataHora) data.dataHora = new Date(data.dataHora)
    const updated = await updateAgendamento(id, data)
    if (!updated) return res.status(404).json({ error: 'Não encontrado' })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    await deleteAgendamento(id)
    return res.status(204).end()
  }

  res.status(405).end()
}
