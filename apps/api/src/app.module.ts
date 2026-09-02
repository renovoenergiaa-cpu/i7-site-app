import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PropertyModule } from './property/property.module';
import { VisitModule } from './visit/visit.module';
import { ProposalModule } from './proposal/proposal.module';
import { PaymentModule } from './payment/payment.module';
import { ChatModule } from './chat/chat.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { AuditService } from './common/services/audit.service';
import { OwnershipGuard } from './common/guards/ownership.guard';
import { DocumentsModule } from './documents/documents.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PropertyModule,
    VisitModule,
    ProposalModule,
    PaymentModule,
    ChatModule,
    MaintenanceModule,
    DocumentsModule,
    AnnouncementsModule,
    FinanceModule,
  ],
  providers: [AuditService, OwnershipGuard],
  exports: [AuditService, OwnershipGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
