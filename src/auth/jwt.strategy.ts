import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';
import { UserService } from '../user/user.service';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.secret,
      ignoreExpiration: false,
    });
  }
  async validate(payload: any) {
    // Looked up fresh on every request (not just at login) so a
    // deactivated user is locked out immediately, rather than only once
    // their existing token happens to expire (up to 60h later). Also
    // picks up a role change immediately for the same reason.
    // A token without a numeric id can't name a user; rejecting it here
    // gives a 401 instead of a 500 from the lookup below.
    if (!Number.isInteger(payload?.id)) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.findOne(payload.id);
    if (!user || !user.active) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      username: user.username,
      rol: user.rol,
    };
  }
}
