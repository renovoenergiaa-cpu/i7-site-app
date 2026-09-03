// Rich data store for Imobiliária Gestão System (Admin, Owner, Tenant)

export interface BuildingUnit {
  id: string;
  buildingName: string;
  unitNumber: string;
  type: 'SALA' | 'APARTAMENTO' | 'STUDIO' | 'LOJA' | 'CASA' | 'COMERCIAL';
  floor: string;
  areaSqm: number;
  rentValue: number;
  condoValue: number;
  iptuValue: number;
  status: 'LOCADO' | 'DISPONIVEL' | 'PAUSADO' | 'REFORMA' | 'PENDENTE_AVALIACAO' | 'REPROVADO';
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  tenantName?: string;
  tenantEmail?: string;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  adminFeedback?: string;
  evaluationDate?: string;
  photosCount?: number;
  photos?: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  street?: string;
  description?: string;
  petFriendly?: boolean;
  furnished?: boolean;
}

export interface GestaoUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'OWNER' | 'TENANT';
  status: 'ATIVO' | 'CONVIDADO' | 'BLOQUEADO' | 'PENDENTE';
  propertiesCount?: number;
  unitAssigned?: string;
  createdAt: string;
}

export interface GestaoContract {
  id: string;
  code: string;
  unitName: string;
  tenantName: string;
  tenantEmail: string;
  ownerName: string;
  ownerEmail: string;
  startDate: string;
  endDate: string;
  monthlyAmount: number;
  adjustmentIndex: 'IGP-M' | 'IPCA' | 'INPC';
  guaranteeType: 'CAUCAO' | 'SEGURO_FIANCA' | 'FIADOR' | 'TITULO_CAP';
  finePercent: number;
  interestPercent: number;
  status: 'ATIVO' | 'ENCERRADO' | 'RENOVAÇÃO_PENDENTE';
}

export interface GestaoBoleto {
  id: string;
  code: string;
  unitName: string;
  tenantName: string;
  ownerName: string;
  amount: number;
  dueDate: string;
  status: 'EM_ABERTO' | 'PAGO' | 'VENCIDO' | 'CANCELADO' | 'ESTORNADO';
  daysOverdue?: number;
  dunningStep?: 'LEMBRETE_PREVIO' | 'VENCENDO_HOJE' | 'PRIMEIRO_AVISO' | 'NEGATIVACAO' | 'JURIDICO';
  barCode: string;
  pixCode: string;
  paidAt?: string;
  paidAmount?: number;
  fineApplied?: number;
  interestApplied?: number;
}

export interface GestaoPayment {
  id: string;
  unitName: string;
  tenantName: string;
  ownerName: string;
  competence: string; // ex: '08/2026'
  expectedAmount: number;
  receivedAmount: number;
  adminFeeAmount: number; // taxa de adm
  expensesDeducted: number;
  transferredAmount: number; // líquido repassado
  status: 'CONCILIADO' | 'RECEBIDO_PENDENTE_REPASSE' | 'INADIMPLENTE';
  receivedDate?: string;
  transferDate?: string;
  transferReceiptUrl?: string;
}

export interface GestaoMaintenance {
  id: string;
  title: string;
  unitName: string;
  requestedBy: string;
  requestedByRole: 'TENANT' | 'OWNER';
  category: 'ELETRICA' | 'HIDRAULICA' | 'ESTRUTURAL' | 'PINTURA' | 'OUTROS';
  urgency: 'BAIXA' | 'MEDIA' | 'ALTA' | 'EMERGENCIA';
  status: 'ABERTO' | 'EM_ANALISE' | 'EM_ANDAMENTO' | 'CONCLUIDO';
  estimatedCost?: number;
  approvedByOwner?: boolean;
  description: string;
  createdAt: string;
  photos: string[];
}

export interface GestaoDocument {
  id: string;
  title: string;
  category: 'CONTRATO' | 'VISTORIA' | 'APOLICE' | 'REGULAMENTO' | 'NOTIFICACAO';
  unitName: string;
  targetRole: 'TODOS' | 'PROPRIETARIO' | 'INQUILINO';
  fileUrl: string;
  fileSize: string;
  uploadedAt: string;
}

