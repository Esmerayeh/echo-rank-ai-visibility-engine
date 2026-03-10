import { Storage, InfraProvider } from '@uptiqai/integrations-sdk';

let storage: Storage | null = null;

export const getStorageProvider = () => {
  if (!storage) {
    storage = new Storage({
      provider: (process.env.INFRA_PROVIDER as InfraProvider) || InfraProvider.GCP,
    });
  }
  return storage;
};
