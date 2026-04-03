import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsBooleanLike(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBooleanLike',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (value === undefined || value === null) {
            return true;
          }

          if (typeof value === 'boolean') {
            return true;
          }

          if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();

            return normalized === 'true' || normalized === 'false';
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a boolean value`;
        },
      },
    });
  };
}
