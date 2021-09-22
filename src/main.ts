import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as helmet from 'helmet';
import { join } from 'path';

import { version } from '../package.json';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { environment } from './environment';

const globalPrefix = 'api';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Helmet must be the first app.use
  app.use(helmet());
  // NestJS execution order : Middleware -> Interceptors -> Route Handler -> Interceptors -> Exception Filter
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      // Show more details in class-validator error object
      exceptionFactory: (e): BadRequestException => new BadRequestException(e),
      whitelist: true,
      transform: true,
      validationError: { target: false, value: false },
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionFilter());

  app.useStaticAssets(join(__dirname, '..', '..', '/uploads/public/'), {
    prefix: `/${globalPrefix}/uploads/public/`,
  });

  if (environment.nodeEnv === 'development' || environment.apiOpenapiEnabled) {
    const apiTitle =
      environment.apiName[0].toUpperCase() + environment.apiName.slice(1);
    const config = new DocumentBuilder()
      .addSecurity('bearer', { type: 'http', scheme: 'bearer' })
      .setTitle(apiTitle)
      .setDescription('Nestjs API REST starter.')
      .setVersion(version)
      .addServer(
        `${environment.apiProtocol}://${environment.apiHost}:${environment.apiPort}`,
      )
      .build();
    const options: SwaggerDocumentOptions = {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
    };
    const uiOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: apiTitle,
      customCss: `
        .swagger-ui .info { margin: 10px 0; }
        .main { margin: 0 !important; }
        .topbar { display: none; }
        .swagger-ui .scheme-container { padding: 10px; }
      `,
    };
    const document = SwaggerModule.createDocument(app, config, options);
    SwaggerModule.setup(
      `${globalPrefix ? `${globalPrefix}/doc` : '/doc'}`,
      app,
      document,
      uiOptions,
    );
  }

  if (environment.nodeEnv === 'development') {
    app.enableCors();
  }

  await app.listen(environment.apiPort, () => {
    Logger.log(`${environment.apiName} run in ${environment.nodeEnv} mode`);
    if (environment.nodeEnv === 'development') {
      Logger.log(
        `[doc] ${environment.apiProtocol}://${environment.apiHost}:${
          environment.apiPort
        }/${globalPrefix ? `${globalPrefix}/doc` : 'doc'}`,
      );
      Logger.log(`[admin] http://localhost:${environment.adminPort}`);
    }
  });
}

void bootstrap();
