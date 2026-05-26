import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ZodError, type ZodSchema } from "zod";

@Injectable()
export class ZodValidationPipe<TInput, TOutput> implements PipeTransform<TInput, TOutput> {
  constructor(private readonly schema: ZodSchema<TOutput, TInput>) {}

  transform(value: TInput): TOutput {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: "Invalid request payload",
          issues: error.issues,
        });
      }

      throw error;
    }
  }
}
