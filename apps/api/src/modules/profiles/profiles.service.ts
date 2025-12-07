import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

type JsonObject = Record<string, unknown>;

@Injectable()
export class ProfilesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(filters?: { schoolId?: number; facultyId?: number; programTypeId?: number }) {
        return this.prisma.formatProfile.findMany({
            where: {
                schoolId: filters?.schoolId,
                facultyId: filters?.facultyId,
                programTypeId: filters?.programTypeId,
            },
            include: {
                school: { select: { name: true } },
                faculty: { select: { name: true } },
                programType: { select: { name: true } },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findById(id: number) {
        const profile = await this.prisma.formatProfile.findUnique({
            where: { id },
            include: {
                school: true,
                faculty: true,
                programType: true,
                baseProfile: { select: { id: true, name: true, configJson: true } },
            },
        });
        if (!profile) {
            throw new NotFoundException('Format profile not found');
        }
        return profile;
    }

    async getResolvedConfig(id: number): Promise<unknown> {
        const profile = await this.findById(id);

        // If has base profile, merge configs
        if (profile.baseProfile) {
            return this.mergeConfigs(
                profile.baseProfile.configJson as JsonObject,
                profile.configJson as JsonObject,
            );
        }

        return profile.configJson;
    }

    async create(userId: number, data: Record<string, unknown>) {
        return this.prisma.formatProfile.create({
            data: {
                code: data.code as string,
                name: data.name as string,
                description: data.description as string | undefined,
                configJson: (data.configJson as object) || {},
                isDefault: (data.isDefault as boolean) || false,
                createdBy: { connect: { id: userId } },
                school: data.schoolId ? { connect: { id: data.schoolId as number } } : undefined,
                faculty: data.facultyId ? { connect: { id: data.facultyId as number } } : undefined,
                programType: data.programTypeId ? { connect: { id: data.programTypeId as number } } : undefined,
            },
        });
    }

    async update(id: number, data: Record<string, unknown>) {
        await this.findById(id);
        return this.prisma.formatProfile.update({
            where: { id },
            data: {
                name: data.name as string | undefined,
                description: data.description as string | undefined,
                configJson: data.configJson as object | undefined,
            },
        });
    }

    async clone(id: number, userId: number, newCode: string, newName: string) {
        const source = await this.findById(id);
        return this.prisma.formatProfile.create({
            data: {
                code: newCode,
                name: newName,
                description: `Sao chép từ: ${source.name}`,
                school: source.schoolId ? { connect: { id: source.schoolId } } : undefined,
                faculty: source.facultyId ? { connect: { id: source.facultyId } } : undefined,
                programType: source.programTypeId ? { connect: { id: source.programTypeId } } : undefined,
                baseProfile: { connect: { id: source.id } },
                configJson: {},
                createdBy: { connect: { id: userId } },
            },
        });
    }

    // Deep merge configs (child overrides parent)
    private mergeConfigs(base: JsonObject, override: JsonObject): JsonObject {
        const result: JsonObject = { ...base };

        for (const key of Object.keys(override)) {
            const overrideValue = override[key];
            const baseValue = base[key];

            if (
                overrideValue &&
                typeof overrideValue === 'object' &&
                !Array.isArray(overrideValue) &&
                baseValue &&
                typeof baseValue === 'object' &&
                !Array.isArray(baseValue)
            ) {
                result[key] = this.mergeConfigs(baseValue as JsonObject, overrideValue as JsonObject);
            } else {
                result[key] = overrideValue;
            }
        }

        return result;
    }
}
