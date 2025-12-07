import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@thesis.local' },
        update: {},
        create: {
            email: 'admin@thesis.local',
            passwordHash: adminPassword,
            fullName: 'Administrator',
            role: 'ADMIN',
        },
    });
    console.log('✅ Created admin user:', admin.email);

    // Create test student
    const studentPassword = await bcrypt.hash('student123', 10);
    const student = await prisma.user.upsert({
        where: { email: 'student@thesis.local' },
        update: {},
        create: {
            email: 'student@thesis.local',
            passwordHash: studentPassword,
            fullName: 'Nguyễn Văn Test',
            role: 'STUDENT',
        },
    });
    console.log('✅ Created student user:', student.email);

    // Create Đại học Thủy lợi
    const tlu = await prisma.school.upsert({
        where: { code: 'tlu' },
        update: {},
        create: {
            code: 'tlu',
            name: 'Trường Đại học Thủy lợi',
            description: 'Thuộc Bộ Giáo dục và Đào tạo, Bộ Nông nghiệp và PTNT',
        },
    });
    console.log('✅ Created school:', tlu.name);

    // Create faculties
    const faculties = [
        { code: 'cntt', name: 'Khoa Công nghệ thông tin' },
        { code: 'xd', name: 'Khoa Xây dựng' },
        { code: 'tnn', name: 'Khoa Tài nguyên nước' },
        { code: 'kt', name: 'Khoa Kinh tế' },
    ];

    for (const f of faculties) {
        await prisma.faculty.upsert({
            where: { schoolId_code: { schoolId: tlu.id, code: f.code } },
            update: {},
            create: {
                schoolId: tlu.id,
                code: f.code,
                name: f.name,
            },
        });
    }
    console.log('✅ Created faculties');

    // Create program types
    const programTypes = [
        { code: 'do_an_mon', name: 'Đồ án môn học', description: 'Đồ án theo từng môn học' },
        { code: 'do_an_tot_nghiep', name: 'Đồ án tốt nghiệp', description: 'ĐATN cho sinh viên đại học' },
        { code: 'khoa_luan', name: 'Khóa luận tốt nghiệp', description: 'KLTN cho sinh viên đại học' },
        { code: 'luan_van', name: 'Luận văn thạc sĩ', description: 'Luận văn cho học viên cao học' },
    ];

    for (const pt of programTypes) {
        await prisma.programType.upsert({
            where: { code: pt.code },
            update: {},
            create: pt,
        });
    }
    console.log('✅ Created program types');

    // Get references for format profile
    const cntt = await prisma.faculty.findFirst({ where: { code: 'cntt' } });
    const datn = await prisma.programType.findFirst({ where: { code: 'do_an_tot_nghiep' } });

    // Create TLU format profile
    const tluProfile = await prisma.formatProfile.upsert({
        where: { code: 'tlu_datn_2024' },
        update: {},
        create: {
            code: 'tlu_datn_2024',
            name: 'Đại học Thủy lợi - Đồ án tốt nghiệp',
            description: 'Format chuẩn cho ĐATN/KLTN theo hướng dẫn của Trường Đại học Thủy lợi',
            schoolId: tlu.id,
            programTypeId: datn?.id,
            isDefault: true,
            createdById: admin.id,
            configJson: {
                page: {
                    size: 'A4',
                    margin: { top_cm: 2.5, bottom_cm: 2.5, left_cm: 3.5, right_cm: 2.0 },
                    print: { double_sided: true },
                },
                styles: {
                    ChapterHeading: {
                        font: 'Times New Roman',
                        size_pt: 14,
                        bold: true,
                        all_caps: true,
                        align: 'left',
                        spacing_before_pt: 24,
                        spacing_after_pt: 24,
                    },
                    SectionLevel1: {
                        font: 'Times New Roman',
                        size_pt: 13,
                        bold: true,
                        spacing_before_pt: 6,
                        spacing_after_pt: 12,
                    },
                    SectionLevel2: {
                        font: 'Times New Roman',
                        size_pt: 13,
                        bold: true,
                        italic: true,
                        spacing_before_pt: 6,
                        spacing_after_pt: 12,
                    },
                    BodyText: {
                        font: 'Times New Roman',
                        size_pt: 13,
                        align: 'justify',
                        line_spacing: 1.5,
                        spacing_before_pt: 10,
                    },
                    Caption: {
                        font: 'Times New Roman',
                        size_pt: 12,
                        italic: true,
                        align: 'center',
                    },
                },
                numbering: {
                    chapter: { pattern: 'CHƯƠNG {n}' },
                    section_level_1: { pattern: '{chapter}.{n}' },
                    figure: { pattern: 'Hình {chapter}.{n}' },
                    table: { pattern: 'Bảng {chapter}.{n}' },
                    equation: { pattern: '({chapter}-{n})' },
                },
            },
        },
    });
    console.log('✅ Created format profile:', tluProfile.name);

    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
