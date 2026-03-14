import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import {
  CreateUserDomainDto,
  UpdateUserDto,
} from '../../dto/user/create-user-domain.dto';
import {
  ConfirmationData,
  ConfirmationDataSchema,
} from './confirmation-data.schema';
import { addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, unique: true, ...loginConstraints })
  name: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: String, required: true, ...emailConstraints })
  email: string;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: ConfirmationDataSchema })
  emailConfirmation: ConfirmationData;

  @Prop({ type: ConfirmationDataSchema })
  passwordRecovery: ConfirmationData;

  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();

    user.name = dto.name;
    user.passwordHash = dto.passwordHash;
    user.email = dto.email;

    user.emailConfirmation = new ConfirmationData();
    user.passwordRecovery = new ConfirmationData();

    user.emailConfirmation.expirationDate = addDays(new Date(), 2);
    user.emailConfirmation.confirmationCode = uuidv4();

    return user as UserDocument;
  }

  get id(): string {
    // @ts-ignore
    return this._id.toString();
  }

  update(dto: UpdateUserDto) {
    if (dto.email !== this.email) {
      this.emailConfirmation.isConfirmed = false;
      this.email = dto.email;
    }
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  //
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

// Регистрирует методы сущности в схеме.
UserSchema.loadClass(User);

// Типизация документа.
export type UserDocument = HydratedDocument<User>;

// Типизация модели + статические методы.
export type UserModelType = Model<UserDocument> & typeof User;

