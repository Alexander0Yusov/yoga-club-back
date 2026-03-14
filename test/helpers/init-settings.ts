import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Connection } from 'mongoose';
import { appSetup } from '../../src/setup/app.setup';
import { UsersTestManager } from './users-test-manager';
import { deleteAllData } from './delete-all-data';
import { EmailService } from '../../src/modules/mailer/email.service';
import { EmailServiceMock } from '../mock/email-service.mock';
import { initAppModule } from 'src/init-app-module';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from 'src/modules/user-accounts/constants/auth-tokens.inject-constants';
import { CoreConfig } from 'src/core/core.config';

export type InitSettingsOptions = {
  // Optional hook to customize the testing module (e.g. override providers).
  configureModule?: (moduleBuilder: TestingModuleBuilder) => void;
  // Enables EmailServiceMock to prevent real email sending and allow assertions.
  useEmailServiceMock?: boolean;
  // Optional per-test JWT expirations (useful for short-lived tokens in e2e).
  tokenExpiresIn?: {
    access?: CoreConfig['accessTokenExpireIn'];
    refresh?: CoreConfig['refreshTokenExpireIn'];
  };
  // Controls DB cleanup after app boot (default: true).
  resetDatabase?: boolean;
};

export type InitSettingsResult = {
  app: INestApplication;
  databaseConnection: Connection;
  httpServer: ReturnType<INestApplication['getHttpServer']>;
  userTestManger: UsersTestManager;
  emailServiceMock?: EmailServiceMock;
};

/**
 * Initializes a fully configured NestJS test application for e2e scenarios.
 *
 * Example:
 * const { app, userTestManger } = await initSettings({
 *   useEmailServiceMock: true,
 *   tokenExpiresIn: { access: '2s', refresh: '10s' },
 * });
 */
export const initSettings = async (
  // Backward compatible: allow passing a configure callback directly.
  optionsOrConfigure?:
    | InitSettingsOptions
    | ((moduleBuilder: TestingModuleBuilder) => void),
) => {
  // Normalize input to a structured options object.
  const options: InitSettingsOptions =
    typeof optionsOrConfigure === 'function'
      ? { configureModule: optionsOrConfigure }
      : optionsOrConfigure ?? {};

  // Build a dynamic app module (env-aware composition).
  const dynamicAppModule = await initAppModule();

  // Start a Nest testing module builder with the real app module.
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [dynamicAppModule],
  });

  // Optionally override EmailService with a mock for isolated e2e testing.
  if (options.useEmailServiceMock) {
    testingModuleBuilder.overrideProvider(EmailService).useClass(EmailServiceMock);
  }

  // Optionally override access token JWT service to set a custom expiration.
  if (options.tokenExpiresIn?.access) {
    testingModuleBuilder
      .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
      .useFactory({
        factory: (coreConfig: CoreConfig) => {
          return new JwtService({
            secret: coreConfig.accessTokenSecret,
            signOptions: { expiresIn: options.tokenExpiresIn?.access },
          });
        },
        inject: [CoreConfig],
      });
  }

  // Optionally override refresh token JWT service to set a custom expiration.
  if (options.tokenExpiresIn?.refresh) {
    testingModuleBuilder
      .overrideProvider(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
      .useFactory({
        factory: (coreConfig: CoreConfig) => {
          return new JwtService({
            secret: coreConfig.refreshTokenSecret,
            signOptions: { expiresIn: options.tokenExpiresIn?.refresh },
          });
        },
        inject: [CoreConfig],
      });
  }

  // Allow callers to apply extra overrides or test-only providers.
  if (options.configureModule) {
    options.configureModule(testingModuleBuilder);
  }

  // Compile the testing module into a runnable Nest application.
  const testingAppModule = await testingModuleBuilder.compile();

  // Create the Nest application instance from the compiled module.
  const app = testingAppModule.createNestApplication();

  // Apply global app configuration (pipes, filters, prefix, etc.).
  appSetup(app);

  // Initialize the application so DI and lifecycle hooks run.
  await app.init();

  // Resolve the Mongoose connection from the Nest container.
  const databaseConnection = app.get<Connection>(getConnectionToken());

  // Resolve the HTTP server for supertest.
  const httpServer = app.getHttpServer();

  // Create a test manager for user-related test helpers.
  const userTestManger = new UsersTestManager(app);

  // Resolve the EmailService mock instance if it was enabled.
  const emailServiceMock = options.useEmailServiceMock
    ? (app.get(EmailService) as EmailServiceMock)
    : undefined;

  // Optionally reset the database to guarantee a clean state.
  if (options.resetDatabase ?? true) {
    await deleteAllData(app);
  }

  // Return the initialized test utilities for e2e scenarios.
  return {
    app,
    databaseConnection,
    httpServer,
    userTestManger,
    emailServiceMock,
  } satisfies InitSettingsResult;
};
