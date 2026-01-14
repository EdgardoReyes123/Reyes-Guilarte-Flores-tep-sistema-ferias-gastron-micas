import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { RegisterDto, UserRole } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthResponseDto,
  ValidateTokenResponseDto,
  HealthResponseDto,
} from './dto/responses/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(userData: RegisterDto): Promise<{
    usuario: { id: string; email: string; name: string; role: UserRole };
  }> {
    // Validaciones ya hechas por DTO
    const existingUser = await this.usersRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const user = this.usersRepository.create({
      email: userData.email,
      password: userData.password,
      name: userData.fullname,
      role: userData.role || UserRole.USER,
      isActive: true,
    });

    await this.usersRepository.save(user);
    this.logger.log(`Usuario registrado: ${user.email}`);

    return {
      usuario: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
      },
    };
  }

  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { email: credentials.email },
    });

    if (!user) {
      this.logger.warn(
        `Login fallido - Email no encontrado: ${credentials.email}`,
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isValidPassword = await user.validatePassword(credentials.password);

    if (!isValidPassword) {
      this.logger.warn(
        `Login fallido - Password incorrecto para: ${user.email}`,
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      this.logger.warn(`Login fallido - Usuario inactivo: ${user.email}`);
      throw new UnauthorizedException('Usuario inactivo');
    }

    this.logger.log(`Login exitoso: ${user.email}`);

    const token = await this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
      },
      access_token: token,
    };
  }

  async validateToken(token: string): Promise<ValidateTokenResponseDto> {
    try {
      console.log('Validating token:', token);
      const payload = this.jwtService.verify(token);

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'email', 'name', 'role', 'isActive'],
      });

      if (!user || !user.isActive) {
        return {
          valid: false,
          error: 'Usuario no encontrado o inactivo',
        };
      }

      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
        },
      };
    } catch (error) {
      this.logger.error(`Error validando token: ${error.message}`);

      let errorMessage = 'Token inválido';
      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Token expirado';
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Token malformado';
      }

      return {
        valid: false,
        error: errorMessage,
      };
    }
  }

  async getUserById(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'role', 'createdAt', 'isActive'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async updateUser(id: string, updateData: any) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateData.email && updateData.email !== user.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: updateData.email },
      });

      if (existing) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    Object.assign(user, updateData);
    await this.usersRepository.save(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return this.jwtService.sign(payload);
  }
}
