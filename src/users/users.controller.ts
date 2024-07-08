import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, Request, UseGuards, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from './auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User } from './entities/user.entity';
import { CreateOrganizationDto } from '../organization/dto/create-organization.dto';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  @Post("auth/register")
  async register(@Body() createUserDto: CreateUserDto) {
    const registeredUser = await this.authService.register(createUserDto);
    return {
      status: "success",
      message: "Registration successful",
      data: {
        accessToken: (registeredUser as any).accessToken,
        user: {
          userId: registeredUser.userId,
          firstName: registeredUser.firstName,
          lastName: registeredUser.lastName,
          email: registeredUser.email,
          phone: registeredUser.phone,
        }
      }
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post("auth/login")
  async login (@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto.email, loginDto.password);
    return {
      status: "success",
      message: "Login successful",
      data: {
        accessToken: (result as any).accessToken,
        user: {
          userId: result.userId,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          phone: result.phone,
        }
      }
    }
  }

  @UseGuards(AuthGuard)
  @Post("/api/organisations")
  async createOrganizationForUser(@Body() createOrganizationDto: CreateOrganizationDto, @Request() req: Request){
    const user = req['user'] as User;
    const createdOrg = await this.usersService.createOrganization(createOrganizationDto, user);
    return {
      status: "success",
      message: "Organisation created successfully",
      data: {
        ...createdOrg
      }
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/api/users/:id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne({userId: id});
    delete user.password;
    delete user.id;
    return {
      status: "success",
      message: "Data fetched successfully",
      data: {
        ...user
      }
    };
  }

  @UseGuards(AuthGuard)
  @Get("/api/organisations")
  async getorgs(@Request() req: Request){
    const user = req['user'] as User;
    const userOrgs = await this.usersService.findUserOrganizations(user.userId);
    return {
      status: "success",
      message: "organisations fetched successfully",
      data: userOrgs
    }
  }

  @UseGuards(AuthGuard)
  @Get("/api/organisations/:orgId")
  async getUserOrg (@Param("orgId") orgId: string, @Request() req: Request){
    const user = req['user'] as User;
    const userOrg = await this.usersService.findOneOrganization(user.userId, orgId);
    if (!userOrg) {
      throw new NotFoundException(`Organisation with the provided id (${orgId}) not found`)
    }
    return {
      status: "success",
      message: "organisation fetched successfully",
      data: {...userOrg}
    };
  }

  @Post("/api/organisations/:orgId/users")
  async addUserToOrganization(@Body() reqBody: any, @Param("orgId") orgId: string){
    await this.usersService.addUserToOrganization(orgId, reqBody.userId);
    return {
      status: "success",
      message: "User added to organisation successfully"
    }
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
