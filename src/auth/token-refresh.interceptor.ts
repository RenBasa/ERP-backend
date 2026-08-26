import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

// Once a token is past this fraction of its lifetime, silently reissue a
// fresh one so an actively-used session never dies mid-shift, while a
// genuinely idle token still expires on schedule.
const REFRESH_THRESHOLD = 0.75;

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
  constructor(private jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const authHeader: string | undefined = request.headers?.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded: any = this.jwtService.decode(token);

      if (decoded?.exp && decoded?.iat) {
        const now = Math.floor(Date.now() / 1000);
        const lifetime = decoded.exp - decoded.iat;
        const elapsed = now - decoded.iat;

        if (elapsed > lifetime * REFRESH_THRESHOLD) {
          const refreshedToken = this.jwtService.sign({
            id: decoded.id,
            username: decoded.username,
            rol: decoded.rol,
          });
          response.setHeader('X-Refreshed-Token', refreshedToken);
        }
      }
    }

    return next.handle();
  }
}
