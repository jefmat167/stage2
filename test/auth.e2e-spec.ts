import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { Repository } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  let mailController = 0

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(async () => {
    await userRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    const user = {
        email: `joshua${mailController}@example.com`,
        firstName: "Joshua",
        lastName: "Nweke",
        password: "password",
        phone: "2347037577120",
      };
    it('should register user successfully with default organisation', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(user)
        .expect(201);

        expect(response.statusCode).toBe(201)
        expect(response.body.data).toHaveProperty('accessToken');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user).toHaveProperty('firstName');
        expect(response.body.data.user).toHaveProperty('lastName');
        expect(response.body.data.user).toHaveProperty('email');
        expect(response.body.data.user).toHaveProperty('userId');
        expect(response.body.data.user).toHaveProperty('phone');
        
    });

    it('should log the user in successfully', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          firstName: 'Jeff',
          lastName: 'Matt',
          email: 'jeff@example.com',
          password: 'strongPassword',
          phone: "2349087456321"
        });

      // Now log in with the same credentials
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'jeff@example.com',
          password: 'strongPassword',
        })
        .expect(200);
        
        expect(response.statusCode).toBe(200)
        expect(response.body.data).toHaveProperty('accessToken');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user).toHaveProperty('firstName');
        expect(response.body.data.user).toHaveProperty('lastName');
        expect(response.body.data.user).toHaveProperty('email');
        expect(response.body.data.user).toHaveProperty('userId');
        expect(response.body.data.user).toHaveProperty('phone');
    });

    it('should fail if required fields are missing', async () => {
      const fields = ['firstName', 'lastName', 'email', 'password', 'phone'];

      for (const field of fields) {
        const payload = {
            firstName: 'Jeff',
            lastName: 'Matt',
            email: 'jeff@example.com',
            password: 'strongPassword',
            phone: "2349087456321"
        };
        delete payload[field];

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(payload)
          .expect(422);

        expect(response.body).toHaveProperty('errors');
        expect(response.statusCode).toBe(422);
        expect(response.body.message).toBe("Request validation failed");
      }
    });

    it("should fail if there’s a duplicate email", async () => {
      const payload = {
        firstName: 'Jeff',
        lastName: 'Matt',
        email: 'jeff@example.com',
        password: 'strongPassword',
        phone: "2349087456321"
    };

    await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload)
        .expect(201);

    const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload)
        .expect(422);

        expect(response.body.message).toContain('Provided email already exists');
    });
  });
});
