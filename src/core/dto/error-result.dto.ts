import { ApiProperty } from '@nestjs/swagger';

export class FieldError {
  @ApiProperty({ example: 'Invalid value', description: 'Error message for the field' })
  message: string;

  @ApiProperty({ example: 'email', description: 'Field name that caused the error' })
  field: string;
}

export class APIErrorResult {
  @ApiProperty({ type: [FieldError], description: 'List of field errors' })
  errorsMessages: FieldError[];
}
