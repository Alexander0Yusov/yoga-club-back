import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema } from '@nestjs/mongoose';
import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

/**
 * BSON Embedded localized texts for MongoDB.
 */
@Schema({ _id: false })
export class LocalizedText {
  @ApiProperty({ example: 'Текст на русском', description: 'Russian translation', minLength: 2 })
  @Expose()
  @IsString()
  @MinLength(2, { message: 'Текст должен быть не короче 2 символов' })
  @Prop({ type: String })
  public ru: string;

  @ApiProperty({ example: 'English text', required: false, description: 'English translation', minLength: 2 })
  @Expose()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Текст должен быть не короче 2 символов' })
  @Prop({ type: String })
  public en?: string;

  @ApiProperty({ example: 'Deutscher Text', required: false, description: 'German translation', minLength: 2 })
  @Expose()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Текст должен быть не короче 2 символов' })
  @Prop({ type: String })
  public de?: string;

  @ApiProperty({ example: 'Текст українською', required: false, description: 'Ukrainian translation', minLength: 2 })
  @Expose()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Текст должен быть не короче 2 символов' })
  @Prop({ type: String })
  public uk?: string;

  constructor(partial?: Partial<LocalizedText>) {
    Object.assign(this, partial);
  }
}
