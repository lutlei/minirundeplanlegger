import { NextResponse } from 'next/server';
import { 
  initializeAssistants, 
  getOrCreateThread, 
  sendMessageAndGetResponse 
} from '@/lib/openai';

// Initialize assistants when the API is first loaded
initializeAssistants().catch(error => {
  console.error('Failed to initialize assistants:', error);
});

// POST /api/assistants
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, assistantType = 'general', threadId, userId = 'anonymous' } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' }, 
        { status: 400 }
      );
    }
    
    // Validate assistant type
    if (!['general', 'sports', 'expert'].includes(assistantType)) {
      return NextResponse.json(
        { error: 'Invalid assistant type' },
        { status: 400 }
      );
    }
    
    // Get or create thread
    let currentThreadId = threadId;
    if (!currentThreadId) {
      const thread = await getOrCreateThread(userId);
      currentThreadId = thread.id;
    }
    
    // Send message and get response
    const response = await sendMessageAndGetResponse(
      assistantType as 'general' | 'sports' | 'expert',
      currentThreadId,
      message
    );
    
    return NextResponse.json({
      response,
      threadId: currentThreadId
    });
  } catch (error: any) {
    console.error('Error in assistant API:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

// GET /api/assistants
export async function GET() {
  try {
    // Initialize assistants if needed
    const assistants = await initializeAssistants();
    
    return NextResponse.json({
      assistants: Object.keys(assistants).map(type => ({
        type,
        id: assistants[type]
      }))
    });
  } catch (error: any) {
    console.error('Error getting assistants:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while retrieving assistants' },
      { status: 500 }
    );
  }
} 