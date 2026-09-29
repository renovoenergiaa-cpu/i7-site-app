import { NextRequest, NextResponse } from 'next/server';

function resolveAsaasConfig(request: NextRequest) {
  const headerKey = request.headers.get('x-asaas-api-key');
  const apiKey = (headerKey && headerKey !== 'configurado_no_painel') 
    ? headerKey 
    : (process.env.ASAAS_API_KEY || '');

  const headerEnv = request.headers.get('x-asaas-env');
  const env = (headerEnv === 'SANDBOX' || process.env.ASAAS_ENVIRONMENT === 'SANDBOX') 
    ? 'SANDBOX' 
    : 'PRODUCTION';

  const defaultUrl = env === 'SANDBOX' ? 'https://sandbox.asaas.com/api/v3' : 'https://api.asaas.com/v3';
  const apiUrl = process.env.ASAAS_API_URL || defaultUrl;

  return { apiKey, apiUrl, env };
}

function getHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    'access_token': apiKey,
  };
}

// GET: Retorna saldo, status da conta ou lista de cobranças com correlationId
export async function GET(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const { apiKey, apiUrl, env } = resolveAsaasConfig(request);

  if (!apiKey) {
    return NextResponse.json(
      {
        connected: false,
        environment: env,
        balance: 0,
        message: 'Chave de API do Asaas não configurada. Defina em Configurações ou em ASAAS_API_KEY.',
        apiKeyConfigured: false,
      },
      { headers: { 'x-correlation-id': correlationId } }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'overview';

    if (action === 'balance') {
      const res = await fetch(`${apiUrl}/finance/balance`, {
        headers: getHeaders(apiKey),
        cache: 'no-store'
      });
      const data = await res.json();
      return NextResponse.json(data, { 
        status: res.status,
        headers: { 'x-correlation-id': correlationId }
      });
    }

    if (action === 'payments') {
      const res = await fetch(`${apiUrl}/payments?limit=20`, {
        headers: getHeaders(apiKey),
        cache: 'no-store'
      });
      const data = await res.json();
      return NextResponse.json(data, { 
        status: res.status,
        headers: { 'x-correlation-id': correlationId }
      });
    }

    // Overview: Busca saldo e status da conta simultaneamente
    const [balanceRes, accountRes] = await Promise.all([
      fetch(`${apiUrl}/finance/balance`, { headers: getHeaders(apiKey), cache: 'no-store' }),
      fetch(`${apiUrl}/myAccount/status`, { headers: getHeaders(apiKey), cache: 'no-store' })
    ]);

    if (!balanceRes.ok) {
      const errData = await balanceRes.json().catch(() => ({}));
      return NextResponse.json({
        connected: false,
        environment: env,
        balance: 0,
        message: errData.errors?.[0]?.description || 'Falha ao autenticar na API Asaas',
        accountStatus: null,
        apiKeyConfigured: true
      }, { headers: { 'x-correlation-id': correlationId } });
    }

    const balance = await balanceRes.json().catch(() => ({ balance: 0 }));
    const account = await accountRes.json().catch(() => ({}));

    return NextResponse.json({
      connected: true,
      environment: env,
      balance: balance.balance ?? 0,
      accountStatus: account,
      apiKeyConfigured: true
    }, { headers: { 'x-correlation-id': correlationId } });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao conectar à API do Asaas' },
      { status: 500, headers: { 'x-correlation-id': correlationId } }
    );
  }
}

// POST: Cria cliente ou emite cobrança real
export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const { apiKey, apiUrl, env } = resolveAsaasConfig(request);

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Chave de API do Asaas não informada. Verifique as configurações.' },
      { status: 400, headers: { 'x-correlation-id': correlationId } }
    );
  }

  try {
    const body = await request.json();
    const { customerName, customerEmail, customerCpfCnpj, value, dueDate, description } = body;

    if (!customerName || !value || Number(value) <= 0) {
      return NextResponse.json(
        { error: 'Nome do cliente e valor da cobrança são obrigatórios.' },
        { status: 400, headers: { 'x-correlation-id': correlationId } }
      );
    }

    // 1. Cria ou busca cliente no Asaas
    const customerRes = await fetch(`${apiUrl}/customers`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({
        name: customerName,
        email: customerEmail || undefined,
        cpfCnpj: customerCpfCnpj || '000.000.000-00',
        notificationDisabled: false
      })
    });
    const customerData = await customerRes.json();
    const customerId = customerData.id;

    if (!customerId) {
      const errMsg = customerData.errors?.[0]?.description || 'Não foi possível registrar o cliente no Asaas';
      return NextResponse.json(
        { error: errMsg, details: customerData },
        { status: 400, headers: { 'x-correlation-id': correlationId } }
      );
    }

    // 2. Emite a cobrança com PIX e Boleto
    const paymentRes = await fetch(`${apiUrl}/payments`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({
        customer: customerId,
        billingType: 'UNDEFINED', // Permite que o cliente pague por PIX ou Boleto
        value: Number(value),
        dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        description: description || 'Aluguel & Taxas Condominiais i7',
        postalService: false
      })
    });
    const paymentData = await paymentRes.json();

    if (!paymentRes.ok || !paymentData.id) {
      const errMsg = paymentData.errors?.[0]?.description || 'Erro ao gerar cobrança no Asaas';
      return NextResponse.json(
        { error: errMsg, details: paymentData },
        { status: 400, headers: { 'x-correlation-id': correlationId } }
      );
    }

    // 3. Busca o QR Code PIX da cobrança gerada
    let pixData = null;
    if (paymentData.id) {
      const pixRes = await fetch(`${apiUrl}/payments/${paymentData.id}/pixQrCode`, {
        headers: getHeaders(apiKey)
      }).catch(() => null);
      if (pixRes && pixRes.ok) {
        pixData = await pixRes.json();
      }
    }

    return NextResponse.json({
      success: true,
      environment: env,
      payment: paymentData,
      pix: pixData
    }, { headers: { 'x-correlation-id': correlationId } });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao processar cobrança no Asaas' },
      { status: 500, headers: { 'x-correlation-id': correlationId } }
    );
  }
}
