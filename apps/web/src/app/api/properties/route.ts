import { NextResponse } from 'next/server';
import { PropertyDTO, PropertyType, PropertyStatus } from '@i7/types';

const DEFAULT_PROPERTY: PropertyDTO = {
  id: 'b3106524-17ad-4a9b-a6fa-e9fa93637c31',
  ownerId: 'owner-i7',
  title: 'Apto 31 - Residencial Mangal Gourmet',
  description: 'Imóvel avaliado e aprovado pela i7 em Residencial Mangal Gourmet. Excelente estado de conservação, com 95m², ambientes amplos e bem ventilados, e infraestrutura completa em Sorocaba.',
  type: PropertyType.APARTMENT,
  status: PropertyStatus.PUBLISHED,
  street: 'Rua Residencial Mangal Gourmet',
  number: '100',
  neighborhood: 'Vila Hortência',
  city: 'Sorocaba',
  state: 'SP',
  zipCode: '18020-000',
  latitude: -23.5152,
  longitude: -47.4526,
  rentPrice: 3500,
  condoFee: 500,
  iptuFee: 150,
  serviceFee: 150,
  totalMonthly: 4300,
  bedrooms: 1,
  bathrooms: 1,
  parkingSpots: 1,
  areaSqm: 95,
  furnished: false,
  petFriendly: true,
  hasVirtualTour: false,
  media: [
    {
      id: '017ed1c3-724a-4916-b7e8-f706cffcaa03',
      url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000',
      type: 'PHOTO',
      order: 0,
      propertyId: 'b3106524-17ad-4a9b-a6fa-e9fa93637c31'
    }
  ],
  createdAt: '2026-09-13T00:35:09.846Z',
  updatedAt: '2026-09-13T00:35:09.846Z'
};

// Memória persistente no processo do servidor para propriedades publicadas
let serverPropertiesStore: PropertyDTO[] = [DEFAULT_PROPERTY];

export async function GET() {
  return NextResponse.json({ properties: serverPropertiesStore });
}

export async function POST(req: Request) {
  try {
    const property: PropertyDTO = await req.json();
    if (!property || !property.id) {
      return NextResponse.json({ error: 'Propriedade inválida' }, { status: 400 });
    }

    const filtered = serverPropertiesStore.filter(p => p.id !== property.id);
    serverPropertiesStore = [property, ...filtered];

    return NextResponse.json({ success: true, count: serverPropertiesStore.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
