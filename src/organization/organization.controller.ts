import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../users/entities/user.entity';

@Controller()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(AuthGuard)
  @Post("/api/organisations")
  create(@Body() createOrganizationDto: CreateOrganizationDto, @Request() req: Request) {
    const user = req['user'] as User;
    createOrganizationDto.name = `${user.firstName} ${createOrganizationDto.name}`
    return this.organizationService.create(createOrganizationDto);
  }

  @Get("/api/organisations")
  async findAll() {
    const orgs = await this.organizationService.findAll();
    return {
      status: "success",
      message: "organizations fetched successfully",
      data: {
        organizations: orgs
      }
    }
  }

  @UseGuards(AuthGuard)
  @Get('/api/organisations/:orgId')
  async findOne(@Param('orgId') orgId: string) {
    return await this.organizationService.findOne(orgId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationService.update(+id, updateOrganizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationService.remove(+id);
  }
}
