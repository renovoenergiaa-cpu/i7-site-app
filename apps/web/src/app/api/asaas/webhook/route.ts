import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function timingSafeMatch(a: string | null, b: string | undefined): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || `wh-asaas-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const webhookToken = process.env.ASAAS_WEBHOOK_ACCESS_TOKEN;
  
  if (webhookToken) {
    const receivedToken = request.headers.get('asaas-access-token') || '';
    if (!timingSafeMatch(receivedToken, webhookToken)) {
      console.warn(`[Asaas Webhook] Token inválido ou divergente recebido (correlation: ${correlationId})`);
      return NextResponse.json(
        { error: 'Unauthorized webhook caller' },
        { status: 401, headers: { 'x-correlation-id': correlationId } }
      );
    }
  }


  try {
    const body = await request.json();
    const event = body.event;
    const payment = body.payment;

    console.info(`[Asaas Webhook] Evento: ${event} | Pagamento: ${payment?.id} | Valor: ${payment?.value} (correlation: ${correlationId})`);

    // Resposta idempotente e imediata ao gateway
    return NextResponse.json(
      {
        received: true,
        correlationId,
        event,
        paymentId: payment?.id,
        status: payment?.status,
        timestamp: new Date().toISOString()
      },
      { status: 200, headers: { 'x-correlation-id': correlationId } }
    );
  } catch (err: any) {
    console.error(`[Asaas Webhook] Erro ao processar payload:`, err);
    return NextResponse.json(
      { error: err.message || 'Payload de webhook inválido' },
      { status: 400, headers: { 'x-correlation-id': correlationId } }
    );
  }
}
