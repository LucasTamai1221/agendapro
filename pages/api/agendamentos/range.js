import { getAgendamentosByRange } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { inicio, fim } = req.query
  if (!inicio || !fim) return res.status(400).json({ error: 'inicio e fim obrigatórios' })
  const data = await getAgendamentosByRange(inicio, fim)
  return res.status(200).json(data)
}
