import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PrismaService } from 'src/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.stategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JWTStrategy } from './jwt.strategy';
import { UserService } from 'src/user/user.service';
import { TokenRefreshInterceptor } from './token-refresh.interceptor';
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret, // note change this for a .env secret hash
      // 60h covers a full rest-day gap (~36.5h) with margin; combined with
      // TokenRefreshInterceptor's sliding reissue, an actively-used session
      // never dies mid-shift while a genuinely idle one still expires.
      signOptions: { expiresIn: '60h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    LocalStrategy,
    JWTStrategy,
    UserService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TokenRefreshInterceptor,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
