import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
    user: {
        id: number;
        email: string;
        fullName: string;
        role: string;
    };
}

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @ApiOperation({ summary: 'Get user profile' })
    async getProfile(@Request() req: AuthenticatedRequest) {
        return this.usersService.findById(req.user.id);
    }

    @Put('profile')
    @ApiOperation({ summary: 'Update user profile' })
    async updateProfile(@Request() req: AuthenticatedRequest, @Body() body: { fullName?: string }) {
        return this.usersService.update(req.user.id, body);
    }
}