export interface GestaoAnnouncement {
  id: string;
  title: string;
  content: string;
  unitScope: string; // 'Todos os Prédios' ou prédio específico
  targetRole: 'TODOS' | 'PROPRIETARIO' | 'INQUILINO';
  createdAt: string;
  totalTargetUsers: number;
  readBy: { userId: string; userName: string; readAt: string }[];
}

export interface GestaoExpense {
  id: string;
  description: string;
  unitName: string;
  ownerName: string;
  category: 'MANUTENCAO' | 'IPTU' | 'CONDOMINIO' | 'TAXA_EXTRA' | 'JURIDICO';
  amount: number;
  date: string;
  status: 'LANCADO' | 'DESCONTADO_REPASSE';
  receiptNumber?: string;
}

export interface GestaoAuditLog {
  id: string;
  user: string;
  action: string;
  entity: string;
  details: string;
  timestamp: string;
  ip: string;
}

export interface GestaoSettings {
  organizationName: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  defaultAdminFeePercent: number;
  defaultFinePercent: number;
  defaultDailyInterestPercent: number;
  asaasApiKey: string;
  asaasEnvironment: 'SANDBOX' | 'PRODUCTION';
  asaasWalletId: string;
  autoDunningEnabled: boolean;
}

// Initial Seed Data - Sincronizado com Supabase Oficial
export const INITIAL_UNITS: BuildingUnit[] = [
  {
    id: '4601e845-8d85-47e6-a0fd-c4b657468b18',
    buildingName: 'Residencial Parque Campolim',
    unitNumber: 'Apto 1204',
    type: 'APARTAMENTO',
    floor: '12º Andar',
    areaSqm: 82,
    rentValue: 4800,
    condoValue: 650,
    iptuValue: 180,
    status: 'LOCADO',
    ownerName: 'Carlos Alberto Silva',
    ownerEmail: 'proprietario@i7.com.br',
    tenantName: 'Mariana Costa Tech',
    tenantEmail: 'locatario@i7.com.br'
  },
  {
    id: 'b3106524-17ad-4a9b-a6fa-e9fa93637c31',
    buildingName: 'Residencial Mangal Gourmet',
    unitNumber: 'Apto 31',
    type: 'APARTAMENTO',
    floor: '3º Andar',
    areaSqm: 95,
    rentValue: 3500,
    condoValue: 500,
    iptuValue: 150,
    status: 'DISPONIVEL',
    ownerName: 'Carlos Alberto Silva',
    ownerEmail: 'proprietario@i7.com.br'
  }
];

export const INITIAL_USERS: GestaoUser[] = [
  {
    id: 'c6edc59a-28cd-44a6-b6cb-6b3656d9ab93',
    name: 'Administrador i7',
    email: 'admin@i7.com.br',
    phone: '(11) 3090-4000',
    role: 'ADMIN',
    status: 'ATIVO',
    createdAt: '01/09/2026'
  },
  {
    id: '6f4eeb4f-dae0-4a02-9e22-93e8223684a6',
    name: 'Carlos Alberto Silva',
    email: 'proprietario@i7.com.br',
    phone: '(15) 99123-4567',
    role: 'OWNER',
    status: 'ATIVO',
    propertiesCount: 2,
    createdAt: '01/09/2026'
  },
  {
    id: '27302d3f-8afb-4c1e-8ea2-249614051d08',
    name: 'Mariana Costa Tech',
    email: 'locatario@i7.com.br',
    phone: '(15) 99789-1234',
    role: 'TENANT',
    status: 'ATIVO',
    unitAssigned: 'Apto 1204 - Residencial Parque Campolim',
    createdAt: '01/09/2026'
  }
];

export const INITIAL_CONTRACTS: GestaoContract[] = [
  {
    id: 'cnt-101',
    code: 'CTR-2026-001',
    unitName: 'Apto 1204 - Residencial Parque Campolim',
    tenantName: 'Mariana Costa Tech',
    tenantEmail: 'locatario@i7.com.br',
    ownerName: 'Carlos Alberto Silva',
    ownerEmail: 'proprietario@i7.com.br',
    startDate: '01/09/2026',
    endDate: '31/08/2028',
    monthlyAmount: 4800,
    adjustmentIndex: 'IPCA',
    guaranteeType: 'SEGURO_FIANCA',
    finePercent: 10,
    interestPercent: 1,
    status: 'ATIVO'
  }
];

