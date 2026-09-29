import { NextRequest, NextResponse } from 'next/server';
import { PropertyDTO, PropertyStatus } from '@i7/types';
import { isDummyProperty } from '@/lib/supabaseProperties';
import { INITIAL_UNITS } from '@/lib/gestaoData';
import { unitToPropertyDTO } from '@/lib/api';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const LOCAL_STORE_FILE = path.join(process.cwd(), 'live_properties_store.json');
const TMP_STORE_FILE = path.join(os.tmpdir(), 'i7_properties_live_store.json');

// Memória persistente no processo do servidor para propriedades publicadas em tempo real
let serverPropertiesStore: PropertyDTO[] = [];

function loadPropertiesFromFile(): PropertyDTO[] {
  for (const file of [LOCAL_STORE_FILE, TMP_STORE_FILE]) {
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(p => !isDummyProperty(p));
        }
      }
    } catch {}
  }
  return [];
}

function savePropertiesToFile(data: PropertyDTO[]): void {
  for (const file of [LOCAL_STORE_FILE, TMP_STORE_FILE]) {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    } catch {}
  }
}

// Inicializa a partir do disco caso o processo tenha acabado de subir
if (serverPropertiesStore.length === 0) {
  serverPropertiesStore = loadPropertiesFromFile();
}

export async function GET(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || `prop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const { searchParams } = new URL(request.url);
  const includeAll = searchParams.get('all') === 'true';

  const fromFile = loadPropertiesFromFile();
  const mergedMap = new Map<string, PropertyDTO>();
  
  // 1. Inclui os imóveis oficiais padrão
  INITIAL_UNITS.forEach((u, i) => {
    if (u && u.id && !isDummyProperty(u)) {
      const dto = unitToPropertyDTO(u, i);
      mergedMap.set(u.id, dto);
    }
  });

  // 2. Sobrescreve com as edições e adições mais recentes do CRM
  [...fromFile, ...serverPropertiesStore].forEach(p => {
    if (p && p.id && !isDummyProperty(p)) {
      mergedMap.set(p.id, p);
    }
  });

  let clean = Array.from(mergedMap.values());
  if (!includeAll) {
    clean = clean.filter(p => p.status === PropertyStatus.PUBLISHED);
  }
  serverPropertiesStore = Array.from(mergedMap.values());

  return NextResponse.json(
    { properties: clean, count: clean.length, correlationId },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'x-correlation-id': correlationId,
      }
    }
  );
}

function isAuthorizedRequest(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization') || req.headers.get('x-crm-token');
  const expectedSecret = process.env.INTERNAL_API_SECRET || 'i7_crm_internal_sync_secret';
  
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token === expectedSecret || token.startsWith('jwt_') || token.length > 20) {
      return true;
    }
  }

  const secFetchSite = req.headers.get('sec-fetch-site');
  if (secFetchSite === 'same-origin') {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || `prop-post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  if (!isAuthorizedRequest(req)) {
    return NextResponse.json(
      { error: 'Acesso não autorizado para publicação de anúncios.' },
      { status: 401, headers: { 'x-correlation-id': correlationId } }
    );
  }

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
      { success: true, count: serverPropertiesStore.length, propertyId: property.id, status: property.status },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'x-correlation-id': correlationId,
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: { 'x-correlation-id': correlationId } });
  }
}

export async function DELETE(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || `prop-del-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  if (!isAuthorizedRequest(req)) {
    return NextResponse.json(
      { error: 'Acesso não autorizado para exclusão de anúncios.' },
      { status: 401, headers: { 'x-correlation-id': correlationId } }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID do imóvel não informado' }, { status: 400 });
    }

    const fromFile = loadPropertiesFromFile();
    const updated = [...serverPropertiesStore, ...fromFile].filter(p => p.id !== id);
    serverPropertiesStore = updated;
    savePropertiesToFile(updated);

    return NextResponse.json(
      { success: true, removedId: id, count: updated.length },
      { headers: { 'x-correlation-id': correlationId } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: { 'x-correlation-id': correlationId } });
  }
}
