import type { GovernanceProposal } from '../types';
import { mockGovernanceProposals } from '../data/mockGovernanceProposals';

// Simulate network delay
const simulateDelay = (ms: number = 700) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches governance proposals related to a specific MeeBot by its ID.
 * In a real app, this would be a network request. Here, it filters mock data.
 * @param meebotId The ID of the MeeBot (e.g., 'mb-001').
 * @returns A promise that resolves to an array of related GovernanceProposal objects.
 */
export const fetchProposalsForMeeBot = async (meebotId: string): Promise<GovernanceProposal[]> => {
  await simulateDelay();
  
  const relatedProposals = mockGovernanceProposals.filter(proposal => 
    proposal.relatedMeeBotIds.includes(meebotId)
  );

  return relatedProposals;
};

/**
 * Fetches all off-chain governance proposals.
 * @returns A promise that resolves to an array of all GovernanceProposal objects.
 */
export const getAllProposals = async (): Promise<GovernanceProposal[]> => {
  await simulateDelay(400);
  return [...mockGovernanceProposals];
};