export const INITIAL_BOLETOS: GestaoBoleto[] = [
  {
    id: 'bol-01',
    code: 'BOL-2026-01',
    unitName: 'Apto 1204 - Residencial Parque Campolim',
    tenantName: 'Mariana Costa Tech',
    ownerName: 'Carlos Alberto Silva',
    amount: 5630, // aluguel 4800 + condo 650 + iptu 180
    dueDate: '10/10/2026',
    status: 'EM_ABERTO',
    dunningStep: 'LEMBRETE_PREVIO',
    barCode: '34191.79001 01043.510047 91020.150008 5 99410000563000',
    pixCode: '00020126580014br.gov.bcb.pix0136i7-asaas-pix-campolim-120452040000530398654055630.005802BR5915I7 INTELIGENCIA6009SAO PAULO62070503***6304ABCD'
  }
];

export const INITIAL_PAYMENTS: GestaoPayment[] = [
  {
    id: 'pay-01',
    unitName: 'Apto 1204 - Residencial Parque Campolim',
    tenantName: 'Mariana Costa Tech',
    ownerName: 'Carlos Alberto Silva',
    competence: '09/2026',
    expectedAmount: 5630,
    receivedAmount: 5630,
    adminFeeAmount: 480, // 10% do aluguel
    expensesDeducted: 0,
    transferredAmount: 5150,
    status: 'CONCILIADO',
    receivedDate: '05/09/2026',
    transferDate: '10/09/2026',
    transferReceiptUrl: 'https://comprovantes.i7.com.br/repasse-202609-1204.pdf'
  }
];

export const INITIAL_MAINTENANCES: GestaoMaintenance[] = [
  {
    id: 'mnt-01',
    title: 'Revisão preventiva do sistema de ar-condicionado',
    unitName: 'Sala 101 - Edifício Paulista Corporate',
    requestedBy: 'Lucas Mendes Ferreira',
    requestedByRole: 'TENANT',
    category: 'OUTROS',
    urgency: 'MEDIA',
    status: 'EM_ANDAMENTO',
    estimatedCost: 350,
    approvedByOwner: true,
    description: 'Higienização semestral dos filtros e revisão da tubulação de gás.',
    createdAt: '01/09/2026',
    photos: []
  }
];

export const INITIAL_DOCUMENTS: GestaoDocument[] = [
  {
    id: 'doc-01',
    title: 'Contrato de Locação Assinado (CTR-2026-001)',
    category: 'CONTRATO',
    unitName: 'Sala 101 - Edifício Paulista Corporate',
    targetRole: 'TODOS',
    fileUrl: 'https://docs.i7.com.br/contratos/ctr-001-assinado.pdf',
    fileSize: '1.4 MB',
    uploadedAt: '01/09/2026'
  },
  {
    id: 'doc-02',
    title: 'Convenção e Regulamento do Edifício Paulista Corporate',
    category: 'REGULAMENTO',
    unitName: 'Edifício Paulista Corporate',
    targetRole: 'TODOS',
    fileUrl: 'https://docs.i7.com.br/condominio/regulamento-paulista.pdf',
    fileSize: '2.1 MB',
    uploadedAt: '01/09/2026'
  }
];

export const INITIAL_ANNOUNCEMENTS: GestaoAnnouncement[] = [
  {
    id: 'ann-01',
    title: 'Boas-vindas ao Portal Digital de Gestão i7',
    content: 'Sejam bem-vindos à plataforma de gestão inteligente i7. Aqui você pode emitir 2ª via de faturas com PIX instantâneo, acompanhar repasses e solicitar atendimentos com fotos.',
    unitScope: 'Todos os Prédios',
    targetRole: 'TODOS',
    createdAt: '01/09/2026',
    totalTargetUsers: 2,
    readBy: []
  }
];

