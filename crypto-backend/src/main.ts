import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with specific origin and credentials
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Enable global validation pipes
  app.useGlobalPipes(new ValidationPipe());

  // Swagger API documentation setup
  const config = new DocumentBuilder()
    .setTitle('Crypto Simulator API')
    .setDescription('API for simulating crypto trading')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3000);
}
bootstrap();
