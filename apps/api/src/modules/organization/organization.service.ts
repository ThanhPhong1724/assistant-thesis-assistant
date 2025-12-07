import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class OrganizationService {
    constructor(private readonly prisma: PrismaService) { }

    async getSchools() {
        return this.prisma.school.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async getFaculties(schoolId?: number) {
        return this.prisma.faculty.findMany({
            where: schoolId ? { schoolId } : undefined,
            include: { school: { select: { name: true } } },
            orderBy: { name: 'asc' },
        });
    }

    async getProgramTypes() {
        return this.prisma.programType.findMany({
            orderBy: { name: 'asc' },
        });
    }
}
