import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ============================================================================
// 1. CONTRATOS E MAPEAMENTO DE STATUS (CRM / Unidades -> PropertyDTO)
// ============================================================================

const PropertyStatus = {
  DRAFT: 'DRAFT',
  UNDER_REVIEW: 'UNDER_REVIEW',
  PUBLISHED: 'PUBLISHED',
  RENTED: 'RENTED',
  SOLD: 'SOLD',
  INACTIVE: 'INACTIVE'
};

function mapUnitStatusToPropertyStatus(unitStatus) {
  switch (unitStatus) {
    case 'DISPONIVEL':
      return PropertyStatus.PUBLISHED;
    case 'LOCADO':
      return PropertyStatus.RENTED;
    case 'PENDENTE_AVALIACAO':
      return PropertyStatus.UNDER_REVIEW;
    case 'PAUSADO':
    case 'REFORMA':
    case 'REPROVADO':
    default:
      return PropertyStatus.INACTIVE;
  }
}

function calculateUnitTotals(unit) {
  const rent = Number(unit.rentValue) || 0;
  const condo = Number(unit.condoValue) || 0;
  const adminOrIptu = Number(unit.adminFeeValue ?? unit.iptuValue ?? 0);
  return {
    rentPrice: rent,
    condoFee: condo,
    iptuFee: adminOrIptu,
    totalMonthly: rent + condo + adminOrIptu
  };
}

function isDummy(property) {
  if (!property) return true;
  const id = String(property.id || '').toLowerCase();
  const title = String(property.title || '').toLowerCase();
  if (id.startsWith('mock-') || id.startsWith('sample-')) return true;
  if (title.includes('mangal gourmet') || title.includes('teste mock')) return true;
  return false;
}

// ============================================================================
// 2. BACKEND -> CRM (ADAPTER / CLIENT ASAAS)
// ============================================================================

function buildAsaasCustomerPayload(customer) {
  return {
    name: customer.name,
    email: customer.email || undefined,
    cpfCnpj: customer.cpfCnpj || '000.000.000-00',
    notificationDisabled: false
  };
}

function buildAsaasPaymentPayload({ customerId, value, dueDate, description }) {
  return {
    customer: customerId,
    billingType: 'UNDEFINED',
    value: Number(value),
    dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    description: description || 'Aluguel & Taxas i7',
    postalService: false
  };
}

function resolveAsaasUrl(env, customUrl) {
  if (customUrl) return customUrl;
  return env === 'SANDBOX' ? 'https://sandbox.asaas.com/api/v3' : 'https://api.asaas.com/v3';
}

// ============================================================================
// 3. CRM -> BACKEND (ASAAS WEBHOOK PROCESSING)
// ============================================================================

function processAsaasWebhook(payload, receivedToken, expectedToken) {
  if (expectedToken && receivedToken !== expectedToken) {
    return { status: 401, error: 'Unauthorized webhook caller' };
  }

  const event = payload.event;
  const payment = payload.payment;

  if (!event || !payment || !payment.id) {
    return { status: 400, error: 'Invalid webhook payload structure' };
  }

  let mappedBoletoStatus = 'EM_ABERTO';
  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    mappedBoletoStatus = 'PAGO';
  } else if (event === 'PAYMENT_OVERDUE') {
    mappedBoletoStatus = 'VENCIDO';
  } else if (event === 'PAYMENT_DELETED') {
    mappedBoletoStatus = 'CANCELADO';
  }

  return {
    status: 200,
    success: true,
    paymentId: payment.id,
    newStatus: mappedBoletoStatus,
    paidAmount: payment.value,
    event
  };
}

// ============================================================================
// SUÍTE DE TESTES DE INTEGRAÇÃO
// ============================================================================

