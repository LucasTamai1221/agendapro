const BASE_URL = 'https://api.abacatepay.com/v1'

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${process.env.ABACATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('[abacatepay] error:', data)
    throw new Error(data.message || 'AbacatePay error')
  }

  return data
}

export async function criarCobrancaPix({ valor, descricao, clienteNome, clienteEmail, clienteTelefone, externalId }) {
  console.log('[abacatepay] criando cobranca pix', { valor, externalId })

  const payload = {
    amount: Math.round(valor * 100), // centavos
    description: descricao,
    externalId,
    customer: {
      name: clienteNome,
      email: clienteEmail,
      cellphone: clienteTelefone,
    },
    methods: ['PIX'],
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/agendamentos`,
    completionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/agendamentos`,
  }

  const data = await request('POST', '/billing/create', payload)

  console.log('[abacatepay] cobranca criada:', data.data?.id)

  return {
    pagamentoId: data.data?.id,
    pixCode: data.data?.pixQrCode,
    pixQrCodeUrl: data.data?.pixQrCodeImage,
    status: data.data?.status,
  }
}

export function verificarAssinatura(rawBody, signature) {
  // AbacatePay envia header 'x-webhook-secret'
  return signature === process.env.ABACATE_WEBHOOK_SECRET
}
