import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Extraindo dados para simular o envio de email
    const title = formData.get('title');
    const type = formData.get('type');
    const neighborhood = formData.get('neighborhood');
    const price = formData.get('price');
    const bedrooms = formData.get('bedrooms');
    const bathrooms = formData.get('bathrooms');
    const parkingSpaces = formData.get('parkingSpaces');
    const petFriendly = formData.get('petFriendly');
    const furnished = formData.get('furnished');
    
    // Contando fotos
    let photoCount = 0;
    formData.forEach((value, key) => {
      if (key.startsWith('photo_')) {
        photoCount++;
      }
    });

    console.log('--- NOVO CADASTRO DE IMÓVEL (Para Avaliação) ---');
    console.log(`Título: ${title}`);
    console.log(`Tipo: ${type}`);
    console.log(`Bairro: ${neighborhood}`);
    console.log(`Preço: R$ ${price}`);
    console.log(`Quartos: ${bedrooms}`);
    console.log(`Banheiros: ${bathrooms}`);
    console.log(`Vagas: ${parkingSpaces}`);
    console.log(`Aceita Pets: ${petFriendly === 'true' ? 'Sim' : 'Não'}`);
    console.log(`Mobiliado: ${furnished === 'true' ? 'Sim' : 'Não'}`);
    console.log(`Fotos anexadas: ${photoCount}`);
    console.log('-------------------------------------------------');

    // Aqui integrariamos com SendGrid, Resend, Nodemailer, etc.
    // para enviar um email real para o email da empresa (ex: contato@i7.com.br)

    return NextResponse.json({ success: true, message: 'Dados recebidos para avaliação.' });
  } catch (error) {
    console.error('Erro ao processar o formulário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar a requisição.' },
      { status: 500 }
    );
  }
}
