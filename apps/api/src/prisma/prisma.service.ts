import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Conectado com sucesso ao banco de dados PostgreSQL i7');
    } catch (error) {
      console.warn('⚠️ Banco de dados PostgreSQL não detectado em localhost:5432.');
      console.warn('💡 Para conectar ao banco real: execute `docker-compose up -d` e depois `npm run db:push && npm run db:seed`.');
      console.warn('💡 A API e o Frontend continuarão funcionando com os dados de demonstração integrados.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
