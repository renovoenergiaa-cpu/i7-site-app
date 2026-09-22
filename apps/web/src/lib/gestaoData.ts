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
  tenantPhone?: string;
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
  number?: string;
  complement?: string;
  zipCode?: string;
  title?: string;
  description?: string;
  petFriendly?: boolean;
  furnished?: boolean;
  featured?: boolean;
  createdAt?: string;
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

// Initial Seed Data - Base Oficial Limpa de Produção
export const INITIAL_UNITS: BuildingUnit[] = [];

export const INITIAL_USERS: GestaoUser[] = [
  {
    id: 'c6edc59a-28cd-44a6-b6cb-6b3656d9ab93',
    name: 'Administrador i7',
    email: 'admin@i7.com.br',
    phone: '(11) 3090-4000',
    role: 'ADMIN',
    status: 'ATIVO',
    createdAt: '01/09/2026'
  }
];

export const INITIAL_CONTRACTS: GestaoContract[] = [];

export const INITIAL_BOLETOS: GestaoBoleto[] = [];

export const INITIAL_PAYMENTS: GestaoPayment[] = [];

export const INITIAL_MAINTENANCES: GestaoMaintenance[] = [];

export const INITIAL_DOCUMENTS: GestaoDocument[] = [];

export const INITIAL_ANNOUNCEMENTS: GestaoAnnouncement[] = [];

export const INITIAL_EXPENSES: GestaoExpense[] = [];

export const INITIAL_AUDIT_LOGS: GestaoAuditLog[] = [
  {
    id: 'aud-01',
    user: 'admin@i7.com.br',
    action: 'INICIALIZACAO_SISTEMA',
    entity: 'Plataforma i7',
    details: 'Base de dados oficial de produção inicializada com sucesso',
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

// Auto-purge antigo legado de mocks no cliente
function ensureCleanProductionStorage() {
  if (typeof window === 'undefined') return;
  const CLEAN_VERSION = 'i7_clean_prod_v2';
  if (localStorage.getItem(CLEAN_VERSION) !== 'true') {
    // Purga chaves antigas com dados de exemplo
    const legacyKeys = [
      'units', 'contracts', 'boletos', 'payments', 
      'maintenances', 'documents', 'announcements', 
      'expenses', 'scheduled_visits', 'inspections', 'proposals'
    ];
    legacyKeys.forEach(k => localStorage.removeItem(`i7_gestao_${k}`));
    localStorage.setItem(CLEAN_VERSION, 'true');
  }
}

// LocalStorage helpers to simulate database operations across all screens
export function getStoredData<T>(key: string, initialData: T): T {
  if (typeof window === 'undefined') return initialData;
  ensureCleanProductionStorage();
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

export const INITIAL_VISITS: ScheduledVisit[] = [];

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

export const INITIAL_INSPECTIONS: InspectionReport[] = [];

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

export const INITIAL_PROPOSALS: RentalProposal[] = [];

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
