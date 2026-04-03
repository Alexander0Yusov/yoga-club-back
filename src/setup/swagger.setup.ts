import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GLOBAL_PREFIX } from './global-prefix.setup';

export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Yoga Club API')
    .setDescription('Official API for Yoga Club platform')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Bearer token only',
      },
      'bearer',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(GLOBAL_PREFIX, app, document, {
    customSiteTitle: 'Yoga Club API Doc',
    customfavIcon: 'https://swagger.io/favicon.png',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: (a: string, b: string) => {
        const order = [
          'Public Landing',
          'Admin: Sections',
          'Admin: Content',
          'Auth',
          'Users',
        ];
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);

        if (indexA !== -1 || indexB !== -1) {
          return (indexA === -1 ? order.length : indexA) -
                 (indexB === -1 ? order.length : indexB);
        }

        return a.localeCompare(b);
      },
    },
  });
}
