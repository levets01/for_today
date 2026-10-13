import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ResponseWrapperInterceptor } from './common/interceptors/response-wrapper.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { AuthGuard } from './common/guards/auth.guard.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  const config = new DocumentBuilder()
    .setTitle('API solicitudes')
    .setDescription('administrar las solicitudes de seguimiento comercial')
    .setVersion('1.0')
    .addTag('solicitudes')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .addApiKey({ type: 'apiKey', name: 'x-user', in: 'header' }, 'x-user')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  document.security = [{ 'x-api-key': [], 'x-user': [] }];
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseWrapperInterceptor());
  app.useGlobalGuards(app.get(AuthGuard));

  const port = process.env.PORT ?? 3010;
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
}

await bootstrap();
