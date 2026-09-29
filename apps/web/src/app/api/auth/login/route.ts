import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { UserRole } from '@i7/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const inputPassword = (password || '').trim();

    if (!normalizedEmail || !inputPassword) {
      return NextResponse.json(
        { error: 'Informe o e-mail e a senha.' },
        { status: 400 }
      );
    }

    // 1. Consulta o usuário na base oficial do PostgreSQL via Supabase Client
    let user: any = null;
    try {
      const { data, error } = await supabase
        .from('User')
        .select('id, name, email, phone, passwordHash, role, verified, createdAt')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (!error && data) {
        user = data;
      }
    } catch (dbErr: any) {
      console.warn('[API /api/auth/login] Consulta Supabase retornou aviso:', dbErr?.message);
    }

    // 2. Se não encontrou diretamente, tenta consultar a API NestJS caso esteja online
    if (!user) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const apiRes = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, password: inputPassword }),
        });

        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData?.user && apiData?.accessToken) {
            const response = NextResponse.json({
              success: true,
              session: apiData,
            });

            const cookiePayload = encodeURIComponent(
              JSON.stringify({
                id: apiData.user.id,
                role: apiData.user.role,
                email: apiData.user.email,
                exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
              })
            );

            response.cookies.set('i7_auth_session', cookiePayload, {
              path: '/',
              maxAge: 604800,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            });

            return response;
          }
        }
      } catch {}
    }

    // 3. Validação do usuário encontrado no banco
    if (user) {
      const isMatch = await bcrypt.compare(inputPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Senha incorreta. Verifique e tente novamente.' },
          { status: 401 }
        );
      }

      if (!user.verified) {
        return NextResponse.json(
          { error: 'EMAIL_NOT_VERIFIED', email: user.email },
          { status: 403 }
        );
      }

      const session = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role as UserRole,
          verified: user.verified,
          createdAt: user.createdAt,
        },
        accessToken: `jwt_session_${user.id}_${Date.now()}`,
      };

      const response = NextResponse.json({
        success: true,
        session,
      });

      const cookiePayload = encodeURIComponent(
        JSON.stringify({
          id: session.user.id,
          role: session.user.role,
          email: session.user.email,
          exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
        })
      );

      response.cookies.set('i7_auth_session', cookiePayload, {
        path: '/',
        maxAge: 604800,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    }

    // 4. E-mail não localizado na base de dados
    return NextResponse.json(
      { error: 'E-mail não cadastrado. Verifique o endereço digitado ou clique em "Criar Conta".' },
      { status: 404 }
    );
  } catch (err: any) {
    console.error('[API /api/auth/login] Erro não tratado:', err);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao processar a autenticação.' },
      { status: 500 }
    );
  }
}
