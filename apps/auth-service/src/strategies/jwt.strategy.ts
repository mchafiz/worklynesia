import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { jwtConfig } from '../config/jwt.config';
import { JwtPayload } from '../types/user.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const accessToken = request?.cookies?.['accessToken'] as
            | string
            | undefined;
          if (!accessToken) {
            return null;
          }
          return accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.accessToken.secret,
    });
  }

  validate(payload: JwtPayload) {
    return { sub: payload.sub };
  }
}