export const INITIAL_EXPENSES: GestaoExpense[] = [
  {
    id: 'exp-01',
    description: 'Manutenção preventiva de ar-condicionado',
    unitName: 'Sala 101 - Edifício Paulista Corporate',
    ownerName: 'Eduardo Silveira Ramos',
    category: 'MANUTENCAO',
    amount: 350,
    date: '02/09/2026',
    status: 'LANCADO',
    receiptNumber: 'NF-e 10492'
  }
];

export const INITIAL_AUDIT_LOGS: GestaoAuditLog[] = [
  {
    id: 'aud-01',
    user: 'admin@i7imob.com.br',
    action: 'INICIALIZACAO_SISTEMA',
    entity: 'Plataforma i7',
    details: 'Base de dados oficial configurada com sucesso',
    timestamp: '01/09/2026 09:00:00',
    ip: '189.40.12.85'
  }
];

export const INITIAL_SETTINGS: GestaoSettings = {
  organizationName: 'i7 Inteligência Imobiliária S.A.',
  cnpj: '45.123.890/0001-99',
  email: 'contato@i7imob.com.br',
  phone: '(11) 3090-4000',
  address: 'R. Cel. Nogueira Padilha, 374 - Vila Hortência, Sorocaba - SP',
  defaultAdminFeePercent: 10,
  defaultFinePercent: 10,
  defaultDailyInterestPercent: 0.033, // ~1% ao mês
  asaasApiKey: process.env.NEXT_PUBLIC_ASAAS_API_KEY || 'configurado_no_painel',
  asaasEnvironment: 'PRODUCTION',
  asaasWalletId: process.env.NEXT_PUBLIC_ASAAS_WALLET_ID || 'carteira_i7_oficial',
  autoDunningEnabled: true
};

// LocalStorage helpers to simulate database operations across all screens
export function getStoredData<T>(key: string, initialData: T): T {
  if (typeof window === 'undefined') return initialData;
  const item = localStorage.getItem(`i7_gestao_${key}`);
  if (!item) {
    localStorage.setItem(`i7_gestao_${key}`, JSON.stringify(initialData));
    return initialData;
  }
  try {
    return JSON.parse(item);
  } catch {
    return initialData;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`i7_gestao_${key}`, JSON.stringify(data));
}

export function logAuditEvent(action: string, entity: string, details: string, user?: string): void {
  if (typeof window === 'undefined') return;
  const currentLogs = getStoredData<GestaoAuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
  const now = new Date();
  const timestamp = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;
  const newLog: GestaoAuditLog = {
    id: `aud-${Date.now()}`,
    user: user || 'admin@i7imob.com.br',
    action,
    entity,
    details,
    timestamp,
    ip: '189.40.12.85'
  };
  saveStoredData('audit_logs', [newLog, ...currentLogs]);
}

export interface ScheduledVisit {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  scheduledDate: string; // Ex: "2026-09-08T14:30"
  status: 'PENDENTE_CONFIRMACAO' | 'CONFIRMADA' | 'REAGENDAMENTO_SOLICITADO' | 'CANCELADA';
  adminNotes?: string;
  proposedDate?: string;
  createdAt: string;
}

export const INITIAL_VISITS: ScheduledVisit[] = [
  {
    id: 'vis-1',
    propertyId: 'prop-1',
    propertyTitle: 'Studio Conceito no Parque Campolim com Varanda Gourmet',
    propertyAddress: 'Av. Antônio Carlos Comitre, 1200 - Parque Campolim, Sorocaba',
    clientName: 'Rodrigo Medeiros',
    clientEmail: 'rodrigo.m@gmail.com',
    clientPhone: '(15) 99781-2244',
    scheduledDate: '2026-09-08T14:30',
    status: 'PENDENTE_CONFIRMACAO',
    createdAt: '03/09/2026'
  },
  {
    id: 'vis-2',
    propertyId: 'prop-2',
    propertyTitle: 'Apartamento de Alto Padrão 3 Dorms na Vila Hortência',
    propertyAddress: 'Rua Cel. Nogueira Padilha, 374 - Vila Hortência, Sorocaba',
    clientName: 'Fernanda Lima',
    clientEmail: 'fernanda.lima@outlook.com',
    clientPhone: '(15) 99144-8899',
    scheduledDate: '2026-09-09T10:00',
    status: 'CONFIRMADA',
    createdAt: '02/09/2026'
  }
];

