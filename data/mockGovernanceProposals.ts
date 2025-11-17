import type { GovernanceProposal } from '../types';

export const mockGovernanceProposals: GovernanceProposal[] = [
  {
    id: 'prop_001',
    title: 'Increase Staking Rewards on Sepolia',
    description: 'Proposal to increase the base staking rewards for all MeeBots on the Sepolia testnet by 5% to encourage long-term holding.',
    relatedMeeBotIds: ['mb-001', 'mb-002'],
    status: 'approved',
    createdAt: 1672876800000, // Jan 5, 2023
  },
  {
    id: 'prop_002',
    title: 'Introduce New "Explorer" Persona',
    description: 'A proposal to research and develop a new "Explorer" persona focused on discovering rare digital artifacts.',
    relatedMeeBotIds: ['mb-001'],
    status: 'pending',
    createdAt: 1673395200000, // Jan 11, 2023
  },
  {
    id: 'prop_003',
    title: 'Update Emotion Dynamics Model',
    description: 'This proposal was rejected as the new model showed instability in simulations.',
    relatedMeeBotIds: [], // Affects all, but not linked to a specific one for this example
    status: 'rejected',
    createdAt: 1672704000000, // Jan 3, 2023
  }
];