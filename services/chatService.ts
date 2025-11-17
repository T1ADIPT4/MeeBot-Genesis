import { GoogleGenAI, Chat } from "@google/genai";
import type { Persona } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Creates a new chat session with the Gemini API.
 * @param persona The persona of the MeeBot to set the context.
 * @param customInstructions Any user-defined custom instructions.
 * @returns A Chat object for the session.
 */
export function startChatSession(persona: Persona, customInstructions: string): Chat {
    const systemInstruction = `You are a MeeBot AI companion. Your persona is "${persona.name}".
Description: "${persona.description}".
Your responses must embody this persona. Be creative, engaging, and stay in character.
${customInstructions ? `\nFollow these additional user instructions:\n${customInstructions}` : ''}`;

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