// Rich data store for Imobiliária Gestão System (Admin, Owner, Tenant)

export interface BuildingUnit {
  id: string;
  buildingName: string;
  unitNumber: string;
  type: 'SALA' | 'APARTAMENTO' | 'STUDIO' | 'LOJA';
  floor: string;
  areaSqm: number;
  rentValue: number;
  condoValue: number;
  iptuValue: number;
  status: 'LOCADO' | 'DISPONIVEL' | 'REFORMA';
  ownerName: string;
  ownerEmail: string;
  tenantName?: string;
  tenantEmail?: string;
}

export interface GestaoUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'OWNER' | 'TENANT';
  status: 'ATIVO' | 'CONVIDADO' | 'BLOQUEADO';
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

// Initial Seed Data
export const INITIAL_UNITS: BuildingUnit[] = [
  {
    id: 'u-101',
    buildingName: 'Edifício Paulista Corporate',
    unitNumber: 'Sala 101',
    type: 'SALA',
    floor: '10º Andar',
    areaSqm: 85,
    rentValue: 6500,
    condoValue: 1200,
    iptuValue: 420,
    status: 'LOCADO',
    ownerName: 'Eduardo Silveira Ramos',
    ownerEmail: 'eduardo.silveira@email.com',
    tenantName: 'TechSolutions Brasil Ltda',
    tenantEmail: 'financeiro@techsolutions.com.br'
  },
  {
    id: 'u-102',
    buildingName: 'Edifício Paulista Corporate',
    unitNumber: 'Sala 102',
    type: 'SALA',
    floor: '10º Andar',
    areaSqm: 110,
    rentValue: 8200,
    condoValue: 1550,
    iptuValue: 540,
    status: 'LOCADO',
    ownerName: 'Eduardo Silveira Ramos',
    ownerEmail: 'eduardo.silveira@email.com',
    tenantName: 'Inovação Digital Consultoria',
    tenantEmail: 'contato@inovacaodigital.com'
  },
  {
    id: 'u-204',
    buildingName: 'Residencial Faria Lima Prime',
    unitNumber: 'Apto 204',
    type: 'APARTAMENTO',
    floor: '2º Andar',
    areaSqm: 72,
    rentValue: 4800,
    condoValue: 890,
    iptuValue: 280,
    status: 'LOCADO',
    ownerName: 'Mariana Castro',
    ownerEmail: 'mariana.castro@gmail.com',
    tenantName: 'Lucas Ferreira',
    tenantEmail: 'lucas.ferreira@gmail.com'
  },
  {
    id: 'u-305',
    buildingName: 'Residencial Faria Lima Prime',
    unitNumber: 'Studio 305',
    type: 'STUDIO',
    floor: '3º Andar',
    areaSqm: 40,
    rentValue: 3400,
    condoValue: 620,
    iptuValue: 160,
    status: 'DISPONIVEL',
    ownerName: 'Mariana Castro',
    ownerEmail: 'mariana.castro@gmail.com'
  },
  {
    id: 'u-401',
    buildingName: 'Edifício Pinheiros Hub',
    unitNumber: 'Conjunto 401',
    type: 'SALA',
    floor: '4º Andar',
    areaSqm: 140,
    rentValue: 9500,
    condoValue: 1900,
    iptuValue: 680,
    status: 'LOCADO',
    ownerName: 'Dr. Paulo Albuquerque',
    ownerEmail: 'paulo.albuquerque@advocacia.com',
    tenantName: 'Clínica Bem Estar Médica',
    tenantEmail: 'atendimento@clinicabemestar.med.br'
  },
  {
    id: 'u-502',
    buildingName: 'Edifício Pinheiros Hub',
    unitNumber: 'Conjunto 502',
    type: 'SALA',
    floor: '5º Andar',
    areaSqm: 95,
    rentValue: 7100,
    condoValue: 1350,
    iptuValue: 490,
    status: 'REFORMA',
    ownerName: 'Dr. Paulo Albuquerque',
    ownerEmail: 'paulo.albuquerque@advocacia.com'
  }
];

