import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { UserProfile } from '@prisma/client';
import {
  CreateUserDto,
  CsvFileInterceptor,
  CurrentUser,
  JwtAuthGuard,
  JwtPayload,
  UpdateUserDto,
} from '@worklynesia/common';

import { KafkaClientService } from 'src/shared/kafka/kafka-client.service';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@ApiTags('User API')
@Controller()
export class UserController {
  constructor(
    private readonly kafkaClient: KafkaClientService,
    private readonly userService: UserService,
  ) {}

  private readonly logger = new Logger(UserController.name);

  @Get('users')
  @ApiOperation({ summary: 'Find all users' })
  @ApiResponse({
    status: 201,
    description: 'User successfully found',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async findAllUser() {
    const result = await this.kafkaClient.send<UserProfile[]>(
      'findAll.user',
      {},
    );
    this.logger.log(`Found ${result.length} users`);

    return result;
  }

  @Post('upload-users')
  @UseInterceptors(CsvFileInterceptor())
  @ApiOperation({ summary: 'Upload users from CSV file' })
  @ApiResponse({ status: 201, description: 'Users successfully uploaded' })
  @ApiResponse({ status: 400, description: 'Invalid file format' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file containing user data',
        },
      },
    },
  })
  async uploadUsers(@UploadedFile() file: Express.Multer.File) {
    const csv = file.buffer.toString('utf-8');
    const users = await this.userService.parseCsv(csv);

    for (const user of users) {
      await this.kafkaClient.emit('create.user', user);
    }

    return { message: `${users.length} users sent to Kafka` };
  }

  @Get('user')
  @ApiOperation({ summary: 'Find user by id' })
  @ApiResponse({
    status: 201,
    description: 'User successfully found',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async findByIdUser(@CurrentUser() user: JwtPayload) {
    const result = await this.kafkaClient.send<JwtPayload>(
      'findById.user',
      user.sub,
    );
    this.logger.log(`Found user with id: ${JSON.stringify(result)}`);

    return result;
  }

  @Post('user')
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'fullName', 'role'],
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        fullName: { type: 'string', example: 'John Doe' },
        avatarUrl: {
          type: 'string',
          example: 'https://example.com/avatar.jpg',
        },
        phoneNumber: { type: 'string', example: '+6281234567890' },
      },
    },
    description: 'User creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async createUser(@Body() user: CreateUserDto) {
    const result = await this.kafkaClient.send<UserProfile>(
      'create.user',
      user,
    );
    this.logger.log(`Created user with id: ${result.id}`);

    return { ...result, role: user.role };
  }

  @Put('user')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', example: 'John Doe Updated' },
        email: { type: 'string', example: 'john.updated@example.com' },
        phoneNumber: { type: 'string', example: '+6281234567890' },
        avatarUrl: {
          type: 'string',
          example: 'https://example.com/avatars/john-updated.jpg',
          nullable: true,
        },
        role: {
          type: 'string',
          enum: ['user', 'admin'],
          example: 'user',
          nullable: true,
        },
      },
    },
  })
  async updateUser(
    @Body() userData: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.kafkaClient.send<UserProfile>('update.user', {
      id: user.sub,
      user: userData,
    });
    this.logger.log(`User ${result.id} updated successfully`);

    return result;
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully deleted',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async deleteUser(@Param('id') id: string) {
    const result = await this.kafkaClient.send<UserProfile>('delete.user', {
      id,
    });
    this.logger.log(`Deleted user with id: ${result.id}`);

    return result;
  }
}
