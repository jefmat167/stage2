import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { OrganizationModule } from './organization/organization.module';
import { Organisation } from './organization/entities/organization.entity';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      cache: true,
      envFilePath: ".env",
      isGlobal: true
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION
      }
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Organisation],
        logging: true,
        synchronize: true, // change this to false before deploying...
      }),
    }),
    OrganizationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