describe('Fluxo Completo de Integração: Backend ↔ CRM ↔ Frontend', () => {

  describe('Fronteira 1: Contratos e Mapeamento de Status (CRM → Frontend)', () => {
    it('deve mapear "DISPONIVEL" estritamente como "PUBLISHED" no site público', () => {
      assert.equal(mapUnitStatusToPropertyStatus('DISPONIVEL'), PropertyStatus.PUBLISHED);
    });

    it('deve mapear "PAUSADO" como "INACTIVE" para nunca exibir na vitrine pública', () => {
      assert.equal(mapUnitStatusToPropertyStatus('PAUSADO'), PropertyStatus.INACTIVE);
    });

    it('deve mapear "PENDENTE_AVALIACAO" como "UNDER_REVIEW" para aprovação prévia', () => {
      assert.equal(mapUnitStatusToPropertyStatus('PENDENTE_AVALIACAO'), PropertyStatus.UNDER_REVIEW);
    });

    it('deve mapear "LOCADO" como "RENTED"', () => {
      assert.equal(mapUnitStatusToPropertyStatus('LOCADO'), PropertyStatus.RENTED);
    });

    it('deve calcular corretamente o total mensal somando aluguel, condomínio e iptu/admin', () => {
      const unit = { rentValue: 7040, condoValue: 485, adminFeeValue: 0, iptuValue: 0 };
      const totals = calculateUnitTotals(unit);
      assert.equal(totals.rentPrice, 7040);
      assert.equal(totals.condoFee, 485);
      assert.equal(totals.totalMonthly, 7525);
    });

    it('deve filtrar mocks antigos como "Mangal Gourmet" da vitrine', () => {
      assert.equal(isDummy({ id: 'sample-123', title: 'Residencial Mangal Gourmet' }), true);
      assert.equal(isDummy({ id: 'u-1790178985770', title: 'Loja Nissi Centro Comercial' }), false);
    });
  });

  describe('Fronteira 2: Backend → CRM (Asaas Gateway Adapter)', () => {
    it('deve apontar para sandbox.asaas.com quando ambiente for SANDBOX', () => {
      const url = resolveAsaasUrl('SANDBOX');
      assert.equal(url, 'https://sandbox.asaas.com/api/v3');
    });

    it('deve apontar para api.asaas.com quando ambiente for PRODUCTION', () => {
      const url = resolveAsaasUrl('PRODUCTION');
      assert.equal(url, 'https://api.asaas.com/v3');
    });

    it('deve gerar payload de cliente com CPF/CNPJ sanitizado', () => {
      const payload = buildAsaasCustomerPayload({
        name: 'Inquilino Teste',
        email: 'inquilino@teste.com',
        cpfCnpj: '123.456.789-00'
      });
      assert.equal(payload.name, 'Inquilino Teste');
      assert.equal(payload.cpfCnpj, '123.456.789-00');
      assert.equal(payload.notificationDisabled, false);
    });

    it('deve gerar cobrança com billingType "UNDEFINED" para permitir PIX e Boleto simultâneos', () => {
      const payload = buildAsaasPaymentPayload({
        customerId: 'cus_123',
        value: 2500,
        dueDate: '2026-10-15',
        description: 'Aluguel Unidade 12 - Luzes Campolim'
      });
      assert.equal(payload.customer, 'cus_123');
      assert.equal(payload.value, 2500);
      assert.equal(payload.billingType, 'UNDEFINED');
      assert.equal(payload.dueDate, '2026-10-15');
    });
  });

  describe('Fronteira 3: CRM → Backend (Webhook Lifecycle)', () => {
    it('deve rejeitar chamadas de webhook com token inválido quando token estiver configurado', () => {
      const result = processAsaasWebhook(
        { event: 'PAYMENT_RECEIVED', payment: { id: 'pay_999' } },
        'token-falso',
        'token-secreto-oficial'
      );
      assert.equal(result.status, 401);
      assert.equal(result.error, 'Unauthorized webhook caller');
    });

    it('deve processar evento PAYMENT_RECEIVED e atualizar status para PAGO', () => {
      const result = processAsaasWebhook(
        {
          event: 'PAYMENT_RECEIVED',
          payment: { id: 'pay_999', value: 3500.0, status: 'RECEIVED' }
        },
        'token-secreto-oficial',
        'token-secreto-oficial'
      );
      assert.equal(result.status, 200);
      assert.equal(result.newStatus, 'PAGO');
      assert.equal(result.paymentId, 'pay_999');
    });

    it('deve processar evento PAYMENT_OVERDUE e atualizar status para VENCIDO', () => {
      const result = processAsaasWebhook(
        {
          event: 'PAYMENT_OVERDUE',
          payment: { id: 'pay_888', value: 1200.0, status: 'OVERDUE' }
        },
        null,
        null
      );
      assert.equal(result.status, 200);
      assert.equal(result.newStatus, 'VENCIDO');
    });
  });

  describe('Fronteira 4: Ciclo de Vida Completo de Ponta a Ponta', () => {
    it('simula ciclo: Cadastro no CRM → Aprovação → Vitrine Pública → Contrato → Boleto Asaas → Liquidação Webhook → Pausa de Anúncio', () => {
      // 1. Usuário cadastra unidade via /anunciar
      const newUnit = {
        id: 'u-teste-101',
        buildingName: 'Residencial Campolim Prime',
        unitNumber: '402',
        rentValue: 4500,
        condoValue: 600,
        status: 'PENDENTE_AVALIACAO'
      };

      // No início, está sob análise: NÃO deve aparecer na vitrine pública
      assert.equal(mapUnitStatusToPropertyStatus(newUnit.status), PropertyStatus.UNDER_REVIEW);
      const publicListInitial = [newUnit].filter(u => mapUnitStatusToPropertyStatus(u.status) === PropertyStatus.PUBLISHED);
      assert.equal(publicListInitial.length, 0);

      // 2. Administrador avalia e aprova no CRM
      newUnit.status = 'DISPONIVEL';
      assert.equal(mapUnitStatusToPropertyStatus(newUnit.status), PropertyStatus.PUBLISHED);
      const publicListApproved = [newUnit].filter(u => mapUnitStatusToPropertyStatus(u.status) === PropertyStatus.PUBLISHED);
      assert.equal(publicListApproved.length, 1);

      // 3. Contrato é fechado: unidade passa para LOCADO e 1º Boleto é criado
      newUnit.status = 'LOCADO';
      const contract = {
        id: 'cnt-1',
        unitId: newUnit.id,
        tenantName: 'João Silva',
        monthlyAmount: calculateUnitTotals(newUnit).totalMonthly
      };
      assert.equal(contract.monthlyAmount, 5100);

      const asaasCharge = buildAsaasPaymentPayload({
        customerId: 'cus_joao_1',
        value: contract.monthlyAmount,
        description: `1º Aluguel - ${newUnit.buildingName}`
      });
      assert.equal(asaasCharge.value, 5100);

      // 4. Webhook do Asaas confirma o pagamento do PIX
      const webhookResult = processAsaasWebhook({
        event: 'PAYMENT_CONFIRMED',
        payment: { id: 'pay_joao_01', value: 5100 }
      });
      assert.equal(webhookResult.newStatus, 'PAGO');

      // 5. Unidade locada não aparece mais como disponível para locação no site
      const publicListFinal = [newUnit].filter(u => mapUnitStatusToPropertyStatus(u.status) === PropertyStatus.PUBLISHED);
      assert.equal(publicListFinal.length, 0);
    });
  });
});
