import { Controller, Get, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ValidationService } from './validation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
    user: { id: number; email: string; fullName: string; role: string };
}

@ApiTags('Validation')
@Controller('documents/:documentId/validation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ValidationController {
    constructor(private readonly validationService: ValidationService) { }

    @Get()
    @ApiOperation({ summary: 'Validate document against format profile' })
    async validateDocument(
        @Param('documentId', ParseIntPipe) documentId: number,
        @Request() req: AuthenticatedRequest,
    ) {
        return this.validationService.validateDocument(documentId, req.user.id);
    }
}