export const INITIAL_USERS: GestaoUser[] = [
  {
    id: 'usr-1',
    name: 'Administrador i7',
    email: 'admin@i7.com.br',
    phone: '(11) 98765-4321',
    role: 'ADMIN',
    status: 'ATIVO',
    createdAt: '10/01/2026'
  },
  {
    id: 'usr-2',
    name: 'Eduardo Silveira Ramos',
    email: 'eduardo.silveira@email.com',
    phone: '(11) 99123-4567',
    role: 'OWNER',
    status: 'ATIVO',
    propertiesCount: 2,
    createdAt: '15/02/2026'
  },
  {
    id: 'usr-3',
    name: 'Mariana Castro',
    email: 'mariana.castro@gmail.com',
    phone: '(11) 97890-1234',
    role: 'OWNER',
    status: 'ATIVO',
    propertiesCount: 2,
    createdAt: '01/03/2026'
  },
  {
    id: 'usr-4',
    name: 'Dr. Paulo Albuquerque',
    email: 'paulo.albuquerque@advocacia.com',
    phone: '(11) 98888-7777',
    role: 'OWNER',
    status: 'ATIVO',
    propertiesCount: 2,
    createdAt: '12/03/2026'
  },
  {
    id: 'usr-5',
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@gmail.com',
    phone: '(11) 96543-2109',
    role: 'TENANT',
    status: 'ATIVO',
    unitAssigned: 'Apto 204 - Residencial Faria Lima Prime',
    createdAt: '20/03/2026'
  },
  {
    id: 'usr-6',
    name: 'TechSolutions Brasil Ltda',
    email: 'financeiro@techsolutions.com.br',
    phone: '(11) 3210-9876',
    role: 'TENANT',
    status: 'ATIVO',
    unitAssigned: 'Sala 101 - Paulista Corporate',
    createdAt: '05/04/2026'
  }
];

export const INITIAL_CONTRACTS: GestaoContract[] = [
  {
    id: 'cnt-101',
    code: 'CTR-2026-089',
    unitName: 'Sala 101 - Paulista Corporate',
    tenantName: 'TechSolutions Brasil Ltda',
    tenantEmail: 'financeiro@techsolutions.com.br',
    ownerName: 'Eduardo Silveira Ramos',
    ownerEmail: 'eduardo.silveira@email.com',
    startDate: '01/05/2025',
    endDate: '30/04/2027',
    monthlyAmount: 6500,
    adjustmentIndex: 'IPCA',
    guaranteeType: 'SEGURO_FIANCA',
    finePercent: 10,
    interestPercent: 1,
    status: 'ATIVO'
  },
  {
    id: 'cnt-102',
    code: 'CTR-2026-092',
    unitName: 'Sala 102 - Paulista Corporate',
    tenantName: 'Inovação Digital Consultoria',
    tenantEmail: 'contato@inovacaodigital.com',
    ownerName: 'Eduardo Silveira Ramos',
    ownerEmail: 'eduardo.silveira@email.com',
    startDate: '15/06/2025',
    endDate: '14/06/2027',
    monthlyAmount: 8200,
    adjustmentIndex: 'IGP-M',
    guaranteeType: 'CAUCAO',
    finePercent: 10,
    interestPercent: 1,
    status: 'ATIVO'
  },
  {
    id: 'cnt-204',
    code: 'CTR-2026-114',
    unitName: 'Apto 204 - Residencial Faria Lima Prime',
    tenantName: 'Lucas Ferreira',
    tenantEmail: 'lucas.ferreira@gmail.com',
    ownerName: 'Mariana Castro',
    ownerEmail: 'mariana.castro@gmail.com',
    startDate: '01/01/2026',
    endDate: '31/12/2028',
    monthlyAmount: 4800,
    adjustmentIndex: 'IPCA',
    guaranteeType: 'FIADOR',
    finePercent: 10,
    interestPercent: 1,
    status: 'ATIVO'
  }
];

