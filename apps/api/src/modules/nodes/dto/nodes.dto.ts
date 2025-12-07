import { IsString, IsOptional, IsInt, IsEnum, IsObject, ValidateNested, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateNodeDto {
    @ApiPropertyOptional({ example: 1 })
    @IsInt()
    @IsOptional()
    parentId?: number;

    @ApiProperty({ example: 0 })
    @IsInt()
    position: number;

    @ApiProperty({ example: 'CHAPTER' })
    @IsString()
    nodeType: string;

    @ApiPropertyOptional({ example: 'MAIN' })
    @IsString()
    @IsOptional()
    sectionGroupType?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsInt()
    @IsOptional()
    level?: number;

    @ApiPropertyOptional({ example: 'main_body_paragraph' })
    @IsString()
    @IsOptional()
    semanticRole?: string;

    @ApiPropertyOptional({ example: 'TỔNG QUAN VẤN ĐỀ NGHIÊN CỨU' })
    @IsString()
    @IsOptional()
    contentPlain?: string;

    @ApiPropertyOptional()
    @IsObject()
    @IsOptional()
    dataJson?: Record<string, unknown>;
}

export class UpdateNodeDto {
    @ApiPropertyOptional()
    @IsInt()
    @IsOptional()
    position?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    contentPlain?: string;

    @ApiPropertyOptional()
    @IsObject()
    @IsOptional()
    inlineJson?: Record<string, unknown>;

    @ApiPropertyOptional()
    @IsObject()
    @IsOptional()
    dataJson?: Record<string, unknown>;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    semanticRole?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    styleKeyOverride?: string;
}

export class BulkNodeDto {
    @ApiProperty()
    @IsInt()
    id: number;

    @ApiPropertyOptional()
    @IsInt()
    @IsOptional()
    parentId?: number;

    @ApiProperty()
    @IsInt()
    position: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    contentPlain?: string;

    @ApiPropertyOptional()
    @IsInt()
    @IsOptional()
    level?: number;
}

export class BulkUpdateNodesDto {
    @ApiProperty({ type: [BulkNodeDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkNodeDto)
    nodes: BulkNodeDto[];
}
