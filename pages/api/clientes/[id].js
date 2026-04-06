import { getClienteById, updateCliente, deleteCliente } from '../../../lib/db'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    const cliente = await getClienteById(id)
    if (!cliente) return res.status(404).json({ error: 'Não encontrado' })
    return res.status(200).json(cliente)
  }

  if (req.method === 'PUT') {
    const updated = await updateCliente(id, req.body)
    if (!updated) return res.status(404).json({ error: 'Não encontrado' })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    await deleteCliente(id)
    return res.status(204).end()
  }

  res.status(405).end()
}