export const INITIAL_BOLETOS: GestaoBoleto[] = [
  {
    id: 'bol-01',
    code: 'BOL-8901',
    unitName: 'Apto 204 - Faria Lima Prime',
    tenantName: 'Lucas Ferreira',
    ownerName: 'Mariana Castro',
    amount: 5970, // aluguel + condo + iptu
    dueDate: '10/09/2026',
    status: 'EM_ABERTO',
    dunningStep: 'LEMBRETE_PREVIO',
    barCode: '34191.79001 01043.510047 91020.150008 5 91230000597000',
    pixCode: '00020126580014br.gov.bcb.pix0136i7-asaas-pix-chave-faria-lima-20452040000530398654055970.005802BR5915I7 INTELIGENCIA6009SAO PAULO62070503***6304ABCD'
  },
  {
    id: 'bol-02',
    code: 'BOL-8902',
    unitName: 'Sala 101 - Paulista Corporate',
    tenantName: 'TechSolutions Brasil Ltda',
    ownerName: 'Eduardo Silveira Ramos',
    amount: 8120,
    dueDate: '05/09/2026',
    status: 'EM_ABERTO',
    dunningStep: 'LEMBRETE_PREVIO',
    barCode: '34191.79001 01043.510047 91020.150008 5 91230000812000',
    pixCode: '00020126580014br.gov.bcb.pix0136i7-asaas-pix-chave-paulista-10152040000530398654058120.005802BR5915I7 INTELIGENCIA6009SAO PAULO62070503***6304WXYZ'
  },
  {
    id: 'bol-03',
    code: 'BOL-8850',
    unitName: 'Sala 102 - Paulista Corporate',
    tenantName: 'Inovação Digital Consultoria',
    ownerName: 'Eduardo Silveira Ramos',
    amount: 10290,
    dueDate: '25/08/2026',
    status: 'VENCIDO',
    daysOverdue: 8,
    dunningStep: 'PRIMEIRO_AVISO',
    barCode: '34191.79001 01043.510047 91020.150008 5 91230001029000',
    pixCode: '00020126580014br.gov.bcb.pix0136i7-asaas-pix-chave-paulista-102520400005303986540510290.005802BR5915I7 INTELIGENCIA6009SAO PAULO62070503***6304QWER',
    fineApplied: 1029,
    interestApplied: 82.32
  },
  {
    id: 'bol-04',
    code: 'BOL-8790',
    unitName: 'Apto 204 - Faria Lima Prime',
    tenantName: 'Lucas Ferreira',
    ownerName: 'Mariana Castro',
    amount: 5970,
    dueDate: '10/08/2026',
    status: 'PAGO',
    paidAt: '09/08/2026',
    paidAmount: 5970,
    barCode: '34191.79001 01043.510047 91020.150008 5 91230000597000',
    pixCode: '00020126580014br.gov.bcb.pix0136i7-asaas-pix-quitado'
  }
];

export const INITIAL_PAYMENTS: GestaoPayment[] = [
  {
    id: 'pay-01',
    unitName: 'Apto 204 - Faria Lima Prime',
    tenantName: 'Lucas Ferreira',
    ownerName: 'Mariana Castro',
    competence: '08/2026',
    expectedAmount: 5970,
    receivedAmount: 5970,
    adminFeeAmount: 480, // 10% do aluguel
    expensesDeducted: 0,
    transferredAmount: 5490,
    status: 'CONCILIADO',
    receivedDate: '09/08/2026',
    transferDate: '14/08/2026',
    transferReceiptUrl: 'https://comprovantes.i7.com.br/repasse-202608-204.pdf'
  },
  {
    id: 'pay-02',
    unitName: 'Sala 101 - Paulista Corporate',
    tenantName: 'TechSolutions Brasil Ltda',
    ownerName: 'Eduardo Silveira Ramos',
    competence: '08/2026',
    expectedAmount: 8120,
    receivedAmount: 8120,
    adminFeeAmount: 650,
    expensesDeducted: 350, // reparo de fechadura
    transferredAmount: 7120,
    status: 'CONCILIADO',
    receivedDate: '05/08/2026',
    transferDate: '10/08/2026',
    transferReceiptUrl: 'https://comprovantes.i7.com.br/repasse-202608-101.pdf'
  },
  {
    id: 'pay-03',
    unitName: 'Sala 102 - Paulista Corporate',
    tenantName: 'Inovação Digital Consultoria',
    ownerName: 'Eduardo Silveira Ramos',
    competence: '08/2026',
    expectedAmount: 10290,
    receivedAmount: 0,
    adminFeeAmount: 820,
    expensesDeducted: 0,
    transferredAmount: 0,
    status: 'INADIMPLENTE'
  }
];

