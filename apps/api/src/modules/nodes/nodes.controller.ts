import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NodesService } from './nodes.service';
import { CreateNodeDto, UpdateNodeDto, BulkUpdateNodesDto } from './dto/nodes.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
    user: {
        id: number;
        email: string;
        fullName: string;
        role: string;
    };
}

@ApiTags('Document Nodes')
@Controller('documents/:documentId/nodes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NodesController {
    constructor(private readonly nodesService: NodesService) { }

    @Get()
    @ApiOperation({ summary: 'Get document nodes tree' })
    @ApiQuery({ name: 'scope', required: false, enum: ['full', 'outline'] })
    async getNodes(
        @Param('documentId', ParseIntPipe) documentId: number,
        @Query('scope') scope: string,
        @Request() req: AuthenticatedRequest,
    ) {
        if (scope === 'outline') {
            return this.nodesService.getOutline(documentId, req.user.id);
        }
        return this.nodesService.getTree(documentId, req.user.id);
    }

    @Get(':nodeId/children')
    @ApiOperation({ summary: 'Get children of a specific node' })
    async getChildren(
        @Param('documentId', ParseIntPipe) documentId: number,
        @Param('nodeId', ParseIntPipe) nodeId: number,
        @Request() req: AuthenticatedRequest,
    ) {
        return this.nodesService.getChildren(documentId, nodeId, req.user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Create new node' })
    async create(
        @Param('documentId', ParseIntPipe) documentId: number,
        @Body() dto: CreateNodeDto,
        @Request() req: AuthenticatedRequest,
    ) {
        return this.nodesService.create(documentId, req.user.id, dto);
    }

    @Put('bulk-update')
    @ApiOperation({ summary: 'Bulk update nodes (for reordering)' })
    async bulkUpdate(
        @Param('documentId', ParseIntPipe) documentId: number,
        @Body() dto: BulkUpdateNodesDto,
        @Request() req: AuthenticatedRequest,
    ) {
        return this.nodesService.bulkUpdate(documentId, req.user.id, dto);
    }

    @Put(':nodeId')
    @ApiOperation({ summary: 'Update node' })
    async update(
        @Param('documentId', ParseIntPipe) documentId: number,
        @Param('nodeId', ParseIntPipe) nodeId: number,
        @Body() dto: UpdateNodeDto,
        @Request() req: AuthenticatedRequest,
    ) {
        return this.nodesService.update(documentId, nodeId, req.user.id, dto);
    }

    @Delete(':nodeId')
    @ApiOperation({ summary: 'Delete node and its children' })
    async delete(
        @Param('documentId', ParseIntPipe) documentId: number,
        @Param('nodeId', ParseIntPipe) nodeId: number,
        @Request() req: AuthenticatedRequest,
    ) {
        return this.nodesService.delete(documentId, nodeId, req.user.id);
    }
}
