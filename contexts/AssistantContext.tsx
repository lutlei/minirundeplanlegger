import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getOrCreateThread, 
  sendMessageAndGetResponse, 
  initializeAssistants, 
  Thread 
} from '@/lib/openai';

type AssistantType = 'general' | 'sports' | 'expert';

interface AssistantContextType {
  assistantType: AssistantType;
  setAssistantType: (type: AssistantType) => void;
  threadId: string | null;
  messages: Array<{ content: string; role: 'user' | 'assistant' }>;
  sendMessage: (message: string) => Promise<string>;
  loading: boolean;
  error: string | null;
}

// Create context with default values
const AssistantContext = createContext<AssistantContextType>({
  assistantType: 'general',
  setAssistantType: () => {},
  threadId: null,
  messages: [],
  sendMessage: async () => '',
  loading: false,
  error: null,
});

interface AssistantProviderProps {
  children: ReactNode;
  initialAssistantType?: AssistantType;
}

export const AssistantProvider: React.FC<AssistantProviderProps> = ({ 
  children, 
  initialAssistantType = 'general' 
}) => {
  const [assistantType, setAssistantType] = useState<AssistantType>(initialAssistantType);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ content: string; role: 'user' | 'assistant' }>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize assistants and create thread
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize assistants
        await initializeAssistants();
        
        // Create a thread for this session
        // In a real app, you'd want to store this in a database and associated with the user
        const thread = await getOrCreateThread('anonymous-user');
        setThreadId(thread.id);
        
        // Add initial greeting message
        const greeting = getGreetingForAssistantType(assistantType);
        setMessages([{ content: greeting, role: 'assistant' }]);
      } catch (err) {
        console.error('Error initializing assistant:', err);
        setError('Failed to initialize assistant. Please try refreshing the page.');
      }
    };
    
    init();
  }, []);
  
  // Create a new thread when assistant type changes
  useEffect(() => {
    const switchAssistant = async () => {
      try {
        setLoading(true);
        const thread = await getOrCreateThread('anonymous-user');
        setThreadId(thread.id);
        
        // Add initial greeting message for the new assistant type
        const greeting = getGreetingForAssistantType(assistantType);
        setMessages([{ content: greeting, role: 'assistant' }]);
      } catch (err) {
        console.error('Error switching assistant:', err);
        setError('Failed to switch assistant. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (threadId) {
      switchAssistant();
    }
  }, [assistantType]);
  
  // Function to send message to the assistant
  const sendMessage = async (message: string): Promise<string> => {
    if (!threadId) {
      throw new Error('Thread not initialized');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Add user message to state
      setMessages(prev => [...prev, { content: message, role: 'user' }]);
      
      // Send message to OpenAI and get response
      const response = await sendMessageAndGetResponse(
        assistantType,
        threadId,
        message
      );
      
      // Add assistant response to state
      setMessages(prev => [...prev, { content: response, role: 'assistant' }]);
      
      return response;
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AssistantContext.Provider
      value={{
        assistantType,
        setAssistantType,
        threadId,
        messages,
        sendMessage,
        loading,
        error,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

// Helper function to get greeting based on assistant type
function getGreetingForAssistantType(type: AssistantType): string {
  switch (type) {
    case 'general':
      return 'Hei! Jeg er Jimini Basic. Hvordan kan jeg hjelpe deg med turneringsapplikasjonen?';
    case 'sports':
      return 'Hei! Jeg er Jimini Sport, spesialisten på miniturneringer. Hvordan kan jeg hjelpe deg i dag?';
    case 'expert':
      return 'Hei! Jeg er Jimini Pro, ekspertassistenten for turneringsarrangører. Hvilken avansert turneringshjelp trenger du?';
    default:
      return 'Hei! Hvordan kan jeg hjelpe deg i dag?';
  }
}

// Custom hook to use the assistant context
export const useAssistant = () => useContext(AssistantContext);

export default AssistantContext; 