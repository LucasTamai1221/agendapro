import { v4 as uuidv4 } from 'uuid'
import { getClientes, saveCliente } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const clientes = await getClientes()
    return res.status(200).json(clientes)
  }

  if (req.method === 'POST') {
    const { nome, telefone, email } = req.body

    if (!nome) return res.status(400).json({ error: 'Nome obrigatório' })

    const cliente = await saveCliente({
      id: uuidv4(),
      nome,
      telefone: telefone || '',
      email: email || '',
    })

    console.log('[clientes] criado:', cliente.id)
    return res.status(201).json(cliente)
  }

  res.status(405).end()
}
