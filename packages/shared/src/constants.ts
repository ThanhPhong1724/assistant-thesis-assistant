// Node Types
export const NODE_TYPES = {
    DOCUMENT_ROOT: 'DOCUMENT_ROOT',
    SECTION_GROUP: 'SECTION_GROUP',
    CHAPTER: 'CHAPTER',
    SECTION: 'SECTION',
    PARAGRAPH: 'PARAGRAPH',
    LIST: 'LIST',
    LIST_ITEM: 'LIST_ITEM',
    TABLE: 'TABLE',
    FIGURE: 'FIGURE',
    EQUATION: 'EQUATION',
    REFERENCE_LIST: 'REFERENCE_LIST',
    REFERENCE_ITEM: 'REFERENCE_ITEM',
    GENERATED_BLOCK: 'GENERATED_BLOCK',
    COVER_PAGE: 'COVER_PAGE',
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

// Section Group Types
export const SECTION_GROUP_TYPES = {
    FRONT: 'FRONT',
    MAIN: 'MAIN',
    BACK: 'BACK',
} as const;

export type SectionGroupType = (typeof SECTION_GROUP_TYPES)[keyof typeof SECTION_GROUP_TYPES];

// Document Status
export const DOCUMENT_STATUS = {
    DRAFT: 'DRAFT',
    OUTLINE_LOCKED: 'OUTLINE_LOCKED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
} as const;

export type DocumentStatus = (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

// User Roles
export const USER_ROLES = {
    STUDENT: 'STUDENT',
    ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Node Origins
export const NODE_ORIGINS = {
    USER: 'USER',
    AI: 'AI',
    IMPORT: 'IMPORT',
} as const;

export type NodeOrigin = (typeof NODE_ORIGINS)[keyof typeof NODE_ORIGINS];

// Semantic Roles
export const SEMANTIC_ROLES = {
    // Front matter
    FRONT_DECLARATION: 'front_declaration',
    FRONT_ACKNOWLEDGEMENT: 'front_acknowledgement',
    FRONT_ABSTRACT_VI: 'front_abstract_vi',
    FRONT_ABSTRACT_EN: 'front_abstract_en',
    // Main content
    MAIN_BODY_PARAGRAPH: 'main_body_paragraph',
    MAIN_QUOTE: 'main_quote',
    MAIN_CAPTION_PARAGRAPH: 'main_caption_paragraph',
    // Back matter
    BACK_REFERENCE_ITEM: 'back_reference_item',
    APPENDIX_PARAGRAPH: 'appendix_paragraph',
    // Cover page
    COVER_TITLE: 'cover_title',
    COVER_SCHOOL_NAME: 'cover_school_name',
    COVER_FACULTY_NAME: 'cover_faculty_name',
    COVER_STUDENT_INFO: 'cover_student_info',
    COVER_TEACHER_INFO: 'cover_teacher_info',
    COVER_YEAR: 'cover_year',
} as const;

export type SemanticRole = (typeof SEMANTIC_ROLES)[keyof typeof SEMANTIC_ROLES];

// Generated Block Types
export const GENERATED_BLOCK_TYPES = {
    TOC: 'toc',
    FIGURE_LIST: 'figure_list',
    TABLE_LIST: 'table_list',
    ABBREVIATION_LIST: 'abbreviation_list',
} as const;

export type GeneratedBlockType = (typeof GENERATED_BLOCK_TYPES)[keyof typeof GENERATED_BLOCK_TYPES];

// AI Request Types
export const AI_REQUEST_TYPES = {
    OUTLINE_SUGGESTION: 'outline_suggestion',
    CONTENT_SUGGESTION: 'content_suggestion',
    REWRITE_ACADEMIC: 'rewrite_academic',
    CAPTION_SUGGESTION: 'caption_suggestion',
} as const;

export type AiRequestType = (typeof AI_REQUEST_TYPES)[keyof typeof AI_REQUEST_TYPES];

// AI Providers
export const AI_PROVIDERS = {
    OPENAI: 'openai',
    GEMINI: 'gemini',
    GROQ: 'groq',
    OPENROUTER: 'openrouter',
    OLLAMA: 'ollama',
} as const;

export type AiProvider = (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS];
