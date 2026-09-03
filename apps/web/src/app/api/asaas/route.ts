import { NextRequest, NextResponse } from 'next/server';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';
const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';

// Helper de cabeçalhos de autenticação oficial do Asaas
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'access_token': ASAAS_API_KEY,
  };
}

// GET: Retorna saldo, status da conta e lista de cobranças
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'overview';

    if (action === 'balance') {
      const res = await fetch(`${ASAAS_API_URL}/finance/balance`, {
        headers: getHeaders(),
        cache: 'no-store'
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    if (action === 'payments') {
      const res = await fetch(`${ASAAS_API_URL}/payments?limit=20`, {
        headers: getHeaders(),
        cache: 'no-store'
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    // Overview: Busca saldo e status da conta simultaneamente
    const [balanceRes, accountRes] = await Promise.all([
      fetch(`${ASAAS_API_URL}/finance/balance`, { headers: getHeaders(), cache: 'no-store' }),
      fetch(`${ASAAS_API_URL}/myAccount/status`, { headers: getHeaders(), cache: 'no-store' })
    ]);

    const balance = await balanceRes.json().catch(() => ({ balance: 0 }));
    const account = await accountRes.json().catch(() => ({}));

    return NextResponse.json({
      connected: true,
      environment: 'PRODUCTION',
      balance: balance.balance ?? 0,
      accountStatus: account,
      apiKeyConfigured: true
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao conectar à API do Asaas' },
      { status: 500 }
    );
  }
}

// POST: Cria cliente ou emite cobrança real
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, customerCpfCnpj, value, dueDate, description } = body;

    // 1. Cria ou busca cliente no Asaas
    const customerRes = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: customerName,
        email: customerEmail,
        cpfCnpj: customerCpfCnpj || '000.000.000-00',
        notificationDisabled: false
      })
    });
    const customerData = await customerRes.json();
    const customerId = customerData.id;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Não foi possível registrar o cliente no Asaas', details: customerData },
        { status: 400 }
      );
    }

    // 2. Emite a cobrança com PIX e Boleto
    const paymentRes = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
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

    // 3. Busca o QR Code PIX da cobrança gerada
    let pixData = null;
    if (paymentData.id) {
      const pixRes = await fetch(`${ASAAS_API_URL}/payments/${paymentData.id}/pixQrCode`, {
        headers: getHeaders()
      }).catch(() => null);
      if (pixRes && pixRes.ok) {
        pixData = await pixRes.json();
      }
    }

    return NextResponse.json({
      success: true,
      payment: paymentData,
      pix: pixData
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao processar cobrança no Asaas' },
      { status: 500 }
    );
  }
}
