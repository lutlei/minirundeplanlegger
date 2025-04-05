import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Define types
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
  content: string | Array<{ type: string; text: { value: string } }>;
}

// Cache for assistant IDs
let assistants: Record<string, string> = {};

/**
 * Initialize assistants (create or retrieve existing)
 */
export async function initializeAssistants(): Promise<Record<string, string>> {
  if (Object.keys(assistants).length > 0) {
    return assistants;
  }
  
  try {
    // List existing assistants
    const existingAssistants = await openai.beta.assistants.list({
      limit: 10,
    });
    
    // Check if our assistants already exist
    const generalAssistant = existingAssistants.data.find(a => a.name === 'Jimini Basic');
    const sportsAssistant = existingAssistants.data.find(a => a.name === 'Jimini Sport');
    const expertAssistant = existingAssistants.data.find(a => a.name === 'Jimini Pro');
    
    // Store existing assistant IDs
    if (generalAssistant) assistants.general = generalAssistant.id;
    if (sportsAssistant) assistants.sports = sportsAssistant.id;
    if (expertAssistant) assistants.expert = expertAssistant.id;
    
    // Create missing assistants
    if (!generalAssistant) {
      const newAssistant = await createGeneralAssistant();
      assistants.general = newAssistant.id;
    }
    
    if (!sportsAssistant) {
      const newAssistant = await createSportsAssistant();
      assistants.sports = newAssistant.id;
    }
    
    if (!expertAssistant) {
      const newAssistant = await createExpertAssistant();
      assistants.expert = newAssistant.id;
    }
    
    return assistants;
  } catch (error) {
    console.error('Error initializing assistants:', error);
    throw error;
  }
}

/**
 * Create the general assistant
 */
async function createGeneralAssistant() {
  return await openai.beta.assistants.create({
    name: 'Jimini Basic',
    instructions: `You are Jimini Basic, a helpful assistant for the Jimini tournament management application.
    Help users understand how to use the platform and answer general questions about mini tournaments.
    You should be friendly, concise, and helpful.
    
    The application has the following main features:
    1. Team registration for mini tournaments
    2. Tournament settings configuration for organizers
    3. Automatic schedule generation
    4. Visualization of the tournament schedule
    
    If users ask questions that require specialized knowledge about sports rules or detailed tournament organization, 
    let them know they can use Jimini Sport for specialized assistance.`,
    model: 'gpt-4-turbo',
    tools: [{ type: 'code_interpreter' }],
  });
}

/**
 * Create the sports specialist assistant
 */
async function createSportsAssistant() {
  return await openai.beta.assistants.create({
    name: 'Jimini Sport',
    instructions: `You are Jimini Sport, a specialist in mini-tournaments and sports organization.
    Provide detailed advice on tournament setup, rules, and best practices for mini tournaments.
    You have specialized knowledge about different sports categories, tournament formats, and scheduling strategies.
    
    You can answer questions about:
    1. Tournament rules for different age categories
    2. Best practices for organizing mini tournaments
    3. How to structure pools and matches
    4. Scheduling strategies for efficient tournament flow
    5. Common issues and their solutions in tournament organization
    
    Be authoritative but friendly in your responses. Provide practical, actionable advice based on 
    sports organization best practices.`,
    model: 'gpt-4-turbo',
    tools: [
      { type: 'code_interpreter' },
      { type: 'retrieval' }
    ],
  });
}

/**
 * Create the expert assistant for tournament organizers
 */
async function createExpertAssistant() {
  return await openai.beta.assistants.create({
    name: 'Jimini Pro',
    instructions: `You are Jimini Pro, an expert assistant for tournament organizers.
    You have access to internal documentation and can provide detailed guidance on 
    complex tournament management tasks.
    
    You can assist with:
    1. Advanced scheduling algorithms and optimization
    2. Handling special cases and exceptions in tournament organization
    3. Integration with other systems and data export/import
    4. Administrative tasks and permissions
    5. Historical data analysis and insights
    
    You should provide detailed, technical responses aimed at tournament administrators
    and power users. Reference internal documentation where appropriate.`,
    model: 'gpt-4-turbo',
    tools: [
      { type: 'code_interpreter' },
      { type: 'retrieval' },
      { type: 'function' }
    ],
  });
}

/**
 * Get or create a thread for the user
 */
export async function getOrCreateThread(userId: string): Promise<Thread> {
  // In a real application, we would store and retrieve thread IDs from a database
  // For now, we'll create a new thread each time
  try {
    const thread = await openai.beta.threads.create();
    return thread;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
}

/**
 * Add a message to a thread
 */
export async function addMessageToThread(
  threadId: string,
  content: string,
  role: 'user' | 'assistant' = 'user'
): Promise<Message> {
  try {
    const message = await openai.beta.threads.messages.create(threadId, {
      role,
      content,
    });
    return message as unknown as Message;
  } catch (error) {
    console.error('Error adding message to thread:', error);
    throw error;
  }
}

/**
 * Run an assistant on a thread
 */
export async function runAssistant(
  assistantId: string,
  threadId: string,
  instructions: string = ''
) {
  try {
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
      instructions,
    });
    return run;
  } catch (error) {
    console.error('Error running assistant:', error);
    throw error;
  }
}

/**
 * Wait for a run to complete
 */
export async function waitForRunCompletion(threadId: string, runId: string, maxAttempts = 20) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    
    if (run.status === 'completed') {
      return run;
    }
    
    if (run.status === 'failed' || run.status === 'cancelled' || run.status === 'expired') {
      throw new Error(`Run ended with status: ${run.status}`);
    }
    
    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts += 1;
  }
  
  throw new Error('Run timed out');
}

/**
 * Get messages from a thread
 */
export async function getMessages(threadId: string, limit = 20): Promise<Message[]> {
  try {
    const response = await openai.beta.threads.messages.list(threadId, {
      limit,
      order: 'desc',
    });
    
    return response.data.map(message => ({
      id: message.id,
      role: message.role as 'user' | 'assistant',
      content: message.content,
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

/**
 * Send a message to an assistant and get the response
 */
export async function sendMessageAndGetResponse(
  assistantType: 'general' | 'sports' | 'expert',
  threadId: string,
  message: string,
  context: string = ''
): Promise<string> {
  try {
    // Initialize assistants if needed
    if (Object.keys(assistants).length === 0) {
      await initializeAssistants();
    }
    
    const assistantId = assistants[assistantType];
    if (!assistantId) {
      throw new Error(`Assistant type '${assistantType}' not found`);
    }
    
    // Add the user message to the thread
    await addMessageToThread(threadId, message);
    
    // Run the assistant
    const run = await runAssistant(assistantId, threadId, context);
    
    // Wait for the run to complete
    await waitForRunCompletion(threadId, run.id);
    
    // Get the latest messages
    const messages = await getMessages(threadId, 1);
    
    // Get the assistant's response
    const assistantMessage = messages.find(msg => msg.role === 'assistant');
    
    if (!assistantMessage) {
      throw new Error('No assistant response found');
    }
    
    // Handle different content formats
    if (typeof assistantMessage.content === 'string') {
      return assistantMessage.content;
    } else {
      // Handle array of content parts
      const textParts = assistantMessage.content
        .filter(part => part.type === 'text')
        .map(part => (part as any).text.value);
      
      return textParts.join('\n');
    }
  } catch (error) {
    console.error('Error in sendMessageAndGetResponse:', error);
    throw error;
  }
} 