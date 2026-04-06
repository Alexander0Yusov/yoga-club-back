import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { configValidationUtility } from '../setup/config-validation.utility';
import { IsExpiresInFormat } from './decorators/transform/is-expires-in-format';
import { JwtSignOptions } from '@nestjs/jwt';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

@Injectable()
export class CoreConfig {
  @IsNotEmpty({
    message: 'Set Env variable COOKIE_SECRET, dangerous for security!',
  })
  cookieSecret: string;

  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3000',
    },
  )
  port: number;

  //

  @IsNotEmpty({
    message: 'Set Env variable MONGO_URI',
  })
  mongoURI: string;

  //

  @IsEnum(Environments, {
    message:
      'Set correct NODE_ENV value, available values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: string;

  //...

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_SECRET, dangerous for security!',
  })
  refreshTokenSecret: string;

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  accessTokenSecret: string;

  @IsNotEmpty({
    message:
      'Set Env variable INCLUDE_TESTING_MODULE, dangerous for app lifecycle!',
  })
  includeTestingModule: boolean;

  // OAuth Config
  @IsNotEmpty({ message: 'Set GOOGLE_CLIENT_ID' })
  googleClientId: string;

  @IsNotEmpty({ message: 'Set GOOGLE_CLIENT_SECRET' })
  googleClientSecret: string;

  @IsOptional()
  googleCallbackUrl: string;

  @IsOptional()
  facebookClientId: string;

  @IsOptional()
  facebookClientSecret: string;

  @IsOptional()
  facebookCallbackUrl: string;

  @IsNotEmpty({ message: 'Set FRONTEND_URL' })
  frontendUrl: string;

  @IsNotEmpty({
    message: 'Set IS_USER_AUTOMATICALLY_CONFIRMED',
  })
  isUserAutomaticallyConfirmed: boolean;

  @IsNotEmpty({
    message:
      'Set Env variable ACCESS_TOKEN_EXPIRE_IN, dangerous for security!!',
  })
  @IsExpiresInFormat({
    message: 'expiresIn должен быть числом или строкой вида "24h", "7d", "60s"',
  })
  accessTokenExpireIn: JwtSignOptions['expiresIn'];

  @IsNotEmpty({
    message:
      'Set Env variable REFRESH_TOKEN_EXPIRE_IN, dangerous for security!!',
  })
  @IsExpiresInFormat({
    message: 'expiresIn должен быть числом или строкой вида "24h", "7d", "60s"',
  })
  refreshTokenExpireIn: JwtSignOptions['expiresIn'];

  @IsNotEmpty({
    message: 'Set IS_THROTTLE_ENABLED',
  })
  isThrottleEnabled: boolean;

  constructor(private configService: ConfigService<any, true>) {
    this.port = Number(this.configService.get('PORT'));
    //
    this.mongoURI = this.configService.get('MONGO_URI');
    //
    this.env = this.configService.get('NODE_ENV');
    this.refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');
    this.accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');
    this.includeTestingModule = Boolean(
      this.configService.get('INCLUDE_TESTING_MODULE'),
    );

    this.googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
    this.googleClientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    this.googleCallbackUrl = this.configService.get('GOOGLE_CALLBACK_URL');
    this.facebookClientId = this.configService.get('FACEBOOK_CLIENT_ID');
    this.facebookClientSecret = this.configService.get('FACEBOOK_CLIENT_SECRET');
    this.facebookCallbackUrl = this.configService.get('FACEBOOK_CALLBACK_URL');
    this.frontendUrl = this.configService.get('FRONTEND_URL');

    const autoConfirmValue = configValidationUtility.convertToBoolean(
      this.configService.get('IS_USER_AUTOMATICALLY_CONFIRMED'),
    );
    this.isUserAutomaticallyConfirmed = autoConfirmValue ?? false;

    const throttleEnabledValue = configValidationUtility.convertToBoolean(
      this.configService.get('IS_THROTTLE_ENABLED'),
    );

    // Default: enabled in production, disabled otherwise
    this.isThrottleEnabled =
      throttleEnabledValue ?? this.env === Environments.PRODUCTION;

    // Mandatory Safety: If NODE_ENV === 'production', this flag must always be forced to false
    if (this.env === Environments.PRODUCTION) {
      this.isUserAutomaticallyConfirmed = false;
    }

    console.log(
      `[AUTH] Automatic user confirmation is ${
        this.isUserAutomaticallyConfirmed ? 'ENABLED' : 'DISABLED'
      }.`,
    );

    console.log(
      `[THROTTLE] Throttling is ${
        this.isThrottleEnabled ? 'ENABLED' : 'DISABLED'
      }.`,
    );

    console.log('INCLUDE_TESTING_MODULE =', this.includeTestingModule);

    this.accessTokenExpireIn = this.configService.get('ACCESS_TOKEN_EXPIRE_IN');
    this.refreshTokenExpireIn = this.configService.get(
      'REFRESH_TOKEN_EXPIRE_IN',
    );

    this.cookieSecret = this.configService.get('COOKIE_SECRET');

    configValidationUtility.validateConfig(this);
  }
}
