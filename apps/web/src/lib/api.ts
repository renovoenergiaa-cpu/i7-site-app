import { PropertyDTO, UserDTO, VisitDTO, ProposalDTO, PaymentDTO } from '@i7/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function fetchProperties(params?: Record<string, any>): Promise<PropertyDTO[]> {
  try {
    const query = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE_URL}/properties?${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Falha ao buscar imóveis');
    return await res.json();
  } catch (error) {
    console.warn('API não conectada, utilizando fallback de demonstração i7:', error);
    return MOCK_PROPERTIES;
  }
}

export async function fetchPropertyById(id: string): Promise<PropertyDTO> {
  try {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Imóvel não encontrado');
    return await res.json();
  } catch (error) {
    const found = MOCK_PROPERTIES.find(p => p.id === id);
    if (found) return found;
    return MOCK_PROPERTIES[0];
  }
}

// Rich fallback mock data matching i7 schema
export const MOCK_PROPERTIES: PropertyDTO[] = [
  {
    id: 'prop-1',
    ownerId: 'owner-1',
    title: 'Studio High-Tech em Pinheiros com Varanda Gourmet',
    description: 'Studio conceito aberto totalmente mobiliado com fechadura digital, automação Alexa e vista panorâmica para o por do sol de Pinheiros. Condomínio com piscina aquecida no rooftop, coworking e lavanderia OMO.',
    type: 'STUDIO' as any,
    status: 'PUBLISHED' as any,
    street: 'Rua dos Pinheiros',
    number: '850',
    neighborhood: 'Pinheiros',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '05422-001',
    latitude: -23.5645,
    longitude: -46.6898,
    rentPrice: 3800,
    condoFee: 650,
    iptuFee: 180,
    serviceFee: 304,
    totalMonthly: 4934,
    bedrooms: 1,
    bathrooms: 1,
    parkingSpots: 1,
    areaSqm: 42,
    furnished: true,
    petFriendly: true,
    hasVirtualTour: true,
    virtualTourUrl: 'https://my.matterport.com/show/?m=sample_studio',
    media: [
      { id: 'm1', propertyId: 'prop-1', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000', type: 'PHOTO', order: 0 },
      { id: 'm2', propertyId: 'prop-1', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000', type: 'PHOTO', order: 1 },
      { id: 'm3', propertyId: 'prop-1', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000', type: 'PHOTO', order: 2 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prop-2',
    ownerId: 'owner-1',
    title: 'Apartamento de Luxo 3 Dorms no Itaim Bibi com Automação',
    description: 'Espaçoso apartamento reformado por arquiteto renomado. Possui 3 suítes, ar condicionado split em todos os ambientes, varanda integrada com churrasqueira e 2 vagas demarcadas.',
    type: 'APARTMENT' as any,
    status: 'PUBLISHED' as any,
    street: 'Rua Joaquim Floriano',
    number: '420',
    neighborhood: 'Itaim Bibi',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '04534-002',
    latitude: -23.5841,
    longitude: -46.6749,
    rentPrice: 8500,
    salePrice: 2400000,
    condoFee: 1400,
    iptuFee: 450,
    serviceFee: 680,
    totalMonthly: 11030,
    bedrooms: 3,
    bathrooms: 3,
    parkingSpots: 2,
    areaSqm: 118,
    furnished: true,
    petFriendly: true,
    hasVirtualTour: true,
    media: [
      { id: 'm4', propertyId: 'prop-2', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000', type: 'PHOTO', order: 0 },
      { id: 'm5', propertyId: 'prop-2', url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1000', type: 'PHOTO', order: 1 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prop-3',
    ownerId: 'owner-1',
    title: 'Casa Minimalista Modernista na Vila Madalena com Jardim',
    description: 'Casa isolada cercada por verde no coração da Vila Madalena. Iluminação natural abundante, piso em cimento queimado, espaço pet expansivo e energia solar instalada.',
    type: 'HOUSE' as any,
    status: 'PUBLISHED' as any,
    street: 'Rua Harmonia',
    number: '1050',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '05435-001',
    latitude: -23.5539,
    longitude: -46.6912,
    rentPrice: 6200,
    condoFee: 0,
    iptuFee: 320,
    serviceFee: 496,
    totalMonthly: 7016,
    bedrooms: 2,
    bathrooms: 2,
    parkingSpots: 1,
    areaSqm: 140,
    furnished: false,
    petFriendly: true,
    hasVirtualTour: false,
    media: [
      { id: 'm6', propertyId: 'prop-3', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000', type: 'PHOTO', order: 0 },
      { id: 'm7', propertyId: 'prop-3', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000', type: 'PHOTO', order: 1 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prop-4',
    ownerId: 'owner-1',
    title: 'Kitnet Tech e Funcional no Jardins perto do Metrô',
    description: 'Excelente opção para estudantes e jovens profissionais. Totalmente mobiliado com cama baú, cooktop por indução, smart TV e internet fibra dedicada inclusa.',
    type: 'KITNET' as any,
    status: 'PUBLISHED' as any,
    street: 'Alameda Santos',
    number: '1200',
    neighborhood: 'Jardins',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01418-100',
    latitude: -23.5629,
    longitude: -46.6548,
    rentPrice: 2700,
    condoFee: 390,
    iptuFee: 90,
    serviceFee: 216,
    totalMonthly: 3396,
    bedrooms: 1,
    bathrooms: 1,
    parkingSpots: 0,
    areaSqm: 28,
    furnished: true,
    petFriendly: false,
    hasVirtualTour: true,
    media: [
      { id: 'm8', propertyId: 'prop-4', url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1000', type: 'PHOTO', order: 0 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
