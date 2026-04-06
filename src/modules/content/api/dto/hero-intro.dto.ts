import { IsOptional, ValidateNested, IsBoolean, IsObject, IsNotEmptyObject } from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LocalizedText } from '../../domain/localized-text.vo';
import { CarouselImageDto } from './carousel-image.dto';

export class CreateHeroIntroDto {
  @ApiProperty({ type: () => LocalizedText })
  @Transform(({ value, key }) => {
    console.log(`[2. TRANSFORM RAW ${key}]:`, value);
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) {
        console.warn(`[TRANSFORM WARNING ${key}]: Received empty object "{}"`);
        return null; // Force IsNotEmptyObject to fail
      }
      console.log(`[3. TRANSFORM PARSED ${key}]:`, parsed);
      return plainToInstance(LocalizedText, parsed);
    } catch (error) {
      console.error(`[TRANSFORM ERROR ${key}]: Failed to parse JSON`, error.message);
      return value;
    }
  })
  @Type(() => LocalizedText)
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  public title: LocalizedText;

  @ApiProperty({ type: () => LocalizedText })
  @Transform(({ value, key }) => {
    console.log(`[2. TRANSFORM RAW ${key}]:`, value);
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) {
        console.warn(`[TRANSFORM WARNING ${key}]: Received empty object "{}"`);
        return null;
      }
      console.log(`[3. TRANSFORM PARSED ${key}]:`, parsed);
      return plainToInstance(LocalizedText, parsed);
    } catch (error) {
      console.error(`[TRANSFORM ERROR ${key}]: Failed to parse JSON`, error.message);
      return value;
    }
  })
  @Type(() => LocalizedText)
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  public text1: LocalizedText;

  @ApiProperty({ type: () => LocalizedText })
  @Transform(({ value, key }) => {
    console.log(`[2. TRANSFORM RAW ${key}]:`, value);
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) {
        console.warn(`[TRANSFORM WARNING ${key}]: Received empty object "{}"`);
        return null;
      }
      console.log(`[3. TRANSFORM PARSED ${key}]:`, parsed);
      return plainToInstance(LocalizedText, parsed);
    } catch (error) {
      console.error(`[TRANSFORM ERROR ${key}]: Failed to parse JSON`, error.message);
      return value;
    }
  })
  @Type(() => LocalizedText)
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  public text2: LocalizedText;

  @ApiProperty({ type: () => CarouselImageDto, required: false })
  @IsOptional()
  @Transform(({ value, key }) => {
    console.log(`[2. TRANSFORM RAW ${key}]:`, value);
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) {
        return null;
      }
      console.log(`[3. TRANSFORM PARSED ${key}]:`, parsed);
      return plainToInstance(CarouselImageDto, parsed);
    } catch (error) {
      console.error(`[TRANSFORM ERROR ${key}]: Failed to parse JSON`, error.message);
      return value;
    }
  })
  @Type(() => CarouselImageDto)
  @IsObject()
  @ValidateNested()
  public image?: CarouselImageDto;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  public isActive?: boolean;
}

export class UpdateHeroIntroDto {
  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @Transform(({ value, key }) => {
    console.log(`[2. TRANSFORM RAW ${key}]:`, value);
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) {
        console.warn(`[TRANSFORM WARNING ${key}]: Received empty object "{}"`);
        return null;
      }
      console.log(`[3. TRANSFORM PARSED ${key}]:`, parsed);
      return plainToInstance(LocalizedText, parsed);
    } catch (error) {
      console.error(`[TRANSFORM ERROR ${key}]: Failed to parse JSON`, error.message);
      return value;
    }
  })
  @Type(() => LocalizedText)
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  public title?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @Transform(({ value, key }) => {
    console.log(`[2. TRANSFORM RAW ${key}]:`, value);
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) {
        console.warn(`[TRANSFORM WARNING ${key}]: Received empty object "{}"`);
        return null;
      }
      console.log(`[3. TRANSFORM PARSED ${key}]:`, parsed);
      return plainToInstance(LocalizedText, parsed);
    } catch (error) {
      console.error(`[TRANSFORM ERROR ${key}]: Failed to parse JSON`, error.message);
      return value;
    }
  })
  @Type(() => LocalizedText)
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  public text1?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @Transform(({ value, key }) => {
    console.log(`[2. TRANSFORM RAW ${key}]:`, value);
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) {
        console.warn(`[TRANSFORM WARNING ${key}]: Received empty object "{}"`);
        return null;
      }
      console.log(`[3. TRANSFORM PARSED ${key}]:`, parsed);
      return plainToInstance(LocalizedText, parsed);
    } catch (error) {
      console.error(`[TRANSFORM ERROR ${key}]: Failed to parse JSON`, error.message);
      return value;
    }
  })
  @Type(() => LocalizedText)
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  public text2?: LocalizedText;

  @ApiProperty({ type: () => CarouselImageDto, required: false })
  @IsOptional()
  @Transform(({ value, key }) => {
    console.log(`[2. TRANSFORM RAW ${key}]:`, value);
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) {
        return null;
      }
      console.log(`[3. TRANSFORM PARSED ${key}]:`, parsed);
      return plainToInstance(CarouselImageDto, parsed);
    } catch (error) {
      console.error(`[TRANSFORM ERROR ${key}]: Failed to parse JSON`, error.message);
      return value;
    }
  })
  @Type(() => CarouselImageDto)
  @IsObject()
  @ValidateNested()
  public image?: CarouselImageDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  public isActive?: boolean;
}
