export enum UserRole {
  TENANT = 'TENANT',
  OWNER = 'OWNER',
  BROKER = 'BROKER',
  ADMIN = 'ADMIN'
}

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  STUDIO = 'STUDIO',
  KITNET = 'KITNET',
  COMMERCIAL = 'COMMERCIAL'
}

export enum PropertyStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PUBLISHED = 'PUBLISHED',
  RENTED = 'RENTED',
  SOLD = 'SOLD',
  INACTIVE = 'INACTIVE'
}

export enum VisitType {
  IN_PERSON = 'IN_PERSON',
  VIDEO_CALL = 'VIDEO_CALL'
}

export enum VisitStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ProposalStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  AWAITING_SIGNATURES = 'AWAITING_SIGNATURES',
  ACTIVE = 'ACTIVE',
  TERMINATED = 'TERMINATED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  PIX = 'PIX',
  BOLETO = 'BOLETO',
  CREDIT_CARD = 'CREDIT_CARD'
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  verified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface PropertyMediaDTO {
  id: string;
  propertyId: string;
  url: string;
  type: 'PHOTO' | 'VIDEO' | 'FLOOR_PLAN';
  order: number;
}

export interface PropertyDTO {
  id: string;
  ownerId: string;
  owner?: UserDTO;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  
  // Address
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  
  // Pricing
  rentPrice: number;
  salePrice?: number;
  condoFee: number;
  iptuFee: number;
  serviceFee: number; // i7 platform fee
  totalMonthly: number;
  
  // Attributes
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  areaSqm: number;
  furnished: boolean;
  petFriendly: boolean;
  hasVirtualTour: boolean;
  virtualTourUrl?: string;
  
  // Media & Meta
  media: PropertyMediaDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilterParams {
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots?: number;
  minArea?: number;
  maxArea?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  searchQuery?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  limit?: number;
  page?: number;
}

export interface VisitDTO {
  id: string;
  propertyId: string;
  property?: PropertyDTO;
  userId: string;
  user?: UserDTO;
  dateTime: string;
  type: VisitType;
  status: VisitStatus;
  notes?: string;
  createdAt: string;
}

export interface ProposalDTO {
  id: string;
  propertyId: string;
  property?: PropertyDTO;
  userId: string;
  user?: UserDTO;
  proposedAmount: number;
  notes?: string;
  status: ProposalStatus;
  createdAt: string;
}

export interface ContractDTO {
  id: string;
  proposalId: string;
  proposal?: ProposalDTO;
  startDate: string;
  endDate: string;
  monthlyAmount: number;
  status: ContractStatus;
  signedDocumentUrl?: string;
  createdAt: string;
}

export interface PaymentDTO {
  id: string;
  contractId: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  transactionId?: string;
  pixQrCode?: string;
  pixKey?: string;
  barCode?: string;
  paidAt?: string;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  text: string;
  createdAt: string;
}

export interface ConversationDTO {
  id: string;
  propertyId: string;
  property?: PropertyDTO;
  participantIds: string[];
  lastMessage?: MessageDTO;
  updatedAt: string;
}

export interface MaintenanceRequestDTO {
  id: string;
  contractId: string;
  propertyId: string;
  propertyTitle?: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
}

export interface LoginDTO {
  email: string;
  password?: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password?: string;
  role?: UserRole;
}

export interface AuthResponseDTO {
  user: UserDTO;
  accessToken: string;
}

export interface VerifyEmailDTO {
  email: string;
  code: string;
}


