import { Module, Logger } from '@nestjs/common';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from './config/jwt.config';
import { PrismaModule } from '@worklynesia/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: jwtConfig.accessToken.secret,
      signOptions: { expiresIn: jwtConfig.accessToken.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [Logger, AuthService, JwtStrategy],
})
export class AuthModule {}