export type ItemCondition = 'NOVO' | 'BOM' | 'REGULAR' | 'DANIFICADO';

export interface InspectionRoomItem {
  id: string;
  name: string;
  condition: ItemCondition;
  notes: string;
  photos: string[];
}

export interface InspectionRoom {
  id: string;
  name: string;
  items: InspectionRoomItem[];
}

export interface InspectionMeters {
  waterReading?: string;
  waterMeterNumber?: string;
  waterPhotoUrl?: string;
  electricReading?: string;
  electricMeterNumber?: string;
  electricPhotoUrl?: string;
  gasReading?: string;
  gasPhotoUrl?: string;
  keysHandedCount: number;
  remoteControlsCount: number;
  accessTagsCount: number;
  keysDescription?: string;
}

export interface InspectionReport {
  id: string;
  code: string;
  propertyId: string;
  unitName: string;
  propertyAddress: string;
  type: 'ENTRADA' | 'SAIDA' | 'CONSTATACAO';
  status: 'RASCUNHO' | 'AGUARDANDO_ASSINATURAS' | 'CONTESTADA' | 'HOMOLOGADA';
  inspectorName: string;
  inspectorCreci: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  ownerName: string;
  ownerEmail: string;
  inspectionDate: string;
  meters: InspectionMeters;
  rooms: InspectionRoom[];
  generalNotes?: string;
  tenantContestation?: string;
  signedByInspectorAt?: string;
  signedByTenantAt?: string;
  signedByOwnerAt?: string;
  createdAt: string;
}

