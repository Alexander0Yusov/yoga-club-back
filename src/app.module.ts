// важно configModule импортировать первым
import { configModule } from './config-dynamic-module';

import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestingModule } from './modules/testing/testing.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { CoreModule } from './core/core.module';
import { ContentModule } from './modules/content/content.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { MediaModule } from './modules/media/media.module';
import { CoreConfig } from './core/core.config';
import { ThrottlerModule } from '@nestjs/throttler';

import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LocalizationInterceptor } from './core/interceptors/localization.interceptor';

// nest g module modules/user-accounts
// nest g controller modules/user-accounts --no-spec
// nest g service modules/user-accounts --no-spec

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        const uri = coreConfig.mongoURI;
        console.log('DB_URI', uri);

        return {
          uri: uri,
        };
      },
      inject: [CoreConfig],
    }),

    ThrottlerModule.forRootAsync({
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 10000,
            limit: 5,
          },
        ],
        skipIf: () => !coreConfig.isThrottleEnabled,
      }),
    }),

    // BloggersPlatformModule,
    UserAccountsModule,
    NotificationsModule,
    MailerModule,
    CoreModule,
    ContentModule,
    BookingsModule,
    MediaModule,
    configModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LocalizationInterceptor,
    },
  ],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    console.log('TestingModule подключён?', coreConfig.includeTestingModule);

    return {
      module: AppModule,
      imports: [...(coreConfig.includeTestingModule ? [TestingModule] : [])],
    };
  }
}
