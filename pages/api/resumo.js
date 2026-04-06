import { getResumoMensal } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const agora = new Date()
  const mes = parseInt(req.query.mes) || agora.getMonth() + 1
  const ano = parseInt(req.query.ano) || agora.getFullYear()

  const resumo = await getResumoMensal(mes, ano)

  return res.status(200).json({ mes, ano, ...resumo })
}
