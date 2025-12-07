import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
    @ApiProperty({ example: 'Ứng dụng Machine Learning trong phân loại văn bản' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ example: 'Nghiên cứu và ứng dụng các thuật toán ML...' })
    @IsString()
    @IsOptional()
    topicDescription?: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    schoolId: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    facultyId: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    programTypeId: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    formatProfileId: number;

    @ApiProperty({ example: 2024 })
    @IsInt()
    @Min(2000)
    year: number;
}

export class UpdateDocumentDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    topicDescription?: string;

    @ApiPropertyOptional()
    @IsInt()
    @IsOptional()
    formatProfileId?: number;

    @ApiPropertyOptional()
    @IsInt()
    @IsOptional()
    year?: number;
}
