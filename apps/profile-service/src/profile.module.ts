import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@worklynesia/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule],
  controllers: [ProfileController],
  providers: [ProfileService, Logger],
})
export class ProfileModule {}
