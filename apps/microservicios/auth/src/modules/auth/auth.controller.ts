import { Controller, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ValidateTokenDto } from './dto/validate-token.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RpcValidationPipe } from '../../common/pipes/rpc-validation.pipe';

@Controller()
@UsePipes(new RpcValidationPipe())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth.register' })
  async register(@Payload() data: RegisterDto) {
    try {
      console.log('Llega la petición');
      return await this.authService.register(data);
    } catch (error) {
      console.log('Error en el controlador del microservicio:', error);
      throw new RpcException({
        status: error.status || 400,
        message: error.message,
        error: error.constructor.name,
      });
    }
  }

  @MessagePattern({ cmd: 'auth.login' })
  async login(@Payload() data: LoginDto) {
    try {
      return await this.authService.login(data);
    } catch (error) {
      throw new RpcException({
        status: error.status || 401,
        message: error.message,
        error: error.constructor.name,
      });
    }
  }

  @MessagePattern({ cmd: 'auth.validate' })
  async validateToken(@Payload() data: ValidateTokenDto) {
    try {
      return await this.authService.validateToken(data.token);
    } catch (error) {
      throw new RpcException({
        status: 401,
        message: 'Token validation failed',
        error: error.message,
      });
    }
  }

  @MessagePattern({ cmd: 'auth.getUser' })
  async getUser(@Payload() data: GetUserDto) {
    try {
      return await this.authService.getUserById(data.id);
    } catch (error) {
      throw new RpcException({
        status: error.status || 404,
        message: error.message,
        error: error.constructor.name,
      });
    }
  }

  @MessagePattern({ cmd: 'auth.updateUser' })
  async updateUser(@Payload() data: { id: string; updateData: UpdateUserDto }) {
    try {
      return await this.authService.updateUser(data.id, data.updateData);
    } catch (error) {
      throw new RpcException({
        status: error.status || 400,
        message: error.message,
        error: error.constructor.name,
      });
    }
  }

  @MessagePattern('auth.health')
  async health() {
    return await this.authService.healthCheck();
  }
}
