import { Storage, InfraProvider } from '@uptiqai/integrations-sdk';
let storage = null;
export const getStorageProvider = () => {
    if (!storage) {
        storage = new Storage({
            provider: process.env.INFRA_PROVIDER || InfraProvider.GCP,
        });
    }
    return storage;
};
