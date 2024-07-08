import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors) => {
      console.log("_____________RUNNING HERE________________")
      const result = errors.map((value) => ({
        field: value.property,
        message: value.constraints[Object.keys(value.constraints)[0]]
      }));
      return new UnprocessableEntityException({errors: result, statusCode: 422, message: "Request validation failed"});
    },
    stopAtFirstError: true,
    whitelist: true
  }));
  await app.listen(3500);
  console.log("Running on port 3500");
}
bootstrap();
