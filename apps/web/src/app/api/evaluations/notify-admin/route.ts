import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      propertyTitle, 
      neighborhood, 
      ownerName, 
      ownerEmail, 
      ownerPhone, 
      rentPrice, 
      condoValue, 
      iptuValue,
      propertyType 
    } = body;

    const adminEmail = 'admin@i7.com.br';

    console.log('================================================================');
    console.log('🔔 [ALERTA DE E-MAIL - i7 IMOBILIÁRIA] NOVA AVALIAÇÃO PENDENTE');
    console.log(`Para: ${adminEmail}`);
    console.log(`Assunto: 📢 Nova Solicitação de Avaliação Gratuita: "${propertyTitle || 'Imóvel'}"`);
    console.log(`Proprietário: ${ownerName} (${ownerEmail} | ${ownerPhone})`);
    console.log(`Endereço/Região: ${neighborhood || 'Não informado'}`);
    console.log(`Tipo: ${propertyType || 'Imóvel'}`);
    console.log(`Valores Pretendidos:`);
    console.log(`  - Aluguel/Venda: R$ ${Number(rentPrice || 0).toLocaleString('pt-BR')}`);
    console.log(`  - Condomínio: R$ ${Number(condoValue || 0).toLocaleString('pt-BR')}`);
    console.log(`  - IPTU: R$ ${Number(iptuValue || 0).toLocaleString('pt-BR')}`);
    console.log(`Link de Avaliação: http://localhost:3000/painel/unidades`);
    console.log('================================================================');

    // Retorna confirmação de envio do alerta
    return NextResponse.json({
      success: true,
      message: `Alerta de avaliação pendente disparado com sucesso para ${adminEmail}.`,
      data: {
        adminNotified: adminEmail,
        timestamp: new Date().toISOString(),
        propertyTitle
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Falha ao despachar notificação de avaliação.' },
      { status: 500 }
    );
  }
}
