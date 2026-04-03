import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

/**
 * Pipe to parse stringified JSON from specific fields in multipart/form-data.
 */
@Injectable()
export class ParseJsonPipe implements PipeTransform {
  constructor(private readonly keys: string[]) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && value && typeof value === 'object') {
      for (const key of this.keys) {
        if (typeof value[key] === 'string') {
          try {
            value[key] = JSON.parse(value[key]);
          } catch (e) {
            throw new BadRequestException(`Invalid JSON for field ${key}`);
          }
        }
      }
    }
    return value;
  }
}
