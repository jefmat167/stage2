import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { OrganizationService } from '../organization/organization.service';
import { v4 as uuidv4 } from 'uuid'; 
import { Organisation } from '../organization/entities/organization.entity';
import { CreateOrganizationDto } from '../organization/dto/create-organization.dto';

@Injectable()
export class UsersService {

  constructor(
    private readonly orgService: OrganizationService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Organisation) private orgRepo: Repository<Organisation>,
  ){}

  async create(createUserDto: CreateUserDto) {
    const name = `${createUserDto.firstName}'s Organization`;
    const description = `This organization belongs to ${createUserDto.firstName} ${createUserDto.lastName}`
    const orgId = uuidv4()
    const org = await this.orgService.create({name, description, orgId});
    const user = this.userRepository.create(createUserDto);
    user.organisations = [org]
    return this.userRepository.save(user);
  }

  async createOrganization (createOrganizationDto: CreateOrganizationDto, user: User){
    createOrganizationDto.orgId = uuidv4();
    const org = this.orgRepo.create(createOrganizationDto);
    const savedOrg = await this.orgRepo.save(org);
    [user] = await this.findAll({userId: user.userId})
    user.organisations.push(org);
    await this.userRepository.save(user);
    delete savedOrg.id;
    return savedOrg;

  }

  async addUserToOrganization(orgId: string, userId: string){
    const [org] = await this.orgRepo.find({where: {orgId}, relations: ['users']});
    const [user] = await this.findAll({userId});
    const usersInOrg = [];
    org.users.forEach((user) => {usersInOrg.push(user.userId)});
    if (usersInOrg.includes(userId)) {
      throw new BadRequestException("User already in this organization");
    }
    org.users.push(user);
    await this.orgRepo.save(org);
    user.organisations.push(org)
    await this.userRepository.save(user);
    return;

  }

  async findAll(filter?: object) {
    const user = filter ? await this.userRepository.find({where: filter, relations: ['organisations']}) : await this.userRepository.find({relations: ['organisations']});
    return user;
  }

  async findOne(filter: any) {
    return await this.userRepository.findOneBy(filter);
  }

  async findUserOrganizations(userId: string){
    const user = await this.userRepository.findOne({where: {userId}, relations: ['organizations']});
    user.organisations.forEach((org) => {
      delete org.id
    })
    return {organizations: user.organisations}
  }

  async findOneOrganization(userId: string, orgId: string){
    const user = await this.userRepository.findOne({where: {userId}, relations: ['organisations']});
    const orgs =  user.organisations;
    const org = orgs.find((org) => org.orgId === orgId);
    if (org) {
      delete org.id;
    }
    return org;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.userRepository.update(id, updateUserDto);
  }

  async remove(userId: number) {
    const user = await this.findOne(userId);
    return this.userRepository.remove(user);
  }
}