export const INITIAL_MAINTENANCES: GestaoMaintenance[] = [
  {
    id: 'mnt-01',
    title: 'Vazamento sob a pia da copa',
    unitName: 'Sala 101 - Paulista Corporate',
    requestedBy: 'TechSolutions Brasil Ltda',
    requestedByRole: 'TENANT',
    category: 'HIDRAULICA',
    urgency: 'ALTA',
    status: 'EM_ANDAMENTO',
    estimatedCost: 380,
    approvedByOwner: true,
    description: 'Sifão rompido causando gotejamento constante sobre o armário da copa. Técnico agendado para amanhã às 14h.',
    createdAt: '30/08/2026',
    photos: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600'
    ]
  },
  {
    id: 'mnt-02',
    title: 'Troca de disjuntor do ar-condicionado',
    unitName: 'Apto 204 - Faria Lima Prime',
    requestedBy: 'Lucas Ferreira',
    requestedByRole: 'TENANT',
    category: 'ELETRICA',
    urgency: 'MEDIA',
    status: 'EM_ANALISE',
    estimatedCost: 220,
    approvedByOwner: false,
    description: 'Disjuntor bipolar desarmando ao ligar os 2 aparelhos de ar simultaneamente.',
    createdAt: '01/09/2026',
    photos: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600'
    ]
  },
  {
    id: 'mnt-03',
    title: 'Pintura e retoque após saída de inquilino',
    unitName: 'Studio 305 - Faria Lima Prime',
    requestedBy: 'Mariana Castro',
    requestedByRole: 'OWNER',
    category: 'PINTURA',
    urgency: 'BAIXA',
    status: 'CONCLUIDO',
    estimatedCost: 850,
    approvedByOwner: true,
    description: 'Serviço finalizado e vistoriado com sucesso em 28/08/2026.',
    createdAt: '22/08/2026',
    photos: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600'
    ]
  },
  {
    id: 'mnt-04',
    title: 'Infiltração leve no teto do banheiro',
    unitName: 'Conjunto 401 - Pinheiros Hub',
    requestedBy: 'Clínica Bem Estar Médica',
    requestedByRole: 'TENANT',
    category: 'ESTRUTURAL',
    urgency: 'ALTA',
    status: 'ABERTO',
    description: 'Mancha amarelada no gesso do banheiro da recepção.',
    createdAt: '02/09/2026',
    photos: []
  }
];

export const INITIAL_DOCUMENTS: GestaoDocument[] = [
  {
    id: 'doc-01',
    title: 'Contrato de Locação Assinado Digitalmente',
    category: 'CONTRATO',
    unitName: 'Sala 101 - Paulista Corporate',
    targetRole: 'TODOS',
    fileUrl: 'https://docs.i7.com.br/contratos/ctr-101-assinado.pdf',
    fileSize: '1.4 MB',
    uploadedAt: '02/05/2025'
  },
  {
    id: 'doc-02',
    title: 'Laudo de Vistoria de Entrada com 48 Fotos',
    category: 'VISTORIA',
    unitName: 'Apto 204 - Faria Lima Prime',
    targetRole: 'TODOS',
    fileUrl: 'https://docs.i7.com.br/vistorias/vistoria-204-entrada.pdf',
    fileSize: '8.2 MB',
    uploadedAt: '01/01/2026'
  },
  {
    id: 'doc-03',
    title: 'Regulamento Interno e Convenção do Condomínio',
    category: 'REGULAMENTO',
    unitName: 'Edifício Paulista Corporate',
    targetRole: 'TODOS',
    fileUrl: 'https://docs.i7.com.br/condominio/regulamento-paulista.pdf',
    fileSize: '2.1 MB',
    uploadedAt: '10/01/2026'
  },
  {
    id: 'doc-04',
    title: 'Apólice do Seguro Fiança Porto Seguro',
    category: 'APOLICE',
    unitName: 'Sala 101 - Paulista Corporate',
    targetRole: 'PROPRIETARIO',
    fileUrl: 'https://docs.i7.com.br/apolices/apolice-porto-101.pdf',
    fileSize: '950 KB',
    uploadedAt: '05/05/2025'
  }
];