export const INITIAL_INSPECTIONS: InspectionReport[] = [
  {
    id: 'vis-rep-1',
    code: 'VIS-2026-081',
    propertyId: 'prop-1',
    unitName: 'Studio 45 - Residencial Parque Campolim',
    propertyAddress: 'Av. Antônio Carlos Comitre, 1200 - Parque Campolim, Sorocaba - SP',
    type: 'ENTRADA',
    status: 'AGUARDANDO_ASSINATURAS',
    inspectorName: 'Marcio Silva (Vistoriador Credenciado i7)',
    inspectorCreci: 'CRECI 198244-F',
    tenantName: 'Lucas Mendes Ferreira',
    tenantEmail: 'lucas.mendes@gmail.com',
    tenantPhone: '(15) 99712-3344',
    ownerName: 'Carlos Alberto Silva',
    ownerEmail: 'proprietario@i7.com.br',
    inspectionDate: '01/09/2026 às 14:00',
    meters: {
      waterReading: '142,3 m³',
      waterMeterNumber: 'HID-88412',
      electricReading: '4.912 kWh',
      electricMeterNumber: 'CPFL-091244',
      gasReading: '64,1 m³',
      keysHandedCount: 3,
      remoteControlsCount: 2,
      accessTagsCount: 2,
      keysDescription: '2 chaves da porta principal (fechadura tetra), 1 chave da caixa de correio e 2 tags magnéticas de acesso ao condomínio.'
    },
    rooms: [
      {
        id: 'r-1',
        name: 'Sala & Living Integrado',
        items: [
          {
            id: 'i-1',
            name: 'Paredes & Pintura',
            condition: 'NOVO',
            notes: 'Pintura nova em látex fosco cor branco neve, sem furos ou manchas.',
            photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']
          },
          {
            id: 'i-2',
            name: 'Piso em Porcelanato',
            condition: 'BOM',
            notes: 'Porcelanato 80x80 polido em perfeito estado, rejunte limpo e sem trincas.',
            photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']
          },
          {
            id: 'i-3',
            name: 'Esquadrias & Sacada',
            condition: 'BOM',
            notes: 'Porta de correr de vidro temperado correndo suavemente, trava funcionando perfeitamente.',
            photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']
          }
        ]
      },
      {
        id: 'r-2',
        name: 'Cozinha & Área de Serviço',
        items: [
          {
            id: 'i-4',
            name: 'Bancada de Granito & Cuba',
            condition: 'BOM',
            notes: 'Granito São Gabriel polido sem trincas, torneira monocomando sem vazamento.',
            photos: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800']
          },
          {
            id: 'i-5',
            name: 'Armários Planejados',
            condition: 'REGULAR',
            notes: 'Armários MDF em bom funcionamento. Pequeno desgaste superficial na dobradiça inferior da pia.',
            photos: ['https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800']
          }
        ]
      },
      {
        id: 'r-3',
        name: 'Banheiro Social',
        items: [
          {
            id: 'i-6',
            name: 'Box de Vidro & Chuveiro',
            condition: 'NOVO',
            notes: 'Box blindex com silicone limpo sem mofo, chuveiro Lorenzetti turbo testado e aquecendo 100%.',
            photos: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800']
          },
          {
            id: 'i-7',
            name: 'Vaso Sanitário & Válvula',
            condition: 'BOM',
            notes: 'Caixa acoplada com descarga de duplo fluxo funcionando perfeitamente sem gotejamento.',
            photos: ['https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800']
          }
        ]
      }
    ],
    generalNotes: 'Imóvel entregue em excelente estado de asseio e conservação. Prazo de 5 dias corridos para o locatário registrar contestação ou ressalvas.',
    signedByInspectorAt: '01/09/2026 15:10',
    createdAt: '01/09/2026'
  },
  {
    id: 'vis-rep-2',
    code: 'VIS-2026-079',
    propertyId: 'prop-2',
    unitName: 'Apto 32 - Edifício Vila Hortência Corporate',
    propertyAddress: 'Rua Cel. Nogueira Padilha, 374 - Vila Hortência, Sorocaba - SP',
    type: 'SAIDA',
    status: 'HOMOLOGADA',
    inspectorName: 'Carlos Henrique (Perito Vistoriador i7)',
    inspectorCreci: 'CRECI 162980-F',
    tenantName: 'Mariana Duarte Souza',
    tenantEmail: 'mariana.duarte@hotmail.com',
    tenantPhone: '(15) 99188-5522',
    ownerName: 'Roberto Nogueira',
    ownerEmail: 'roberto.nogueira@gmail.com',
    inspectionDate: '28/08/2026 às 11:00',
    meters: {
      waterReading: '318,7 m³',
      waterMeterNumber: 'HID-77192',
      electricReading: '8.410 kWh',
      electricMeterNumber: 'CPFL-088192',
      gasReading: '112,0 m³',
      keysHandedCount: 4,
      remoteControlsCount: 2,
      accessTagsCount: 2,
      keysDescription: 'Devolução de 4 chaves originais, 2 controles de portão e 2 tags magnetizadas.'
    },
    rooms: [
      {
        id: 'r-4',
        name: 'Geral do Imóvel & Desocupação',
        items: [
          {
            id: 'i-8',
            name: 'Pintura Geral de Devolução',
            condition: 'BOM',
            notes: 'Pintura repintada na desocupação conforme cláusula contratual.',
            photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']
          },
          {
            id: 'i-9',
            name: 'Limpeza & Entrega',
            condition: 'BOM',
            notes: 'Imóvel completamente higienizado, sem lixo ou pertences da locatária anterior.',
            photos: ['https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800']
          }
        ]
      }
    ],
    generalNotes: 'Vistoria de saída homologada sem retenções caucionárias. Termo de quitação emitido.',
    signedByInspectorAt: '28/08/2026 12:00',
    signedByTenantAt: '28/08/2026 13:30',
    signedByOwnerAt: '28/08/2026 14:00',
    createdAt: '28/08/2026'
  }
];

export type ProposalStatus = 
  | 'AGUARDANDO_DOCUMENTOS' 
  | 'EM_ANALISE_CREDITO' 
  | 'APROVADA' 
  | 'CONTRATO_ASSINADO' 
  | 'REPROVADA';

export type GuaranteeType = 
  | 'FIANCA_DIGITAL' 
  | 'CAUCAO' 
  | 'SEGURO_FIANCA';

