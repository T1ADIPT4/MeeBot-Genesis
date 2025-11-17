import type { OnChainProposal } from '../types';
import { mockOnChainProposals } from '../data/mockOnChainProposals';

// In-memory store to simulate a blockchain's state
let proposalsDB: OnChainProposal[] = [...mockOnChainProposals];
let nextId = proposalsDB.length + 1;

const simulateDelay = (ms = 1500) => new Promise(resolve => setTimeout(resolve, ms));

export async function getProposals(chainFilter: 'All' | 'Sepolia' | 'Fuse' | 'BNB'): Promise<OnChainProposal[]> {
  await simulateDelay(500);
  if (chainFilter === 'All') {
    return [...proposalsDB];
  }
  return proposalsDB.filter(p => p.chainName === chainFilter);
}

export async function createProposal(
  title: string,
  description: string,
  chainName: 'Sepolia' | 'Fuse' | 'BNB'
): Promise<OnChainProposal> {
  await simulateDelay();
  const newProposal: OnChainProposal = {
    id: `onchain_00${nextId++}`,
    title,
    description,
    proposer: '0xYour...Wallet',
    createdAt: Date.now(),
    voteYes: 0,
    voteNo: 0,
    executed: false,
    chainName,
    txHash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    relatedMeeBotIds: [],
  };
  proposalsDB.unshift(newProposal);
  return newProposal;
}

export async function voteOnProposal(proposalId: string, support: boolean): Promise<OnChainProposal> {
  await simulateDelay();
  const proposal = proposalsDB.find(p => p.id === proposalId);
  if (!proposal) {
    throw new Error('Proposal not found');
  }
  if (proposal.executed) {
    throw new Error('Cannot vote on an executed proposal');
  }
  if (support) {
    proposal.voteYes += 1;
  } else {
    proposal.voteNo += 1;
  }
  return { ...proposal };
}

export async function executeProposal(proposalId: string): Promise<OnChainProposal> {
  await simulateDelay(2000);
  const proposal = proposalsDB.find(p => p.id === proposalId);
  if (!proposal) {
    throw new Error('Proposal not found');
  }
  if (proposal.executed) {
    throw new Error('Proposal already executed');
  }
  if (proposal.voteYes <= proposal.voteNo) {
    throw new Error('Proposal has not passed');
  }
  proposal.executed = true;
  return { ...proposal };
}

export async function fetchProposalsForMeeBot(meebotId: string): Promise<OnChainProposal[]> {
    await simulateDelay(600);
    return proposalsDB.filter(p => p.relatedMeeBotIds.includes(meebotId));
}