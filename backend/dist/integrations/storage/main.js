// Local placeholder storage implementation to remove cloud dependencies
export const getStorageProvider = () => {
    return {
        uploadFile: async ({ file, destinationKey }) => {
            console.log('Mock upload:', destinationKey);
            return { url: `https://placeholder.com/${destinationKey}`, key: destinationKey };
        },
        uploadData: async ({ data, destinationKey }) => {
            console.log('Mock upload data:', destinationKey);
            return { url: `https://placeholder.com/${destinationKey}`, key: destinationKey };
        },
        generateDownloadSignedUrl: async ({ key }) => {
            return { url: `https://placeholder.com/${key}` };
        },
        deleteFile: async ({ key }) => {
            console.log('Mock delete:', key);
            return { success: true };
        },
        documentExists: async ({ key }) => {
            return { exists: true };
        }
    };
};