export interface ProposalDocument {
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface RentalProposal {
  id: string;
  code: string;
  visitId?: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  unitName: string;
  rentValue: number;
  condoValue: number;
  iptuValue: number;
  totalMonthly: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCpf?: string;
  clientBirthDate?: string;
  clientProfession?: string;
  clientIncome?: number;
  guaranteeType: GuaranteeType;
  documents: ProposalDocument[];
  creditScore?: number;
  status: ProposalStatus;
  adminFeedback?: string;
  contractId?: string;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_PROPOSALS: RentalProposal[] = [
  {
    id: 'prop-lease-1',
    code: 'PROP-2026-001',
    visitId: 'vis-1',
    propertyId: 'prop-1',
    propertyTitle: 'Studio Conceito no Parque Campolim com Varanda Gourmet',
    propertyAddress: 'Av. Antônio Carlos Comitre, 1200 - Parque Campolim, Sorocaba',
    unitName: 'Studio 45 - Residencial Parque Campolim',
    rentValue: 3200,
    condoValue: 480,
    iptuValue: 120,
    totalMonthly: 3800,
    clientName: 'Rodrigo Medeiros',
    clientEmail: 'rodrigo.m@gmail.com',
    clientPhone: '(15) 99781-2244',
    clientCpf: '341.892.418-09',
    clientBirthDate: '14/07/1992',
    clientProfession: 'Engenheiro de Software Sênior',
    clientIncome: 14500,
    guaranteeType: 'FIANCA_DIGITAL',
    creditScore: 885,
    documents: [
      {
        name: 'CNH_Digital_Rodrigo_Medeiros.pdf',
        type: 'IDENTIDADE',
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
        uploadedAt: '03/09/2026 16:30'
      },
      {
        name: 'Holerite_Julho_Agosto_2026.pdf',
        type: 'RENDA',
        url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800',
        uploadedAt: '03/09/2026 16:32'
      },
      {
        name: 'Comprovante_Residencia_CPFL.pdf',
        type: 'RESIDENCIA',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
        uploadedAt: '03/09/2026 16:33'
      }
    ],
    status: 'EM_ANALISE_CREDITO',
    createdAt: '03/09/2026',
    updatedAt: '03/09/2026'
  },
  {
    id: 'prop-lease-2',
    code: 'PROP-2026-002',
    visitId: 'vis-2',
    propertyId: 'prop-2',
    propertyTitle: 'Apartamento de Alto Padrão 3 Dorms na Vila Hortência',
    propertyAddress: 'Rua Cel. Nogueira Padilha, 374 - Vila Hortência, Sorocaba',
    unitName: 'Apto 32 - Edifício Vila Hortência Corporate',
    rentValue: 4200,
    condoValue: 650,
    iptuValue: 180,
    totalMonthly: 5030,
    clientName: 'Fernanda Lima',
    clientEmail: 'fernanda.lima@outlook.com',
    clientPhone: '(15) 99144-8899',
    clientCpf: '289.441.908-72',
    clientBirthDate: '22/11/1988',
    clientProfession: 'Gerente Administrativa',
    clientIncome: 16800,
    guaranteeType: 'CAUCAO',
    creditScore: 820,
    documents: [],
    status: 'AGUARDANDO_DOCUMENTOS',
    createdAt: '03/09/2026',
    updatedAt: '03/09/2026'
  }
];

export function resetToCleanBaseline(): void {
  if (typeof window === 'undefined') return;
  saveStoredData('units', INITIAL_UNITS);
  saveStoredData('users', INITIAL_USERS);
  saveStoredData('contracts', INITIAL_CONTRACTS);
  saveStoredData('boletos', INITIAL_BOLETOS);
  saveStoredData('payments', INITIAL_PAYMENTS);
  saveStoredData('maintenances', INITIAL_MAINTENANCES);
  saveStoredData('documents', INITIAL_DOCUMENTS);
  saveStoredData('announcements', INITIAL_ANNOUNCEMENTS);
  saveStoredData('expenses', INITIAL_EXPENSES);
  saveStoredData('audit_logs', INITIAL_AUDIT_LOGS);
  saveStoredData('settings', INITIAL_SETTINGS);
  saveStoredData('scheduled_visits', INITIAL_VISITS);
  saveStoredData('inspections', INITIAL_INSPECTIONS);
  saveStoredData('proposals', INITIAL_PROPOSALS);
}
