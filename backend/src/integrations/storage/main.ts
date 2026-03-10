// Local placeholder storage implementation to remove cloud dependencies
export const getStorageProvider = () => {
  return {
    uploadFile: async ({ file, destinationKey }: { file: Blob, destinationKey: string }) => {
      console.log('Mock upload:', destinationKey);
      return { url: `https://placeholder.com/${destinationKey}`, key: destinationKey };
    },
    uploadData: async ({ data, destinationKey }: { data: string, destinationKey: string }) => {
      console.log('Mock upload data:', destinationKey);
      return { url: `https://placeholder.com/${destinationKey}`, key: destinationKey };
    },
    generateDownloadSignedUrl: async ({ key }: { key: string }) => {
      return { url: `https://placeholder.com/${key}` };
    },
    deleteFile: async ({ key }: { key: string }) => {
      console.log('Mock delete:', key);
      return { success: true };
    },
    documentExists: async ({ key }: { key: string }) => {
      return { exists: true };
    }
  };
};