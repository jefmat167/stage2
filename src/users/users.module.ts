import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from './auth/auth.service';
import { Organisation } from '../organization/entities/organization.entity';
import { OrganizationService } from '../organization/organization.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organisation]), Organisation,],
  controllers: [UsersController],
  providers: [UsersService, AuthService, OrganizationService, User],
  exports: [User]
})
export class UsersModule {}
