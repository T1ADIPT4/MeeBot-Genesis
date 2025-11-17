import { type MeeBotMetadata } from '../types';

export const mockMeeBots: MeeBotMetadata[] = [
  {
    id: 'mb-001',
    name: 'MeeBot #7342',
    persona: 'Creative Soul',
    soul_prompt: 'A radiant, crystalline bot holding a glowing lotus flower.',
    description: 'A radiant, crystalline bot holding a glowing lotus flower.',
    emotion: 'serene',
    image: 'ipfs://bafybeie2gnqaybglq2etcowihk6p3gafps3d4xygmcjzuy5h33a4gq2k2m',
    createdAt: 1672531200000,
    creator: '0x123...abc',
    language: 'en',
    voice_message: 'Creativity is the soul of the universe.',
    external_url: 'https://meechain.app/meebot/7342',
    txHash: '0x1a2b3c...',
    tokenURI: 'ipfs://bafybeicg2kl4zdo6hzhh5d3yln7ajpauxp5idquommgj4n4pw2ojt2slbe',
    chainName: 'Sepolia',
    chainId: 11155111,
    attributes: [
      { trait_type: 'Persona', value: 'Creative Soul' },
      { trait_type: 'Emotion', value: 'serene' },
      { trait_type: 'VoiceStyle', value: 'Calm' }
    ],
    miningGift: {
      program: 'DreamWeaver Miner',
      boost: 'x1.5 Creativity',
      duration: '24h',
      activatedAt: 1672531260000,
    },
    memory: [
      { type: 'Mint', message: 'MeeBot #7342 was born from a creative soul.', timestamp: 1672531200000, status: 'confirmed' },
      { type: 'MiningGift', message: 'MeeBot #7342 was gifted the "DreamWeaver Miner".', timestamp: 1672531260000, status: 'confirmed' },
    ]
  },
  {
    id: 'mb-002',
    name: 'MeeBot #1099',
    persona: 'Guardian Protector',
    soul_prompt: 'A giant bot made of ancient stone and overgrown with moss, standing guard.',
    description: 'A giant bot made of ancient stone and overgrown with moss, standing guard.',
    emotion: 'stoic',
    image: 'ipfs://bafybeifvv2m5lpr2uknzs5go2jprxebfvpk2rh4hh2loty3prw4wf4wsei',
    createdAt: 1672617600000,
    creator: '0x456...def',
    language: 'en',
    voice_message: 'None shall pass.',
    external_url: 'https://meechain.app/meebot/1099',
    txHash: '0x4d5e6f...',
    tokenURI: 'ipfs://bafybeidv42b2vum5hyuzaynphm2v3o2yguw25kpl75swn2xdvpunf3cdna',
    chainName: 'Sepolia',
    chainId: 11155111,
    attributes: [
      { trait_type: 'Persona', value: 'Guardian Protector' },
      { trait_type: 'Emotion', value: 'stoic' },
      { trait_type: 'VoiceStyle', value: 'Deep' }
    ],
    miningGift: {
      program: 'Aegis Core Miner',
      boost: '+50% Defense',
      duration: 'Permanent',
      activatedAt: 1672617660000,
    },
    memory: [
      { type: 'Mint', message: 'MeeBot #1099 materialized, exuding an aura of strength.', timestamp: 1672617600000, status: 'confirmed' },
      { type: 'MiningGift', message: 'MeeBot #1099 received the permanent "Aegis Core Miner".', timestamp: 1672617660000, status: 'confirmed' },
    ]
  }
];