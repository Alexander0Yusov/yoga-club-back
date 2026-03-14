import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GLOBAL_PREFIX } from './global-prefix.setup';

export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('BLOGGER API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Bearer token only',
      },
      'bearer',
    )
    .addBasicAuth({ type: 'http', scheme: 'basic' }, 'basic')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(GLOBAL_PREFIX, app, document, {
    customSiteTitle: 'Blogger platform API',
    customfavIcon: 'https://swagger.io/favicon.png',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
    swaggerOptions: {
      tagsSorter: (a: string, b: string) => {
        const order = ['App', 'Auth', 'Users'];
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);

        if (indexA !== -1 || indexB !== -1) {
          return (indexA === -1 ? order.length : indexA) -
            (indexB === -1 ? order.length : indexB);
        }

        return a.localeCompare(b);
      },
      operationsSorter: (a: any, b: any) => {
        const pathA = a?.get?.('path') ?? '';
        const pathB = b?.get?.('path') ?? '';
        const aIsRootApi = pathA === '/api';
        const bIsRootApi = pathB === '/api';
        const aIsApi = pathA.startsWith('/api');
        const bIsApi = pathB.startsWith('/api');

        if (aIsRootApi !== bIsRootApi) {
          return aIsRootApi ? -1 : 1;
        }

        if (aIsApi !== bIsApi) {
          return aIsApi ? -1 : 1;
        }

        const authOrder = [
          '/api/auth/registration',
          '/api/auth/login',
          '/api/auth/refresh-token',
          '/api/auth/logout',
          '/api/auth/me',
          '/api/auth/password-recovery',
          '/api/auth/new-password',
          '/api/auth/registration-confirmation',
          '/api/auth/registration-email-resending',
        ];
        const indexA = authOrder.indexOf(pathA);
        const indexB = authOrder.indexOf(pathB);

        if (indexA !== -1 || indexB !== -1) {
          return (indexA === -1 ? authOrder.length : indexA) -
            (indexB === -1 ? authOrder.length : indexB);
        }

        return pathA.localeCompare(pathB);
      },
    },
  } as any);
}
