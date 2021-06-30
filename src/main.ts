import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as helmet from 'helmet';

import { version } from '../package.json';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { environment } from './environment';

const globalPrefix = 'api';
const {
  apiName,
  nodeEnv,
  apiProtocol,
  apiHost,
  apiPort,
  adminPort,
} = environment;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  // Helmet must be the first app.use
  app.use(helmet());
  // NestJS execution order : Middleware -> Interceptors -> Route Handler -> Interceptors -> Exception Filter
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionFilter());

  if (nodeEnv === 'development') {
    const apiTitle = apiName[0].toUpperCase() + apiName.slice(1);
    const config = new DocumentBuilder()
      .addSecurity('bearer', { type: 'http', scheme: 'bearer' })
      .setTitle(apiTitle)
      .setVersion(version)
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
    SwaggerModule.setup(`${globalPrefix}/doc`, app, document, uiOptions);

    app.enableCors();
  }

  await app.listen(apiPort, () => {
    Logger.log(`${apiName} run in ${nodeEnv} mode`);
    if (nodeEnv === 'development') {
      Logger.log(
        `[doc] ${apiProtocol}://${apiHost}:${apiPort}/${globalPrefix}/doc`,
      );
      Logger.log(`[admin] http://localhost:${adminPort}`);
    }
  });
}

void bootstrap();
