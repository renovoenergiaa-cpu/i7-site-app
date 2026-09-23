import { NextResponse } from 'next/server';
import { PropertyDTO } from '@i7/types';
import { isDummyProperty } from '@/lib/supabaseProperties';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STORE_FILE = path.join(os.tmpdir(), 'i7_properties_live_store.json');

// Memória persistente no processo do servidor para propriedades publicadas em tempo real
let serverPropertiesStore: PropertyDTO[] = [];

function loadPropertiesFromFile(): PropertyDTO[] {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(p => !isDummyProperty(p));
      }
    }
  } catch {}
  return [];
}

function savePropertiesToFile(data: PropertyDTO[]): void {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data), 'utf8');
  } catch {}
}

// Inicializa a partir do disco caso o processo tenha acabado de subir
if (serverPropertiesStore.length === 0) {
  serverPropertiesStore = loadPropertiesFromFile();
}

export async function GET() {
  // Recarrega do arquivo para sincronizar caso múltiplos workers/processos estejam rodando
  const fromFile = loadPropertiesFromFile();
  const mergedMap = new Map<string, PropertyDTO>();
  
  [...serverPropertiesStore, ...fromFile].forEach(p => {
    if (p && p.id && !isDummyProperty(p)) {
      mergedMap.set(p.id, p);
    }
  });

  const clean = Array.from(mergedMap.values());
  serverPropertiesStore = clean;

  return NextResponse.json(
    { properties: clean },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    }
  );
}

export async function POST(req: Request) {
  try {
    const property: PropertyDTO = await req.json();
    if (!property || !property.id || isDummyProperty(property)) {
      return NextResponse.json({ success: true, count: serverPropertiesStore.length });
    }

    const fromFile = loadPropertiesFromFile();
    const filtered = [...serverPropertiesStore, ...fromFile].filter(p => p.id !== property.id && !isDummyProperty(p));
    serverPropertiesStore = [property, ...filtered];
    savePropertiesToFile(serverPropertiesStore);

    return NextResponse.json(
      { success: true, count: serverPropertiesStore.length },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
