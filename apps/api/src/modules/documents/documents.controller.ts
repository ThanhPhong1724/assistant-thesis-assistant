import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/documents.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
    user: {
        id: number;
        email: string;
        fullName: string;
        role: string;
    };
}

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all documents for current user' })
    async findAll(@Request() req: AuthenticatedRequest) {
        return this.documentsService.findAllByUser(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get document by ID' })
    async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: AuthenticatedRequest) {
        return this.documentsService.findById(id, req.user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create new document' })
    async create(@Body() dto: CreateDocumentDto, @Request() req: AuthenticatedRequest) {
        return this.documentsService.create(req.user.id, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update document' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateDocumentDto,
        @Request() req: AuthenticatedRequest,
    ) {
        return this.documentsService.update(id, req.user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete document (soft delete)' })
    async delete(@Param('id', ParseIntPipe) id: number, @Request() req: AuthenticatedRequest) {
        return this.documentsService.delete(id, req.user.id);
    }

    @Post(':id/lock-outline')
    @ApiOperation({ summary: 'Lock document outline' })
    async lockOutline(@Param('id', ParseIntPipe) id: number, @Request() req: AuthenticatedRequest) {
        return this.documentsService.lockOutline(id, req.user.id);
    }

    @Post(':id/unlock-outline')
    @ApiOperation({ summary: 'Unlock document outline' })
    async unlockOutline(@Param('id', ParseIntPipe) id: number, @Request() req: AuthenticatedRequest) {
        return this.documentsService.unlockOutline(id, req.user.id);
    }
}
