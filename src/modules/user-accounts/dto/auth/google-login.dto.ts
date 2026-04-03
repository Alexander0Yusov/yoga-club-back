import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjYy...',
    description: 'Google ID Token received from frontend',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
