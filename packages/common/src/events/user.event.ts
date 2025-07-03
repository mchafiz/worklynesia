export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly timestamp: Date = new Date()
  ) {}
}

export class UserDeletedEvent {
  constructor(
    public readonly userId: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
