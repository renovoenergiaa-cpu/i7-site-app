import { PropertyDTO, UserDTO, VisitDTO, ProposalDTO, PaymentDTO } from '@i7/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

import { BuildingUnit, INITIAL_UNITS, getStoredData } from './gestaoData';

function getApprovedUnitsAsProperties(): PropertyDTO[] {
  if (typeof window === 'undefined') return [];
  try {
    const units = getStoredData<BuildingUnit[]>('units', INITIAL_UNITS);
    const approved = units.filter(u => u.status === 'DISPONIVEL');

    return approved.map((u, index) => {
      // Usa estritamente a coordenada selecionada no anúncio pelo proprietário
      const hasCoords = typeof u.latitude === 'number' && typeof u.longitude === 'number' && !isNaN(u.latitude) && !isNaN(u.longitude) && u.latitude !== 0 && u.longitude !== 0;
      
      const exactLat = hasCoords ? u.latitude! : -23.5152 + ((index % 4) * 0.005);
      const exactLng = hasCoords ? u.longitude! : -47.4526 + ((index % 3) * 0.005);

      return {
        id: u.id,
        ownerId: 'owner-i7',
        title: u.unitNumber,
        description: u.adminFeedback 
          ? `[Parecer i7]: ${u.adminFeedback}` 
          : `Imóvel avaliado e aprovado pela i7 em ${u.buildingName}. Excelente estado de conservação, com ${u.areaSqm}m², ${u.bedrooms || 1} quarto(s) e infraestrutura completa.`,
        type: (u.type === 'APARTAMENTO' ? 'APARTMENT' : u.type === 'STUDIO' ? 'STUDIO' : 'HOUSE') as any,
        status: 'PUBLISHED' as any,
        street: u.street || u.address || u.buildingName,
        number: '100',
        neighborhood: u.neighborhood || 'Vila Hortência',
        city: u.city || 'Sorocaba',
        state: u.state || 'SP',
        zipCode: '18000-000',
        latitude: exactLat,
        longitude: exactLng,
        rentPrice: u.rentValue,
        condoFee: u.condoValue,
        iptuFee: u.iptuValue,
        serviceFee: Math.round(u.rentValue * 0.08),
        totalMonthly: u.rentValue + u.condoValue + u.iptuValue + Math.round(u.rentValue * 0.08),
        bedrooms: u.bedrooms || 1,
        bathrooms: u.bathrooms || 1,
        parkingSpots: u.parkingSpaces || 0,
        areaSqm: u.areaSqm,
        furnished: u.furnished || false,
        petFriendly: u.petFriendly || true,
        hasVirtualTour: false,
        media: (u.photos && u.photos.length > 0)
          ? u.photos.map((url, i) => ({ id: `m-${u.id}-${i}`, propertyId: u.id, url, type: 'PHOTO' as const, order: i }))
          : [
              { id: `m-${u.id}-0`, propertyId: u.id, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000', type: 'PHOTO' as const, order: 0 }
            ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
  } catch {
    return [];
  }
}

export async function fetchProperties(params?: Record<string, any>): Promise<PropertyDTO[]> {
  try {
    const dynamicApproved = getApprovedUnitsAsProperties();
    return [...dynamicApproved, ...MOCK_PROPERTIES];
  } catch (error) {
    return MOCK_PROPERTIES;
  }
}

export async function fetchPropertyById(id: string): Promise<PropertyDTO> {
  const dynamicApproved = getApprovedUnitsAsProperties();
  const foundDynamic = dynamicApproved.find(p => p.id === id);
  if (foundDynamic) return foundDynamic;

  const found = MOCK_PROPERTIES.find(p => p.id === id);
  if (found) return found;
  return MOCK_PROPERTIES[0];
}

// Imóveis Oficiais de Demonstração na Praça da i7 (Sorocaba - SP)
export const MOCK_PROPERTIES: PropertyDTO[] = [
  {
    id: 'prop-1',
    ownerId: 'owner-1',
    title: 'Studio Conceito no Parque Campolim com Varanda Gourmet',
    description: 'Studio conceito aberto totalmente mobiliado com fechadura digital, automação Alexa e vista panorâmica para o Parque Campolim. Condomínio com piscina aquecida no rooftop, coworking e lavanderia compartilhada.',
    type: 'STUDIO' as any,
    status: 'PUBLISHED' as any,
    street: 'Av. Antônio Carlos Comitre',
    number: '1200',
    neighborhood: 'Parque Campolim',
    city: 'Sorocaba',
    state: 'SP',
    zipCode: '18047-620',
    latitude: -23.5285,
    longitude: -47.4645,
    rentPrice: 3500,
    condoFee: 480,
    iptuFee: 120,
    serviceFee: 280,
    totalMonthly: 4380,
    bedrooms: 1,
    bathrooms: 1,
    parkingSpots: 1,
    areaSqm: 45,
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
    title: 'Apartamento de Alto Padrão 3 Dorms na Vila Hortência',
    description: 'Espaçoso apartamento próximo à sede corporativa i7 na Vila Hortência. Possui 3 dormitórios sendo 1 suíte, varanda com churrasqueira a carvão e 2 vagas de garagem demarcadas.',
    type: 'APARTMENT' as any,
    status: 'PUBLISHED' as any,
    street: 'Rua Cel. Nogueira Padilha',
    number: '374',
    neighborhood: 'Vila Hortência',
    city: 'Sorocaba',
    state: 'SP',
    zipCode: '18020-000',
    latitude: -23.5152,
    longitude: -47.4526,
    rentPrice: 4200,
    salePrice: 750000,
    condoFee: 550,
    iptuFee: 160,
    serviceFee: 336,
    totalMonthly: 5246,
    bedrooms: 3,
    bathrooms: 2,
    parkingSpots: 2,
    areaSqm: 92,
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
    title: 'Casa Térrea Moderna no Jardim Emília com Jardim Privativo',
    description: 'Casa isolada cercada de verde e tranquilidade no Jardim Emília em Sorocaba. Iluminação natural abundante, acabamento em porcelanato e espaço gourmet externo.',
    type: 'HOUSE' as any,
    status: 'PUBLISHED' as any,
    street: 'Rua Capitão Nascimento Filho',
    number: '210',
    neighborhood: 'Jardim Emília',
    city: 'Sorocaba',
    state: 'SP',
    zipCode: '18031-030',
    latitude: -23.5180,
    longitude: -47.4590,
    rentPrice: 5800,
    condoFee: 0,
    iptuFee: 210,
    serviceFee: 464,
    totalMonthly: 6474,
    bedrooms: 3,
    bathrooms: 3,
    parkingSpots: 2,
    areaSqm: 160,
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
    title: 'Imóvel Comercial / Loja no Além Ponte em Sorocaba',
    description: 'Excelente ponto comercial com fachada envidraçada de alta visibilidade no Além Ponte. Amplo salão principal, copa de apoio, 2 banheiros acessíveis e estacionamento frontal.',
    type: 'COMMERCIAL' as any,
    status: 'PUBLISHED' as any,
    street: 'Rua Coronel Cavalheiros',
    number: '145',
    neighborhood: 'Além Ponte',
    city: 'Sorocaba',
    state: 'SP',
    zipCode: '18020-010',
    latitude: -23.5042,
    longitude: -47.4475,
    rentPrice: 3200,
    condoFee: 0,
    iptuFee: 140,
    serviceFee: 256,
    totalMonthly: 3596,
    bedrooms: 0,
    bathrooms: 2,
    parkingSpots: 3,
    areaSqm: 110,
    furnished: false,
    petFriendly: true,
    hasVirtualTour: false,
    media: [
      { id: 'm8', propertyId: 'prop-4', url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1000', type: 'PHOTO', order: 0 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
