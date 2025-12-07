import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
    user: {
        id: number;
        email: string;
        fullName: string;
        role: string;
    };
}

@ApiTags('Format Profiles')
@Controller('format-profiles')
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService) { }

    @Get()
    @ApiOperation({ summary: 'Get all format profiles' })
    @ApiQuery({ name: 'schoolId', required: false, type: Number })
    @ApiQuery({ name: 'facultyId', required: false, type: Number })
    @ApiQuery({ name: 'programTypeId', required: false, type: Number })
    async findAll(
        @Query('schoolId') schoolId?: string,
        @Query('facultyId') facultyId?: string,
        @Query('programTypeId') programTypeId?: string,
    ) {
        return this.profilesService.findAll({
            schoolId: schoolId ? parseInt(schoolId) : undefined,
            facultyId: facultyId ? parseInt(facultyId) : undefined,
            programTypeId: programTypeId ? parseInt(programTypeId) : undefined,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get format profile by ID' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.profilesService.findById(id);
    }

    @Get(':id/resolved')
    @ApiOperation({ summary: 'Get resolved config (with inheritance)' })
    async getResolved(@Param('id', ParseIntPipe) id: number) {
        return this.profilesService.getResolvedConfig(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create format profile' })
    async create(@Body() body: Record<string, unknown>, @Request() req: AuthenticatedRequest) {
        return this.profilesService.create(req.user.id, body);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update format profile' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
        return this.profilesService.update(id, body);
    }

    @Post(':id/clone')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Clone format profile' })
    async clone(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { code: string; name: string },
        @Request() req: AuthenticatedRequest,
    ) {
        return this.profilesService.clone(id, req.user.id, body.code, body.name);
    }
}
