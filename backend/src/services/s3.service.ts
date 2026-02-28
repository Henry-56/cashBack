import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

export class S3Service {
    private client: S3Client;
    private bucketName: string;

    constructor() {
        this.bucketName = (process.env.S3_BUCKET_NAME || '').split('/')[0];
        const accountId = process.env.R2_ACCOUNT_ID || '';
        const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

        this.client = new S3Client({
            region: 'auto',
            endpoint: endpoint,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
            },
        });
    }

    async uploadFile(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
        if (!this.bucketName) throw new Error('S3_BUCKET_NAME not configured');

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileName,
            Body: fileBuffer,
            ContentType: contentType,
        });

        await this.client.send(command);

        if (process.env.S3_PUBLIC_URL) {
            return `${process.env.S3_PUBLIC_URL.replace(/\/$/, '')}/${fileName}`;
        }

        // Fallback construct if R2 Dev domain is not provided
        const accountId = process.env.R2_ACCOUNT_ID || '';
        return `https://${this.bucketName}.${accountId}.r2.cloudflarestorage.com/${fileName}`;
    }

    async getFile(fileName: string): Promise<{ body: any; contentType: string | undefined }> {
        if (!this.bucketName) throw new Error('S3_BUCKET_NAME not configured');

        if (!fileName) return { body: null, contentType: undefined };

        // If the URL has the full path including bucket, we might need to strip it
        const key = fileName.includes('cloudflarestorage.com/')
            ? fileName.split('cloudflarestorage.com/')[1]
            : fileName;

        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        const response = await this.client.send(command);
        return {
            body: response.Body,
            contentType: response.ContentType
        };
    }
}
