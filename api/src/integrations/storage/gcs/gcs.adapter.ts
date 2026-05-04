import { Injectable, Logger } from '@nestjs/common';
import {
    UploadImageRequest,
    UploadImageResponse,
    DeleteImageRequest,
    DeleteImageResponse,
    ListImagesRequest,
    ListImagesResponse,
    DownloadImageRequest,
    DownloadImageResponse
} from './interfaces/gcs.interfaces';
import { GcsConfig } from './config/gcs.config';

@Injectable()
export class GcsAdapter {
    private readonly logger = new Logger(GcsAdapter.name);
    private folder: string;

    constructor(
        private gcsConfig: GcsConfig,
    ) {
        this.folder = this.gcsConfig.getConfig().folder_name;
    }

    public async uploadImage(request: UploadImageRequest): Promise<UploadImageResponse> {
        try {

            const storage = this.gcsConfig.getStorageClient();
            const bucketName = request.bucket || this.gcsConfig.getBucketName();
            const bucket = storage.bucket(bucketName);

            const folder = request.folder || this.folder;
            const filename = `${folder}/${Date.now()}-${request.filename}`;

            const file = bucket.file(filename);

            const stream = file.createWriteStream({
                metadata: {
                    contentType: request.contentType,
                },
                // public: request.public || false,
            });

            return new Promise((resolve, reject) => {
                stream.on('error', (error) => {
                    this.logger.error('Upload error:', error);
                    reject(error);
                });

                stream.on('finish', async () => {
                    try {
                        // if (request.public) {
                        //     await file.makePublic();
                        // }

                        const [metadata] = await file.getMetadata();
                        const url = `https://storage.googleapis.com/${bucketName}/${filename}`;

                        resolve({
                            url,
                            filename,
                            size: parseInt(String(metadata.size)),
                            contentType: metadata.contentType,
                            bucket: bucketName,
                            path: filename
                        });
                    } catch (error) {
                        this.logger.error('Error getting metadata:', error);
                        reject(error);
                    }
                });

                stream.end(request.file);
            });
        } catch (error) {
            this.logger.error('Upload error:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }

    public async deleteImage(request: DeleteImageRequest): Promise<DeleteImageResponse> {
        try {
            const storage = this.gcsConfig.getStorageClient();
            const bucketName = this.gcsConfig.getBucketName();
            const bucket = storage.bucket(bucketName);

            const file = bucket.file(request.filename);
            await file.delete();

            return {
                success: true,
                filename: request.filename
            };
        } catch (error) {
            this.logger.error('Delete error:', error);
            throw new Error(`Failed to delete image: ${error.message}`);
        }
    }

    public async listImages(request?: ListImagesRequest): Promise<ListImagesResponse> {
        try {
            const storage = this.gcsConfig.getStorageClient();
            const bucketName = this.gcsConfig.getBucketName();
            const bucket = storage.bucket(bucketName);

            const folder = request.folder || this.folder;
            const prefix = request.prefix ? `${folder}/${request.prefix}` : `${folder}/`;
            const maxResults = request.maxResults || 100;

            const [files] = await bucket.getFiles({
                prefix,
                maxResults
            });

            const documents = await Promise.all(
                files.map(async (file) => {
                    const [metadata] = await file.getMetadata();
                    const url = `https://storage.googleapis.com/${bucketName}/${file.name}`;

                    return {
                        name: file.name,
                        url,
                        size: parseInt(String(metadata.size)),
                        contentType: metadata.contentType,
                        created: new Date(metadata.timeCreated)
                    };
                })
            );

            return {
                documents,
                nextPageToken: files.length === maxResults ? 'has_more' : undefined
            };
        } catch (error) {
            this.logger.error('List documents error:', error);
            throw new Error(`Failed to list documents: ${error.message}`);
        }
    }

    public async getSignedUrl(filename: string, folder?: string, expiresInMinutes: number = 60): Promise<string> {
        try {
            const storage = this.gcsConfig.getStorageClient();
            const bucketName = this.gcsConfig.getBucketName();
            const bucket = storage.bucket(bucketName);

            const folderPath = folder || this.folder;
            const fullPath = `${folderPath}/${filename}`;

            const file = bucket.file(fullPath);
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + expiresInMinutes * 60 * 1000,
            });

            return signedUrl;
        } catch (error) {
            this.logger.error('Get signed URL error:', error);
            throw new Error(`Failed to get signed URL: ${error.message}`);
        }
    }

    public async downloadImage(request: DownloadImageRequest): Promise<DownloadImageResponse> {
        try {
            const storage = this.gcsConfig.getStorageClient();
            const bucketName = this.gcsConfig.getBucketName();
            const bucket = storage.bucket(bucketName);

            const filePath = request.folder ? `${request.folder}/${request.filename}` : request.filename;
            const file = bucket.file(filePath);

            const [exists] = await file.exists();
            if (!exists) {
                throw new Error(`File not found: ${filePath}`);
            }

            const [buffer] = await file.download();
            const [metadata] = await file.getMetadata();

            return {
                buffer: Buffer.from(buffer),
                contentType: metadata.contentType || 'application/octet-stream'
            };
        } catch (error) {
            this.logger.error('Download image error:', error);
            throw new Error(`Failed to download image: ${error.message}`);
        }
    }
}
