import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  }))
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({whitelist: true}));
  const config = new DocumentBuilder()
    .setTitle('Appointify')
    .setDescription('The new DOCS for Appointify, the new appointment app')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(3000);
}
bootstrap();
