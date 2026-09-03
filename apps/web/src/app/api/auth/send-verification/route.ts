import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'E-mail e código de verificação são obrigatórios.' },
        { status: 400 }
      );
    }

    console.log('====================================================');
    console.log('🔐 [i7 SEGURANÇA] DISPARO DE CÓDIGO DE ATIVAÇÃO OTP');
    console.log(`Destinatário: ${name ? `${name} <${email}>` : email}`);
    console.log(`Código de 6 Dígitos: [ ${code} ]`);
    console.log(`Validade: 15 minutos`);
    console.log('====================================================');

    // Aqui pode ser conectado Resend / Sendgrid / Nodemailer com API Key oficial
    return NextResponse.json({
      success: true,
      message: `Código de verificação enviado para ${email}.`,
      data: { email, codeSent: true }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Falha ao despachar e-mail de verificação.' },
      { status: 500 }
    );
  }
}
