import { NextResponse } from 'next/server';
import { PropertyDTO } from '@i7/types';
import { isDummyProperty } from '@/lib/supabaseProperties';

// Memória persistente no processo do servidor para propriedades publicadas em tempo real
let serverPropertiesStore: PropertyDTO[] = [];

export async function GET() {
  const clean = serverPropertiesStore.filter(p => !isDummyProperty(p));
  return NextResponse.json({ properties: clean });
}

export async function POST(req: Request) {
  try {
    const property: PropertyDTO = await req.json();
    if (!property || !property.id || isDummyProperty(property)) {
      return NextResponse.json({ success: true, count: serverPropertiesStore.length });
    }

    const filtered = serverPropertiesStore.filter(p => p.id !== property.id && !isDummyProperty(p));
    serverPropertiesStore = [property, ...filtered];

    return NextResponse.json({ success: true, count: serverPropertiesStore.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
