import { Injectable, Logger } from '@nestjs/common';
import { GcsAdapter } from '../gcs.adapter';
import {
    UploadImageRequest,
    UploadImageResponse,
    DeleteImageRequest,
    DeleteImageResponse,
    ListImagesRequest,
    ListImagesResponse,
    DownloadImageRequest,
    DownloadImageResponse
} from '../interfaces/gcs.interfaces';

@Injectable()
export class GcsService {
    private readonly logger = new Logger(GcsService.name);

    constructor(
        private gcsAdapter: GcsAdapter
    ) { }

    public async uploadImage(request: UploadImageRequest): Promise<UploadImageResponse> {
        try {
            return await this.gcsAdapter.uploadImage(request);
        } catch (error) {
            this.logger.error('Upload image error:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }

    public async deleteImage(request: DeleteImageRequest): Promise<DeleteImageResponse> {
        try {
            return await this.gcsAdapter.deleteImage(request);
        } catch (error) {
            this.logger.error('Delete image error:', error);
            throw new Error(`Failed to delete image: ${error.message}`);
        }
    }

    public async listImages(request?: ListImagesRequest): Promise<ListImagesResponse> {
        try {
            return await this.gcsAdapter.listImages(request);
        } catch (error) {
            this.logger.error('List images error:', error);
            throw new Error(`Failed to list images: ${error.message}`);
        }
    }

    public async getSignedUrl(filename: string, folder?: string, expiresInMinutes: number = 60): Promise<string> {
        try {
            return await this.gcsAdapter.getSignedUrl(filename, folder, expiresInMinutes);
        } catch (error) {
            this.logger.error('Get signed URL error:', error);
            throw new Error(`Failed to get signed URL: ${error.message}`);
        }
    }

    public async uploadImageFromBuffer(
        buffer: Buffer,
        filename: string,
        contentType: string,
        folder?: string,
        isPublic: boolean = false
    ): Promise<UploadImageResponse> {
        const request: UploadImageRequest = {
            file: buffer,
            filename,
            contentType,
            folder,
        };

        return this.uploadImage(request);
    }

    public async uploadImageFromBase64(
        base64Data: string,
        filename: string,
        contentType: string,
        folder?: string,
        isPublic: boolean = false
    ): Promise<UploadImageResponse> {
        const buffer = Buffer.from(base64Data, 'base64');
        return this.uploadImageFromBuffer(buffer, filename, contentType, folder, isPublic);
    }

    public async uploadMultipleImages(requests: UploadImageRequest[]): Promise<UploadImageResponse[]> {
        try {

            const uploadPromises = requests.map((request, index) =>
                this.uploadImage(request).catch(error => {
                    this.logger.error(`Failed to upload image ${index + 1} (${request.filename}):`, error);
                    return null;
                })
            );

            const results = await Promise.all(uploadPromises);

            return results;
        } catch (error) {
            this.logger.error('Upload multiple images error:', error.message);
            throw new Error(`Failed to upload multiple images: ${error.message}`);
        }
    }

    public async downloadImage(request: DownloadImageRequest): Promise<DownloadImageResponse> {
        try {
            return await this.gcsAdapter.downloadImage(request);
        } catch (error) {
            this.logger.error('Download image error:', error);
            throw new Error(`Failed to download image: ${error.message}`);
        }
    }

}
