// Mock OpenAI implementation for deployment

export interface Assistant {
  id: string;
  name: string;
  type: 'general' | 'sports' | 'expert';
}

export interface Thread {
  id: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; text?: { value: string } }>;
}

// Cache for assistant IDs
const assistants: Record<string, string> = {
  general: 'mock-assistant-general',
  sports: 'mock-assistant-sports',
  expert: 'mock-assistant-expert'
};

/**
 * Initialize assistants (create or retrieve existing)
 */
export async function initializeAssistants(): Promise<Record<string, string>> {
  return assistants;
}

/**
 * Get or create a thread for the user
 */
export async function getOrCreateThread(userId: string): Promise<Thread> {
  return { id: `mock-thread-${userId}` };
}

/**
 * Add a message to a thread
 */
export async function addMessageToThread(
  threadId: string,
  content: string,
  role: 'user' | 'assistant' = 'user'
): Promise<Message> {
  return {
    id: `mock-message-${Date.now()}`,
    role,
    content
  };
}

/**
 * Run an assistant on a thread
 */
export async function runAssistant(
  assistantId: string,
  threadId: string,
  instructions: string = ''
) {
  return {
    id: `mock-run-${Date.now()}`,
    status: 'completed'
  };
}

/**
 * Wait for a run to complete
 */
export async function waitForRunCompletion(threadId: string, runId: string, maxAttempts = 20) {
  return {
    id: runId,
    status: 'completed'
  };
}

/**
 * Get messages from a thread
 */
export async function getMessages(threadId: string, limit = 20): Promise<Message[]> {
  return [
    {
      id: `mock-assistant-message-${Date.now()}`,
      role: 'assistant',
      content: 'Dette er en demo-versjon av assistenten. I en fullversjon ville dette brukt OpenAI API for å generere svar.'
    }
  ];
}

/**
 * Send a message and get a response
 */
export async function sendMessageAndGetResponse(
  assistantType: 'general' | 'sports' | 'expert',
  threadId: string,
  message: string,
  context: string = ''
): Promise<string> {
  return `Dette er en demo-versjon av assistenten (${assistantType}). I en fullversjon ville dette brukt OpenAI API for å generere svar. Du sendte: ${message}`;
} 