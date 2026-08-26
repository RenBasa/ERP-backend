import { Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guards';
import { JWTAuthGuard } from './jwt-auth.guard';
// import { AuthenticatedGuard } from './authenticated.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() request): Promise<any> {
    const token = await this.authService.loginJWT(
      request.user.id,
      request.user.username,
      request.user.rol,
    );
    return {
      access_token: token,
      first_name: request.user.first_name,
      last_name: request.user.last_name,
      rol: request.user.rol,
    };
  }
  @UseGuards(JWTAuthGuard)
  @Get()
  async checkAuth(@Req() request) {
    return await this.authService.getUser(+request.user.id);
  }
}
