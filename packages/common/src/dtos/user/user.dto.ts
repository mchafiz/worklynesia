import { UserRole } from "@prisma/client";

export interface CreateUserDto {
  email: string;
  fullName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  role: UserRole;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}
