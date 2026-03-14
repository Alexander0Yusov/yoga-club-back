import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import mongoose from 'mongoose';
import { UsersTestManager } from './helpers/users-test-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { UserInputDto } from 'src/modules/user-accounts/dto/user/user-input.dto';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';
import { PaginatedViewDto } from '../src/core/dto/base.paginated.view-dto';
import {
  MeViewDto,
  UserViewDto,
} from '../src/modules/user-accounts/dto/user/user-view.dto';
import { delay } from './helpers/delay';
import { EmailServiceMock } from './mock/email-service.mock';
import { UsersRepository } from 'src/modules/user-accounts/infrastructure/users.repository';

const getRefreshTokenFromCookie = (
  setCookie?: string[] | string,
): string | null => {
  if (!setCookie) {
    return null;
  }

  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

  const refreshCookie = cookies.find((cookie) =>
    cookie.startsWith('refreshToken='),
  );

  if (!refreshCookie) {
    return null;
  }

  return refreshCookie.split(';')[0].split('=')[1];
};

describe('e2e', () => {
  let app: INestApplication<App>;
  let userTestManger: UsersTestManager;
  let usersRepository: UsersRepository;

  beforeAll(async () => {
    // Инициализируем приложение с нужными тестовыми настройками.
    const result = await initSettings({
      tokenExpiresIn: { access: '2s', refresh: '10s' },
      useEmailServiceMock: true,
    });

    // Сохраняем ссылку на приложение для запросов.
    app = result.app;

    // Сохраняем тестовый менеджер пользователей.
    userTestManger = result.userTestManger;

    // Сохраняем репозиторий пользователей для чтения данных из БД.
    usersRepository = app.get(UsersRepository);
  });

  afterAll(async () => {
    // Закрываем соединение с БД.
    await mongoose.disconnect();

    // Останавливаем приложение.
    await app.close();
  });

  describe('users (e2e)', () => {
    beforeEach(async () => {
      // Очищаем БД перед каждым тестом в блоке users.
      await deleteAllData(app);
    });

    it('should create user', async () => {
      const body: UserInputDto = {
        name: 'name1s',
        password: 'qwerty',
        email: 'emails@email.em',
      };

      // Создаем пользователя через тестовый менеджер.
      const response = await userTestManger.createUser(body);

      expect(response).toEqual({
        name: body.name,
        email: body.email,
        id: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it('should return user', async () => {
      const body: UserInputDto = {
        name: 'name1s',
        password: 'qwerty',
        email: 'emails@email.em',
      };

      // Создаем пользователя через тестовый менеджер.
      const response = await userTestManger.createUser(body);

      // Запрашиваем пользователя по id.
      await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/sa/users/${response.id}`)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK);
    });

    it('should get users with paging', async () => {
      // Создаем несколько пользователей.
      const users = await userTestManger.createSeveralUsers(8);

      // Запрашиваем список пользователей с пагинацией.
      const { body: responseBody } = (await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/sa/users?pageNumber=1&sortDirection=asc`)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK)) as { body: PaginatedViewDto<UserViewDto> };

      expect(responseBody.totalCount).toBe(8);
      expect(responseBody.items).toHaveLength(8);
      expect(responseBody.pagesCount).toBe(1);
      expect(responseBody.items[7]).toEqual(users[users.length - 1]);
    });
  });

  describe('auth lifecycle (e2e)', () => {
    const user = {
      name: 'auth_user1',
      password: 'qwerty',
      email: 'auth_user1@email.em',
    };

    const userForResend = {
      name: 'auth_user2',
      password: 'qwerty',
      email: 'auth_user2@email.em',
    };

    let confirmationCode: string;
    let accessToken: string;
    let refreshToken: string;

    beforeAll(async () => {
      // Очищаем БД перед жизненным циклом авторизации.
      await deleteAllData(app);
    });

    it('should register user and store confirmation code in DB', async () => {
      // Отправляем запрос регистрации.
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/registration`)
        .send({
          name: user.name,
          password: user.password,
          email: user.email,
        })
        .expect(HttpStatus.NO_CONTENT);

      // Читаем пользователя из БД.
      const createdUser = await usersRepository.findByEmailOrNotFoundFail(
        user.email,
      );

      // Сохраняем код подтверждения из БД для следующих шагов.
      confirmationCode = createdUser.emailConfirmation.confirmationCode as string;

      expect(confirmationCode).toBeDefined();
    });

    it('should confirm registration by code', async () => {
      // Отправляем запрос подтверждения регистрации.
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/registration-confirmation`)
        .send({ code: confirmationCode })
        .expect(HttpStatus.NO_CONTENT);

      // Проверяем, что email подтвержден в БД.
      const confirmedUser = await usersRepository.findByEmailOrNotFoundFail(
        user.email,
      );

      expect(confirmedUser.emailConfirmation.isConfirmed).toBe(true);
    });

    it('should login and return access token + refresh cookie', async () => {
      // Логинимся с правильными учетными данными.
      const loginResponse = await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/login`)
        .send({ email: user.email, password: user.password })
        .expect(HttpStatus.OK);

      // Сохраняем access token из ответа.
      accessToken = loginResponse.body.accessToken;

      // Сохраняем refresh token из cookie.
      refreshToken =
        getRefreshTokenFromCookie(
          loginResponse.headers['set-cookie'] as string[] | string | undefined,
        ) || '';

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
    });

    it('should return current user profile by access token', async () => {
      // Запрашиваем профиль текущего пользователя.
      const { body: meResponse } = (await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/auth/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)) as { body: MeViewDto };

      expect(meResponse.email).toBe(user.email);
      expect(meResponse.userId).toBeDefined();
      expect(meResponse.name).toBe(user.name);
    });

    it('should refresh tokens using refresh cookie', async () => {
      // Обновляем пару токенов по refresh cookie.
      const refreshResponse = await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/refresh-token`)
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(HttpStatus.OK);

      // Обновляем access token из ответа.
      accessToken = refreshResponse.body.accessToken;

      // Обновляем refresh token из cookie.
      refreshToken =
        getRefreshTokenFromCookie(
          refreshResponse.headers['set-cookie'] as string[] | string | undefined,
        ) || '';

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
    });

    it('should logout current session', async () => {
      // Выходим из текущей сессии.
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/logout`)
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should reject refresh with revoked token', async () => {
      // Пытаемся обновить токены с отозванным refresh.
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/refresh-token`)
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should reject expired access token', async () => {
      // Логинимся, чтобы получить новый access token.
      const loginResponse = await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/login`)
        .send({ email: user.email, password: user.password })
        .expect(HttpStatus.OK);

      // Берем access token для проверки истечения.
      const shortLivedAccessToken = loginResponse.body.accessToken;

      // Ждем, пока access token истечет.
      await delay(2100);

      // Запрашиваем профиль с истекшим токеном.
      await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/auth/me`)
        .set('Authorization', `Bearer ${shortLivedAccessToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should reject login with wrong password', async () => {
      // Пытаемся залогиниться с неправильным паролем.
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/login`)
        .send({ email: user.email, password: 'wrong_password' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should reject duplicate registration by email', async () => {
      // Пытаемся повторно зарегистрировать пользователя с тем же email.
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/registration`)
        .send({
          name: user.name,
          password: user.password,
          email: user.email,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should resend confirmation email for unconfirmed user', async () => {
      // Регистрируем второго пользователя без подтверждения.
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/registration`)
        .send({
          name: userForResend.name,
          password: userForResend.password,
          email: userForResend.email,
        })
        .expect(HttpStatus.NO_CONTENT);

      // Сбрасываем счетчик вызовов мока отправки письма.
      EmailServiceMock.sendConfirmationEmailMock.mockClear();

      // Запрашиваем повторную отправку письма подтверждения.
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/registration-email-resending`)
        .send({ email: userForResend.email })
        .expect(HttpStatus.NO_CONTENT);

      // Проверяем, что отправка письма была инициирована.
      expect(EmailServiceMock.sendConfirmationEmailMock).toHaveBeenCalled();

      // Проверяем, что в БД есть новый код подтверждения.
      const userFromDb = await usersRepository.findByEmailOrNotFoundFail(
        userForResend.email,
      );

      expect(userFromDb.emailConfirmation.confirmationCode).toBeDefined();
    });

    it('should reject confirmation with invalid or reused code', async () => {
      // Пытаемся подтвердить регистрацию уже использованным кодом.
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/registration-confirmation`)
        .send({ code: confirmationCode })
        .expect(HttpStatus.BAD_REQUEST);

      // Пытаемся подтвердить регистрацию с невалидным кодом.
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/registration-confirmation`)
        .send({ code: 'invalid-code' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should recover password and login with new password', async () => {
      const newPassword = 'new_password_123';

      // Запрашиваем восстановление пароля.
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/password-recovery`)
        .send({ email: user.email })
        .expect(HttpStatus.NO_CONTENT);

      // Читаем код восстановления из БД.
      const recoveryUser = await usersRepository.findByEmailOrNotFoundFail(
        user.email,
      );

      const recoveryCode =
        recoveryUser.passwordRecovery.confirmationCode as string;

      // Устанавливаем новый пароль по recovery code.
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/new-password`)
        .send({ newPassword, recoveryCode })
        .expect(HttpStatus.NO_CONTENT);

      // Проверяем логин с новым паролем.
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/login`)
        .send({ email: user.email, password: newPassword })
        .expect(HttpStatus.OK);
    });
  });
});


