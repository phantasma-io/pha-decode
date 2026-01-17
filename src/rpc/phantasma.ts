import { PhantasmaAPI } from 'phantasma-sdk-ts';
import type { Contract, TransactionData } from 'phantasma-sdk-ts';

export async function fetchTransaction(rpcUrl: string, hash: string): Promise<TransactionData> {
  const api = new PhantasmaAPI(rpcUrl, null, 'mainnet');
  return await api.getTransaction(hash);
}

export async function fetchContracts(rpcUrl: string, chain: string = 'main'): Promise<Contract[]> {
  const api = new PhantasmaAPI(rpcUrl, null, 'mainnet');
  return await api.getContracts(chain, true);
}
