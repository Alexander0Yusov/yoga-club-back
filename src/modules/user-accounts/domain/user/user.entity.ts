import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { BaseDomainEntity } from '../../../../core/base-domain-entity/base-domain-entity';
import { ConfirmationData, ConfirmationDataSchema } from './confirmation-data.schema';
import { addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const loginConstraints = { minLength: 3, maxLength: 10 };
export const passwordConstraints = { minLength: 6, maxLength: 20 };
export const emailConstraints = { match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ };

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export enum Language {
  UK = 'uk',
  RU = 'ru',
  EN = 'en',
  DE = 'de',
}

export class LinkedIdentity {
  @Prop({ required: true })
  provider: string; // 'google' | 'facebook' | 'local'

  @Prop()
  providerUserId?: string;

  @Prop()
  providerEmail?: string;

  @Prop()
  providerAvatarUrl?: string;

  @Prop()
  providerName?: string;
}

@Schema({ timestamps: true })
export class User extends BaseDomainEntity {
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, enum: Role, default: Role.USER })
  role: Role;

  @Prop({ type: String, enum: Language, default: Language.RU })
  lang: Language;

  @Prop({ type: Boolean, default: false })
  isLanguageManual: boolean;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  imgUrl: string;

  @Prop({ type: String })
  telephone: string;

  @Prop({ type: Boolean, default: false })
  isSubscribed: boolean;

  @Prop({ type: Boolean, default: false })
  isBanned: boolean;

  @Prop({ type: ConfirmationDataSchema, default: () => ({ isConfirmed: false, confirmationCode: null, expirationDate: null }) })
  emailConfirmation: ConfirmationData;

  @Prop({ type: ConfirmationDataSchema, default: () => ({ isConfirmed: false, confirmationCode: null, expirationDate: null }) })
  passwordRecovery: ConfirmationData;

  // Local auth specific
  @Prop({ type: String })
  passwordHash?: string;

  @Prop({ type: [LinkedIdentity], default: [] })
  linkedIdentities: LinkedIdentity[];

  // --- Methods ---

  static createLocalUser(email: string, passwordHash: string, name?: string): UserDocument {
    const user = new this();
    user.email = email;
    user.passwordHash = passwordHash;
    user.name = name || email.split('@')[0];
    user.role = Role.USER;
    user.linkedIdentities = [
      {
        provider: 'local',
        providerEmail: email,
        providerName: user.name,
      },
    ];
    return user as UserDocument;
  }

  static createOAuthUser(
    provider: string,
    providerUserId: string,
    email: string,
    name?: string,
    avatarUrl?: string,
    lang?: Language,
  ): UserDocument {
    const user = new this();
    user.email = email;
    user.name = name || email.split('@')[0];
    user.imgUrl = avatarUrl || '';
    user.role = Role.USER;
    if (lang) user.lang = lang;
    user.linkedIdentities = [
      {
        provider,
        providerUserId,
        providerEmail: email,
        providerName: name,
        providerAvatarUrl: avatarUrl,
      },
    ];
    return user as UserDocument;
  }

  linkOAuthProvider(
    provider: string,
    providerUserId: string,
    providerEmail: string,
    providerName?: string,
    providerAvatarUrl?: string,
    lang?: Language,
  ) {
    const existing = this.linkedIdentities.find((i) => i.provider === provider);
    if (!existing) {
      this.linkedIdentities.push({
        provider,
        providerUserId,
        providerEmail,
        providerName,
        providerAvatarUrl,
      });
    }

    // Silent sync for OAuth login: only update if not manual
    if (lang && !this.isLanguageManual) {
      this.lang = lang;
    }
  }

  updateProfile(
    name?: string,
    telephone?: string,
    imgUrl?: string,
    isSubscribed?: boolean,
    lang?: Language | null,
  ) {
    if (name) this.name = name;
    if (telephone) this.telephone = telephone;
    if (imgUrl) this.imgUrl = imgUrl;
    if (isSubscribed !== undefined) this.isSubscribed = isSubscribed;

    if (lang === null || (lang as string) === '') {
      this.isLanguageManual = false;
    } else if (lang) {
      this.lang = lang;
      this.isLanguageManual = true;
    }
  }

  updateLanguage(lang: Language) {
    this.lang = lang;
  }

  updateRole(role: Role) {
    this.role = role;
  }

  setEmailConfirmationCode(code: string, expirationDate: Date) {
    this.emailConfirmation.confirmationCode = code;
    this.emailConfirmation.expirationDate = expirationDate;
    this.emailConfirmation.isConfirmed = false;
  }

  setPasswordConfirmationCode(code: string, expirationDate: Date) {
    this.passwordRecovery.confirmationCode = code;
    this.passwordRecovery.expirationDate = expirationDate;
    this.passwordRecovery.isConfirmed = false;
  }

  setEmailIsConfirmed() {
    this.emailConfirmation.isConfirmed = true;
  }

  setNewPassword(password: string) {
    this.passwordRecovery.isConfirmed = true;
    this.passwordHash = password;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;
