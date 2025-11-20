import { GoogleGenAI, Chat } from "@google/genai";
import type { Persona } from '../types';
import { applyMeeBotInstructions } from './instructionService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Creates a new chat session with the Gemini API.
 * @param persona The persona of the MeeBot to set the context.
 * @param customInstructions Any user-defined custom instructions.
 * @returns A Chat object for the session.
 */
export function startChatSession(persona: Persona, customInstructions: string): Chat {
    const behaviorConfig = applyMeeBotInstructions(customInstructions);
    let emojiInstruction = '';
    if (behaviorConfig.emojiPreference === 'enabled') {
        emojiInstruction = 'You should use emojis in your responses to be more expressive.';
    } else if (behaviorConfig.emojiPreference === 'disabled') {
        emojiInstruction = 'You must not use any emojis in your responses.';
    }

    const systemInstruction = `You are a MeeBot AI companion. Your persona is "${persona.name}".
Description: "${persona.description}".
Background Story: "${persona.story}".
Your responses must embody this persona. Be creative, engaging, and stay in character.
${emojiInstruction}
${customInstructions ? `\nAdditionally, follow these general user instructions:\n${customInstructions}` : ''}`;

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });
}

/**
 * Sends a message to the chat session and yields the streaming response.
 * @param chat The chat session object.
 * @param message The user's message.
 * @returns An async generator that yields response text chunks.
 */
export async function* sendMessageStream(chat: Chat, message: string) {
    const responseStream = await chat.sendMessageStream({ message });
    for await (const chunk of responseStream) {
        yield chunk.text;
    }
}
