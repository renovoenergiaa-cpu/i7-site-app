import { NextResponse } from 'next/server';
import { PropertyDTO, PropertyType, PropertyStatus } from '@i7/types';

// Memória persistente no processo do servidor para propriedades publicadas em tempo real
let serverPropertiesStore: PropertyDTO[] = [];

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
