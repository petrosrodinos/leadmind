export interface UploadImageRequest {
    file: Buffer;
    filename: string;
    contentType: string;
    folder?: string;
    bucket?: string;
}

export interface UploadImageResponse {
    url: string;
    filename: string;
    size: number;
    contentType: string;
    bucket: string;
    path: string;
}

export interface DeleteImageRequest {
    filename: string;
    folder?: string;
}

export interface DeleteImageResponse {
    success: boolean;
    filename: string;
}

export interface ListImagesRequest {
    folder?: string;
    prefix?: string;
    maxResults?: number;
}

export interface ListImagesResponse {
    documents: Array<{
        name: string;
        url: string;
        size: number;
        contentType: string;
        created: Date;
    }>;
    nextPageToken?: string;
}

export interface DownloadImageRequest {
    filename: string;
    folder?: string;
}

export interface DownloadImageResponse {
    buffer: Buffer;
    contentType: string;
}

export interface GcsConfig {
    project_id: string;
    bucket_name: string;
    credentials_path?: string;
    credentials?: object;
    folder_name?: string;
}
