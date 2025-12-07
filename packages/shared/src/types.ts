// Format Profile Types
export interface PageConfig {
    size: 'A4' | 'Letter';
    width_mm: number;
    height_mm: number;
    orientation: 'portrait' | 'landscape';
    margin: {
        top_cm: number;
        bottom_cm: number;
        left_cm: number;
        right_cm: number;
    };
    header?: {
        enabled: boolean;
        distance_from_edge_cm?: number;
    };
    footer?: {
        enabled: boolean;
        distance_from_edge_cm?: number;
    };
    page_numbering?: {
        front_matter?: {
            format: 'roman_lowercase' | 'roman_uppercase' | 'arabic';
            start_from: string;
            position: 'bottom_center' | 'bottom_right' | 'bottom_left';
        };
        main_content?: {
            format: 'arabic';
            start_from: number;
            position: 'bottom_center' | 'bottom_right' | 'bottom_left';
        };
    };
}

export interface StyleConfig {
    description?: string;
    font: string;
    size_pt: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    all_caps?: boolean;
    align?: 'left' | 'right' | 'center' | 'justify';
    line_spacing?: number | 'single' | 'double';
    line_spacing_multiple?: number;
    spacing_before_pt?: number;
    spacing_after_pt?: number;
    first_line_indent_cm?: number;
    left_indent_cm?: number;
    right_indent_cm?: number;
    hanging_indent_cm?: number;
    keep_with_next?: boolean;
    outline_level?: number;
}

export interface NumberingConfig {
    pattern: string;
    title_pattern?: string;
    caption_pattern?: string;
    scope: 'document' | 'chapter' | 'section_level_1' | 'section_level_2';
    start_from: number;
    position?: 'above' | 'below';
    align?: 'left' | 'center' | 'right';
    max_depth?: number;
}

export interface GeneratedConfig {
    enabled: boolean;
    title?: string;
    style?: string;
    include?: Array<{ node_type: string; max_level?: number }>;
    styles?: Record<string, string>;
    page_number_align?: 'left' | 'right';
    leader?: 'dots' | 'dashes' | 'none';
}

export interface MappingConfig {
    style_key?: string;
    caption_style_key?: string;
    numbering_key?: string;
    page_break_before?: boolean;
    align?: string;
}

export interface FormatProfileConfig {
    id: string;
    name: string;
    description?: string;
    scope: {
        school_code?: string;
        school_name?: string;
        faculty_code?: string;
        program_type?: string;
    };
    page: PageConfig;
    styles: Record<string, StyleConfig>;
    numbering: Record<string, NumberingConfig>;
    generated: Record<string, GeneratedConfig>;
    mapping: Record<string, Record<string, MappingConfig>>;
    document_structure?: {
        front_matter?: string[];
        main_content?: string[];
        back_matter?: string[];
    };
}

// Document Node Types
export interface CreateNodeDto {
    parentId?: number;
    position: number;
    nodeType: string;
    sectionGroupType?: string;
    level?: number;
    semanticRole?: string;
    contentPlain?: string;
    dataJson?: Record<string, unknown>;
}

export interface UpdateNodeDto {
    position?: number;
    contentPlain?: string;
    inlineJson?: Record<string, unknown>;
    dataJson?: Record<string, unknown>;
    semanticRole?: string;
    styleKeyOverride?: string;
}

export interface NodeTreeItem {
    id: number;
    parentId: number | null;
    position: number;
    nodeType: string;
    sectionGroupType?: string;
    level?: number;
    semanticRole?: string;
    contentPlain?: string;
    dataJson?: Record<string, unknown>;
    children?: NodeTreeItem[];
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Auth Types
export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    fullName: string;
}

export interface AuthResponse {
    accessToken: string;
    user: {
        id: number;
        email: string;
        fullName: string;
        role: string;
    };
}

// Document Types
export interface CreateDocumentDto {
    title: string;
    topicDescription?: string;
    schoolId: number;
    facultyId: number;
    programTypeId: number;
    formatProfileId: number;
    year: number;
}

export interface DocumentSummary {
    id: number;
    title: string;
    status: string;
    schoolName: string;
    facultyName: string;
    programTypeName: string;
    year: number;
    updatedAt: Date;
}
