export class UploadResponseDto {
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
    rowsProcessed?: number;
    status: 'success' | 'processing' | 'failed';
    message?: string;
}
