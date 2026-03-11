import { Storage, InfraProvider } from '@uptiqai/integrations-sdk';

/**
 * Storage Integration - Provides a unified interface for file storage operations
 * Uses the @uptiqai/integrations-sdk to abstract cloud providers (AWS S3, GCS, Azure Blob)
 */

export const getStorageProvider = () => {
  const provider = (process.env.INFRA_PROVIDER as InfraProvider) || InfraProvider.GCP;
  
  const storage = new Storage({ provider });
  
  return {
    uploadFile: async ({ file, destinationKey }: { file: Blob, destinationKey: string }) => {
      return await storage.uploadFile({
        file,
        destinationKey,
      });
    },
    
    uploadData: async ({ data, destinationKey, contentType }: { data: string, destinationKey: string, contentType?: string }) => {
      return await storage.uploadData({
        data,
        destinationKey,
        contentType,
      });
    },
    
    generateDownloadSignedUrl: async ({ key, fileName }: { key: string, fileName?: string }) => {
      return await storage.generateDownloadSignedUrl({
        key,
        fileName,
      });
    },
    
    generateUploadSignedUrl: async ({ key, contentType }: { key: string, contentType?: string }) => {
      return await storage.generateUploadSignedUrl({
        key,
        contentType,
      });
    },
    
    deleteFile: async ({ key }: { key: string }) => {
      return await storage.deleteFile({ key });
    },
    
    documentExists: async ({ key }: { key: string }) => {
      return await storage.documentExists({ key });
    },
    
    getFileMetadata: async ({ key }: { key: string }) => {
      return await storage.getFileMetadata({ key });
    }
  };
};
