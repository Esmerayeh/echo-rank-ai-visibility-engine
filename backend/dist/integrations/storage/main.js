import { Storage, InfraProvider } from '@uptiqai/integrations-sdk';
/**
 * Storage Integration - Provides a unified interface for file storage operations
 * Uses the @uptiqai/integrations-sdk to abstract cloud providers (AWS S3, GCS, Azure Blob)
 */
export const getStorageProvider = () => {
    const provider = process.env.INFRA_PROVIDER || InfraProvider.GCP;
    const storage = new Storage({ provider });
    return {
        uploadFile: async ({ file, destinationKey }) => {
            return await storage.uploadFile({
                file,
                destinationKey,
            });
        },
        uploadData: async ({ data, destinationKey, contentType }) => {
            return await storage.uploadData({
                data,
                destinationKey,
                contentType,
            });
        },
        generateDownloadSignedUrl: async ({ key, fileName }) => {
            return await storage.generateDownloadSignedUrl({
                key,
                fileName,
            });
        },
        generateUploadSignedUrl: async ({ key, contentType }) => {
            return await storage.generateUploadSignedUrl({
                key,
                contentType,
            });
        },
        deleteFile: async ({ key }) => {
            return await storage.deleteFile({ key });
        },
        documentExists: async ({ key }) => {
            return await storage.documentExists({ key });
        },
        getFileMetadata: async ({ key }) => {
            return await storage.getFileMetadata({ key });
        }
    };
};
