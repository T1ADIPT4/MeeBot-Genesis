import { getProposals as getOnChainProposals, fetchProposalsForMeeBot as getOnChainProposalsForBot } from './onChainProposalService';
import { getAllProposals as getOffChainProposals, fetchProposalsForMeeBot as getOffChainProposalsForBot } from './governanceProposalService';
import type { OnChainProposal, GovernanceProposal } from '../types';

export type UnifiedProposal = (OnChainProposal & { source: 'onchain' }) | (GovernanceProposal & { source: 'offchain' });

export async function fetchAllProposals(chainFilter: 'All' | 'Sepolia' | 'Fuse' | 'BNB'): Promise<UnifiedProposal[]> {
  const [onChain, offChain] = await Promise.all([
    getOnChainProposals(chainFilter),
    getOffChainProposals(),
  ]);

  const onChainWithSource = onChain.map(p => ({ ...p, source: 'onchain' as const }));
  
  // Off-chain proposals are chain-agnostic, so they should always appear unless a specific chain is selected
  const offChainWithSource = (chainFilter === 'All' ? offChain : []).map(p => ({ ...p, source: 'offchain' as const }));

  const allProposals: UnifiedProposal[] = [...onChainWithSource, ...offChainWithSource];

  // Sort by creation date, newest first
  allProposals.sort((a, b) => b.createdAt - a.createdAt);

  return allProposals;
}

export async function fetchProposalsForMeeBot(meebotId: string): Promise<UnifiedProposal[]> {
  const [onChain, offChain] = await Promise.all([
    getOnChainProposalsForBot(meebotId),
    getOffChainProposalsForBot(meebotId),
  ]);

  const onChainWithSource = onChain.map(p => ({ ...p, source: 'onchain' as const }));
  const offChainWithSource = offChain.map(p => ({ ...p, source: 'offchain' as const }));

  const allProposals: UnifiedProposal[] = [...onChainWithSource, ...offChainWithSource];

  allProposals.sort((a, b) => b.createdAt - a.createdAt);

  return allProposals;
}