import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: number) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async create(data: { email: string; passwordHash: string; fullName: string }) {
        return this.prisma.user.create({ data });
    }

    async update(id: number, data: { fullName?: string }) {
        return this.prisma.user.update({ where: { id }, data });
    }
}
