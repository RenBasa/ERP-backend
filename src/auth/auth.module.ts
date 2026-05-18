import { Module } from '@nestjs/common';
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
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret, // note change this for a .env secret hash
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    LocalStrategy,
    JWTStrategy,
    UserService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
