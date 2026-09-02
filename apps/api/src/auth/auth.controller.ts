import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Cadastrar novo usuário e enviar código de verificação' })
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Confirmar e-mail com código de 6 dígitos' })
  verifyEmail(@Body() body: any) {
    return this.authService.verifyEmail(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login com e-mail e senha' })
  login(@Body() body: any) {
    return this.authService.login(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
