import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('i7 - Inteligência Imobiliária API')
    .setDescription('API RESTful completa para a proptech i7 (Aluguel, Compra, Gestão, Chat e Visitas)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  let port = Number(process.env.PORT || 4000);
  try {
    await app.listen(port);
  } catch (err: any) {
    if (err?.code === 'EADDRINUSE') {
      port = 4001;
      await app.listen(port);
    }
  }
  console.log(`🚀 i7 Backend API rodando em: http://localhost:${port}/api`);
  console.log(`📚 Swagger Docs disponível em: http://localhost:${port}/api/docs`);
}
bootstrap();
