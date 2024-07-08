import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from './entities/organization.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organisation, User])],
  controllers: [OrganizationController],
  providers: [OrganizationService, Organisation],
  exports: [Organisation, OrganizationService]
})
export class OrganizationModule {}