export const INITIAL_ANNOUNCEMENTS: GestaoAnnouncement[] = [
  {
    id: 'ann-01',
    title: 'Manutenção Preventiva dos Elevadores - Paulista Corporate',
    content: 'Informamos que nesta quinta-feira (04/09), das 09h às 12h, os elevadores sociais 1 e 2 passarão por calibração preventiva. O elevador de serviço estará operando normalmente.',
    unitScope: 'Edifício Paulista Corporate',
    targetRole: 'TODOS',
    createdAt: '01/09/2026',
    totalTargetUsers: 14,
    readBy: [
      { userId: 'usr-6', userName: 'TechSolutions Brasil Ltda', readAt: '01/09/2026 14:32' },
      { userId: 'usr-2', userName: 'Eduardo Silveira Ramos', readAt: '02/09/2026 09:15' }
    ]
  },
  {
    id: 'ann-02',
    title: 'Atualização das Diretrizes de Descarte de Lixo Reciclável',
    content: 'Por determinação da administração municipal, todo lixo eletrônico e baterias devem ser depositados exclusivamente na lixeira ecológica do piso térreo.',
    unitScope: 'Todos os Prédios',
    targetRole: 'INQUILINO',
    createdAt: '25/08/2026',
    totalTargetUsers: 28,
    readBy: [
      { userId: 'usr-5', userName: 'Lucas Ferreira', readAt: '25/08/2026 19:40' }
    ]
  }
];

export const INITIAL_EXPENSES: GestaoExpense[] = [
  {
    id: 'exp-01',
    description: 'Reparo hidráulico urgente na copa',
    unitName: 'Sala 101 - Paulista Corporate',
    ownerName: 'Eduardo Silveira Ramos',
    category: 'MANUTENCAO',
    amount: 350,
    date: '10/08/2026',
    status: 'DESCONTADO_REPASSE',
    receiptNumber: 'NF-e 49102'
  },
  {
    id: 'exp-02',
    description: 'Cota extraordinária de impermeabilização',
    unitName: 'Apto 204 - Faria Lima Prime',
    ownerName: 'Mariana Castro',
    category: 'CONDOMINIO',
    amount: 190,
    date: '15/08/2026',
    status: 'LANCADO',
    receiptNumber: 'REC-8812'
  }
];

export const INITIAL_AUDIT_LOGS: GestaoAuditLog[] = [
  {
    id: 'aud-01',
    user: 'admin@i7.com.br',
    action: 'EMISSAO_BOLETO',
    entity: 'Boleto BOL-8901',
    details: 'Emissão de cobrança mensal para Apto 204 no valor de R$ 5.970,00',
    timestamp: '01/09/2026 10:14:22',
    ip: '189.120.44.12'
  },
  {
    id: 'aud-02',
    user: 'admin@i7.com.br',
    action: 'REGUA_INADIMPLENCIA',
    entity: 'Boleto BOL-8850',
    details: 'Disparo de primeiro aviso automático de cobrança após 8 dias de atraso',
    timestamp: '02/09/2026 08:00:01',
    ip: '10.0.4.15'
  },
  {
    id: 'aud-03',
    user: 'admin@i7.com.br',
    action: 'APROVACAO_CHAMADO',
    entity: 'Manutenção mnt-01',
    details: 'Orçamento de R$ 380 aprovado e técnico alocado',
    timestamp: '30/08/2026 16:45:10',
    ip: '189.120.44.12'
  },
  {
    id: 'aud-04',
    user: 'eduardo.silveira@email.com',
    action: 'LOGIN_PORTAL',
    entity: 'Portal do Proprietário',
    details: 'Acesso autenticado via e-mail e senha',
    timestamp: '02/09/2026 09:12:05',
    ip: '177.38.19.88'
  }
];

export const INITIAL_SETTINGS: GestaoSettings = {
  organizationName: 'i7 Inteligência Imobiliária S.A.',
  cnpj: '45.123.890/0001-99',
  email: 'contato@i7.com.br',
  phone: '(11) 3090-4000',
  address: 'Av. Brigadeiro Faria Lima, 3477 - 14º Andar - Itaim Bibi, São Paulo - SP',
  defaultAdminFeePercent: 10,
  defaultFinePercent: 10,
  defaultDailyInterestPercent: 0.033, // ~1% ao mês
  asaasApiKey: 'live_api_key_demo_asaas_sec_9941a80...',
  asaasEnvironment: 'SANDBOX',
  asaasWalletId: 'wal_i7_proptech_main',
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
