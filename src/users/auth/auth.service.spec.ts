import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../users.service';
import { JwtModule, JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { v4 as uuidv4 } from 'uuid'; 

describe("AuthService", () => {

  let authService: AuthService;
  let jwtService: JwtService;;

  const user: CreateUserDto = {
    email: "email@example.com",
    firstName: "Joshua",
    lastName: "Nweke",
    password: "password",
    phone: "2347037577120",
    userId: uuidv4()
  };

  beforeEach(async () => {
    const jwtOptions: JwtModuleOptions = {
      secret: 'testSecret',
      global: true,
      signOptions: { expiresIn: '60s' },
    };
    const fakeUserService: Partial<UsersService> = {
      findOne: (filter?: any) => Promise.resolve(null),
      create: (user: CreateUserDto) => Promise.resolve(user as User)
    }
    const module = await Test.createTestingModule({
      imports: [JwtModule.register(jwtOptions)],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService
        },
      ],
    }).compile();
    authService = module.get(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  })
  it("can create an instance of AuthService", async () => {
    expect(authService).toBeDefined();
  });

  it("create a user with hashed and salted password", async () => {
    const result = await authService.register(user);
    const [salt, hash] = result.password.split(".");
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it("should successfully register a user and return a token with appropriate properties", async () => {
    const result = await authService.register(user);
    const decodedToken = jwtService.verify(result.accessToken, { secret: 'testSecret', complete: true });
    expect(decodedToken.payload).toMatchObject(
      {
        user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userId: user.userId
      }
    }),
    expect(result.accessToken).toBeDefined();    
  });

  it("should ensure that token expires at correct time", async () => {
    const result = await authService.register(user);
    const decodedToken = jwtService.verify(result.accessToken, { secret: 'testSecret', complete: true });
    const currentTime = Math.floor(Date.now() / 1000);
    const expectedExp = currentTime + 60;
    expect(decodedToken.payload.exp).toBeGreaterThanOrEqual(expectedExp - 1);
    expect(decodedToken.payload.exp).toBeLessThanOrEqual(expectedExp + 1);
  })

})
