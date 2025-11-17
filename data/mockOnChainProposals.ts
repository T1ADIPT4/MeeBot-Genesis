import type { OnChainProposal } from '../types';

export const mockOnChainProposals: OnChainProposal[] = [
  {
    id: 'onchain_001',
    title: 'Protocol Upgrade v1.2 on Sepolia',
    description: 'Execute the v1.2 protocol upgrade which includes gas optimizations and a new oracle integration.',
    proposer: '0xDev...Core',
    createdAt: 1675209600000, // Feb 1, 2023
    voteYes: 125,
    voteNo: 12,
    executed: true,
    chainName: 'Sepolia',
    txHash: '0x1a8f2b9b7e7b6f8a4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b',
    relatedMeeBotIds: ['mb-001', 'mb-002'],
  },
  {
    id: 'onchain_002',
    title: 'Community Treasury Grant for MeeBot Artists on Fuse',
    description: 'Allocate 10,000 FUSE tokens from the community treasury to fund a grant program for artists creating MeeBot accessories.',
    proposer: '0xCommunity...DAO',
    createdAt: 1677628800000, // Mar 1, 2023
    voteYes: 88,
    voteNo: 4,
    executed: false,
    chainName: 'Fuse',
    txHash: '0x2b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c',
    relatedMeeBotIds: ['mb-001'],
  },
  {
    id: 'onchain_003',
    title: 'Adjust Liquidity Mining Rewards on BNB Chain',
    description: 'A proposal to slightly decrease LP rewards by 10% and redirect the funds to a new developer incentive program.',
    proposer: '0xStrategy...DAO',
    createdAt: 1678838400000, // Mar 15, 2023
    voteYes: 34,
    voteNo: 41,
    executed: false,
    chainName: 'BNB',
    txHash: '0x3c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
    relatedMeeBotIds: [],
  },
   {
    id: 'onchain_004',
    title: 'Partnership with Project Neptune on Fuse',
    description: 'Form a strategic partnership with Project Neptune to integrate their decentralized identity solution.',
    proposer: '0xGrowth...DAO',
    createdAt: 1679356800000, // Mar 21, 2023
    voteYes: 205,
    voteNo: 3,
    executed: false,
    chainName: 'Fuse',
    txHash: '0x4d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e',
    relatedMeeBotIds: ['mb-001'],
  },
];