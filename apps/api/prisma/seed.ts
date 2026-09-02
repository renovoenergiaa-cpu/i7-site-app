import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Semeando banco de dados i7 - Sorocaba...');

  // Clear existing
  await prisma.message.deleteMany();
  await prisma.conversationUser.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.propertyMedia.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('i7@123456', 10);

  // Users
  const owner = await prisma.user.create({
    data: {
      name: 'Carlos Alberto Silva',
      email: 'proprietario@i7.com.br',
      phone: '(15) 98888-7777',
      passwordHash,
      role: 'OWNER',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const tenant = await prisma.user.create({
    data: {
      name: 'Mariana Costa Tech',
      email: 'locatario@i7.com.br',
      phone: '(15) 97777-6666',
      passwordHash,
      role: 'TENANT',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador i7',
      email: 'admin@i7.com.br',
      phone: '(15) 99999-0000',
      passwordHash,
      role: 'ADMIN',
      verified: true,
    },
  });

  console.log('✅ Usuários criados com sucesso.');

  // Properties in Sorocaba
  const prop1 = await prisma.property.create({
    data: {
      ownerId: owner.id,
      title: 'Apartamento Alto Padrão no Parque Campolim',
      description: 'Lindo apartamento totalmente mobiliado, equipado com fechadura eletrônica, automação residencial e vista panorâmica para o Parque Campolim. Condomínio com piscina aquecida e academia completa.',
      type: 'APARTMENT',
      status: 'PUBLISHED',
      street: 'Av. Antônio Carlos Comitre',
      number: '850',
      complement: 'Apto 1204',
      neighborhood: 'Parque Campolim',
      city: 'Sorocaba',
      state: 'SP',
      zipCode: '18047-620',
      latitude: -23.5350,
      longitude: -47.4645,
      rentPrice: 4800,
      condoFee: 650,
      iptuFee: 180,
      serviceFee: 384,
      bedrooms: 2,
      bathrooms: 2,
      parkingSpots: 2,
      areaSqm: 82,
      furnished: true,
      petFriendly: true,
      hasVirtualTour: true,
      virtualTourUrl: 'https://my.matterport.com/show/?m=sample_studio',
      media: {
        create: [
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000', type: 'PHOTO', order: 0 },
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000', type: 'PHOTO', order: 1 },
        ],
      },
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      ownerId: owner.id,
      title: 'Apartamento 3 Dorms no Mangal com Varanda Gourmet',
      description: 'Espaçoso apartamento recém reformado no Mangal. Possui 3 dormitórios sendo 1 suíte, ar condicionado e varanda integrada com churrasqueira.',
      type: 'APARTMENT',
      status: 'PUBLISHED',
      street: 'Rua José Maria Hanickel',
      number: '420',
      neighborhood: 'Mangal',
      city: 'Sorocaba',
      state: 'SP',
      zipCode: '18040-330',
      latitude: -23.5135,
      longitude: -47.4668,
      rentPrice: 3500,
      salePrice: 650000,
      condoFee: 500,
      iptuFee: 150,
      serviceFee: 280,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpots: 2,
      areaSqm: 95,
      furnished: true,
      petFriendly: true,
      hasVirtualTour: false,
      media: {
        create: [
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000', type: 'PHOTO', order: 0 },
          { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1000', type: 'PHOTO', order: 1 },
        ],
      },
    },
  });

  const prop3 = await prisma.property.create({
    data: {
      ownerId: owner.id,
      title: 'Apartamento Moderno no Jardim Emília',
      description: 'Excelente apartamento com acabamento fino, piso em porcelanato, iluminação em LED e armários planejados. Localização privilegiada ao lado de boas escolas e hospitais.',
      type: 'APARTMENT',
      status: 'PUBLISHED',
      street: 'Rua Washington Luiz',
      number: '1050',
      neighborhood: 'Jardim Emília',
      city: 'Sorocaba',
      state: 'SP',
      zipCode: '18031-000',
      latitude: -23.5189,
      longitude: -47.4612,
      rentPrice: 2800,
      condoFee: 400,
      iptuFee: 120,
      serviceFee: 224,
      bedrooms: 2,
      bathrooms: 1,
      parkingSpots: 1,
      areaSqm: 65,
      furnished: false,
      petFriendly: true,
      hasVirtualTour: false,
      media: {
        create: [
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000', type: 'PHOTO', order: 0 },
        ],
      },
    },
  });

  const prop4 = await prisma.property.create({
    data: {
      ownerId: owner.id,
      title: 'Apartamento Compacto e Funcional no Centro',
      description: 'Ótima opção para quem trabalha na região central. Edifício com portaria 24h, ao lado do terminal de ônibus e principais comércios de Sorocaba.',
      type: 'APARTMENT',
      status: 'PUBLISHED',
      street: 'Rua São Bento',
      number: '120',
      neighborhood: 'Centro',
      city: 'Sorocaba',
      state: 'SP',
      zipCode: '18010-030',
      latitude: -23.5015,
      longitude: -47.4581,
      rentPrice: 1500,
      condoFee: 250,
      iptuFee: 50,
      serviceFee: 120,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 0,
      areaSqm: 40,
      furnished: true,
      petFriendly: false,
      hasVirtualTour: false,
      media: {
        create: [
          { url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1000', type: 'PHOTO', order: 0 },
        ],
      },
    },
  });

  console.log('🌱 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
