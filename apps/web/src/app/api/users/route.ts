import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GestaoUser } from '@/lib/gestaoData';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Consulta usuários oficiais no banco de dados Supabase/PostgreSQL
    const { data, error } = await supabase
      .from('User')
      .select('id, name, email, phone, role, verified, createdAt')
      .order('createdAt', { ascending: false });

    if (error) {
      console.warn('[API /api/users] Erro na consulta do Supabase:', error.message);
      return NextResponse.json([]);
    }

    // 2. Mapeia para o formato padrão do GestaoUser garantindo higienização
    const MOCK_EMAILS = ['proprietario@i7.com.br', 'locatario@i7.com.br', 'admin-impar@i7.com.br'];

    const users: GestaoUser[] = (data || [])
      .filter((u: any) => {
        if (!u || !u.email) return false;
        const email = u.email.toLowerCase().trim();
        const name = (u.name || '').toLowerCase().trim();
        if (MOCK_EMAILS.includes(email)) return false;
        if (name.includes('carlos alberto') || name.includes('mariana costa')) return false;
        return true;
      })
      .map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '(15) 3090-4000',
        role: u.role as any,
        status: u.verified ? ('ATIVO' as const) : ('PENDENTE' as const),
        createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
      }));

    return NextResponse.json(users);
  } catch (err: any) {
    console.error('[API /api/users] Erro inesperado:', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário não fornecido.' }, { status: 400 });
    }

    // Deleta o usuário da base de dados PostgreSQL
    const { error } = await supabase
      .from('User')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('[API /api/users DELETE] Erro ao deletar no Supabase:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('[API /api/users DELETE] Erro interno:', err);
    return NextResponse.json({ error: 'Falha ao remover usuário' }, { status: 500 });
  }
}
