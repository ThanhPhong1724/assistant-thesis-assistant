import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';

@ApiTags('Organization')
@Controller()
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) { }

    @Get('schools')
    @ApiOperation({ summary: 'Get all schools' })
    async getSchools() {
        return this.organizationService.getSchools();
    }

    @Get('faculties')
    @ApiOperation({ summary: 'Get faculties (optionally filtered by school)' })
    @ApiQuery({ name: 'schoolId', required: false, type: Number })
    async getFaculties(@Query('schoolId') schoolId?: string) {
        return this.organizationService.getFaculties(schoolId ? parseInt(schoolId) : undefined);
    }

    @Get('program-types')
    @ApiOperation({ summary: 'Get all program types' })
    async getProgramTypes() {
        return this.organizationService.getProgramTypes();
    }
}
