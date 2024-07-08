import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as _script } from 'crypto';
import { promisify } from 'util';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid'; 

const scrypt = promisify(_script);

@Injectable()
export class AuthService {
    constructor (
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async register (userData: CreateUserDto) { 
        const user = await this.usersService.findOne({email: userData.email});
        
        if (user) {
            throw new UnprocessableEntityException("Provided email already exists")
        }
        const salt = randomBytes(8).toString('hex');
        const hashedPassword = (await scrypt(userData.password, salt, 32)) as Buffer;
        const hashedPasswordAndSalt = `${salt}.${hashedPassword.toString('hex')}`
        userData.password = hashedPasswordAndSalt;
        userData.userId = uuidv4();
        const createdUser = await this.usersService.create(userData);
        const {firstName, lastName, email, phone, userId} = createdUser;
        const jwtSignData = {firstName, lastName, email, phone, userId}
        const accessToken = await this.jwtService.signAsync({user: jwtSignData});
        return {
            accessToken,
            ...createdUser
        };
    }

    async login (email: string, password: string) { 
        const [user] = await this.usersService.findAll({email});
        console.log("user in login method=>", user);
        if (!user ) {
            throw new UnauthorizedException("Invalid email or password");
        }
        const [salt, storedHash] = user.password.split(".");
        const hash = (await scrypt(password, salt, 32)) as Buffer;
        if (storedHash !== hash.toString('hex')) {
            throw new UnauthorizedException("Invalid email or password");
        } 
        const accessToken = await this.jwtService.signAsync({user});

        return {
            accessToken,
            ...user
        }
    }
}
