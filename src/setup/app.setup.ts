import { INestApplication } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';
import { swaggerSetup } from './swagger.setup';
import { globalPrefixSetup } from './global-prefix.setup';
import { DomainHttpExceptionsFilter } from '../core/exceptions/filters/domain-exceptions.filter';
import { AllHttpExceptionsFilter } from '../core/exceptions/filters/all-exceptions.filter';
import cookieParser from 'cookie-parser';
import { CoreConfig } from '../core/core.config';

export function appSetup(app: INestApplication, coreConfig: CoreConfig) {
  pipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app);

  // validationConstraintSetup(app);
  // exceptionFilterSetup(app);

  //... etc

  // порядок регистрации оч важен
  app.useGlobalFilters(
    new AllHttpExceptionsFilter(),
    new DomainHttpExceptionsFilter(),
  );
  app.use(cookieParser(coreConfig.cookieSecret));
  app.enableCors({
  // Указываем конкретный адрес фронтенда. "*" нельзя использовать вместе с credentials: true
  origin: "http://localhost:3000", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "Accept-Language", 
    "x-client-lang"
  ],
});
}
