import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Organisation } from './entities/organization.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrganizationService {
  constructor(@InjectRepository(Organisation) private readonly repo: Repository<Organisation>){}
  create(createOrganizationDto: CreateOrganizationDto) {
    createOrganizationDto.orgId = uuidv4();
    const org = this.repo.create(createOrganizationDto);
    return this.repo.save(org);
  }

  async findAll() {
    return await this.repo.find({select: ["description", "name", "orgId"]});
  }

  async findOne(orgId: string) {
    const org = await this.repo.findOneBy({orgId});
    delete org.id
    return org;
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    return `This action updates a #${id} organization`;
  }

  remove(id: number) {
    return `This action removes a #${id} organization`;
  }
}
