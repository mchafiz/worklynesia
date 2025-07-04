import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class KafkaClientService implements OnModuleInit {
  constructor(@Inject('KAFKA_CLIENT') private readonly client: ClientKafka) {}

  async onModuleInit() {
    const topics = ['register.user', 'login.user', 'refresh.token'];

    topics.forEach((topic) => {
      this.client.subscribeToResponseOf(topic);
    });

    await this.client.connect();
  }

  async send<T = any>(topic: string, payload: any): Promise<T> {
    const result$ = this.client.send<T>(topic, payload);
    return lastValueFrom(result$);
  }

  async emit(topic: string, payload: any): Promise<void> {
    await lastValueFrom(this.client.emit(topic, payload));
  }
}
