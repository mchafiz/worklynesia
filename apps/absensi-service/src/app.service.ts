import { Injectable } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Injectable()
export class AppService {
  @EventPattern('auth.user.registered')
  handleUserRegistered(data: any) {
    console.log('User registered:', data);
  }
}
