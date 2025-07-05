import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig, JwtStrategy } from '@worklynesia/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConfig.accessToken.secret,
      signOptions: { expiresIn: jwtConfig.accessToken.expiresIn },
    }),
    AuthModule,
    UserModule,
    AttendanceModule,
  ],
  controllers: [],
  providers: [Logger, JwtStrategy],
})
export class AppModule {}
