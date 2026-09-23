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
  adminFeeValue?: number;
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

// Initial Seed Data - Base Oficial com Imóvel Real Cadastrado
export const INITIAL_UNITS: BuildingUnit[] = [
  {
    id: 'u-loja-aparecidinha-220',
    title: 'Ampla loja comercial de 220 m² com grande fachada e estacionamento',
    type: 'COMERCIAL',
    buildingName: 'Loja Comercial Aparecidinha',
    unitNumber: 'Loja 01',
    floor: 'Térreo',
    areaSqm: 220,
    rentValue: 20735,
    condoValue: 0,
    iptuValue: 0,
    adminFeeValue: 0,
    status: 'DISPONIVEL',
    bedrooms: 0,
    bathrooms: 1,
    parkingSpaces: 4,
    furnished: false,
    petFriendly: true,
    description: 'Ampla loja comercial de 220 m² com grande fachada e estacionamento no Conjunto Residencial Aparecidinha em Sorocaba - SP. Excelente visibilidade, pé direito alto e piso de alta resistência.',
    photos: [
      'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=1200',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200'
    ],
    photosCount: 2,
    street: 'Av. Aparecidinha',
    number: '1500',
    neighborhood: 'Conjunto Residencial Aparecidinha',
    city: 'Sorocaba',
    state: 'SP',
    zipCode: '18087-000',
    latitude: -23.4795,
    longitude: -47.3892,
    address: 'Av. Aparecidinha, 1500 - Conjunto Residencial Aparecidinha, Sorocaba - SP',
    ownerName: 'i7 Inteligência Imobiliária',
    ownerEmail: 'admin@i7.com.br',
    ownerPhone: '(15) 98814-5050',
    createdAt: '2026-09-23T12:00:00.000Z'
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
  phone: '(15) 98814-5050',
  address: 'R. Cel. Nogueira Padilha, 374 - Vila Hortência, Sorocaba - SP',
  defaultAdminFeePercent: 10,
  defaultFinePercent: 10,
  defaultDailyInterestPercent: 0.033, // ~1% ao mês
  asaasApiKey: process.env.NEXT_PUBLIC_ASAAS_API_KEY || 'configurado_no_painel',
  asaasEnvironment: 'PRODUCTION',
  asaasWalletId: process.env.NEXT_PUBLIC_ASAAS_WALLET_ID || 'carteira_i7_oficial',
  autoDunningEnabled: true
};

// Helper para compressão de imagens via Canvas no navegador (evita estouro de 5MB do localStorage)
export function compressImage(file: File, maxWidth = 1200, quality = 0.72): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !file || !file.type || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(event.target?.result as string);
          }
        } catch {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Storage assíncrono IndexedDB para contornar qualquer limite de 5MB
const DB_NAME = 'i7_property_db';
const STORE_NAME = 'store';

function openIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE_NAME);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveToIndexedDB(key: string, data: any): Promise<void> {
  try {
    const db = await openIndexedDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(data, key);
  } catch (err) {
    console.warn('IDB write failed:', err);
  }
}

export async function getFromIndexedDB<T>(key: string): Promise<T | null> {
  try {
    const db = await openIndexedDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Storage helpers to simulate database operations across all screens
export function getStoredData<T>(key: string, initialData: T): T {
  if (typeof window === 'undefined') return initialData;
  const item = localStorage.getItem(`i7_gestao_${key}`) || localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(`i7_gestao_${key}`, JSON.stringify(initialData));
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  try {
    let parsed = JSON.parse(item);
    if (Array.isArray(parsed)) {
      // Limpa qualquer dado residual do exemplo antigo 'b3106524-17ad-4a9b-a6fa-e9fa93637c31' (Mangal Gourmet / Apto 31)
      const cleaned = parsed.filter((u: any) => {
        if (!u) return false;
        const id = String(u.id || '').toLowerCase();
        const title = String(u.title || '').toLowerCase();
        const bName = String(u.buildingName || '').toLowerCase();
        const uNum = String(u.unitNumber || '').toLowerCase();
        if (id === 'b3106524-17ad-4a9b-a6fa-e9fa93637c31' || id.startsWith('mock-') || id.startsWith('sample-')) return false;
        if (title.includes('mangal gourmet') || bName.includes('mangal gourmet')) return false;
        if (title.includes('residencial mangal') || bName.includes('residencial mangal')) return false;
        return true;
      });
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(`i7_gestao_${key}`, JSON.stringify(cleaned));
        localStorage.setItem(key, JSON.stringify(cleaned));
      }
      return cleaned as any;
    }
    return parsed;
  } catch {
    return initialData;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  // Persiste de forma segura no IndexedDB (sem limite de 5MB)
  saveToIndexedDB(key, data).catch(() => {});

  try {
    localStorage.setItem(`i7_gestao_${key}`, JSON.stringify(data));
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage quota atingida, salvando versao otimizada:', err);
    try {
      if (Array.isArray(data)) {
        // Reduz o payload de fotos no localStorage para nunca travar a gravação do imóvel
        const safe = data.map((item: any) => {
          if (item && item.photos && Array.isArray(item.photos)) {
            return {
              ...item,
              photos: item.photos.slice(0, 4)
            };
          }
          return item;
        });
        localStorage.setItem(`i7_gestao_${key}`, JSON.stringify(safe));
        localStorage.setItem(key, JSON.stringify(safe));
      }
    } catch (e2) {
      console.error('Falha de localStorage:', e2);
    }
  }
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
