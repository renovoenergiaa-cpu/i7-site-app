import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, phone } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Por favor, preencha os campos obrigatórios (nome, e-mail e mensagem).' },
        { status: 400 }
      );
    }

    const protocol = `CT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    console.log('=============================================');
    console.log('📩 NOVO CONTATO RECEBIDO VIA SITE i7');
    console.log(`Protocolo: ${protocol}`);
    console.log(`Nome: ${name}`);
    console.log(`E-mail: ${email}`);
    console.log(`Telefone: ${phone || 'Não informado'}`);
    console.log(`Assunto: ${subject || 'Sem assunto'}`);
    console.log(`Mensagem: ${message}`);
    console.log('=============================================');

    // Aqui pode ser integrado o Resend / Nodemailer / webhook para disparo imediato
    return NextResponse.json({
      success: true,
      protocol,
      message: 'Mensagem recebida com sucesso pela equipe i7.',
      data: { name, email, subject, protocol }
    });
  } catch (error: any) {
    console.error('Erro ao processar mensagem de contato:', error);
    return NextResponse.json(
      { success: false, error: 'Ocorreu um erro interno ao enviar sua mensagem. Tente novamente.' },
      { status: 500 }
    );
  }
}
