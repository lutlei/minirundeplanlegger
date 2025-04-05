import React, { useState, useRef, useEffect } from 'react';
import { useAssistant } from '@/contexts/AssistantContext';

// Types for component props
interface ChatInterfaceProps {
  className?: string;
  inputPlaceholder?: string;
  sendButtonText?: string;
  expanded?: boolean;
}

export default function ChatInterface({
  className = '',
  inputPlaceholder = 'Still et spørsmål...',
  sendButtonText = 'Send',
  expanded = false,
}: ChatInterfaceProps) {
  // Get assistant context
  const {
    messages,
    sendMessage,
    loading,
    error,
    assistantType,
    setAssistantType,
  } = useAssistant();

  // Local state
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(expanded);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    try {
      setInput('');
      await sendMessage(input);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Handle pressing Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle chat open/closed
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Render chat messages
  const renderMessages = () => {
    return messages.map((msg, index) => (
      <div 
        key={index} 
        className={`chat-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
      >
        {msg.content}
      </div>
    ));
  };

  // Render assistant type selector
  const renderAssistantSelector = () => {
    return (
      <div className="flex justify-center mt-2 mb-4 space-x-2">
        <AssistantButton 
          type="general" 
          currentType={assistantType} 
          onClick={() => setAssistantType('general')}
          label="Jimini Basic"
        />
        <AssistantButton 
          type="sports" 
          currentType={assistantType} 
          onClick={() => setAssistantType('sports')}
          label="Jimini Sport"
        />
        <AssistantButton 
          type="expert" 
          currentType={assistantType} 
          onClick={() => setAssistantType('expert')}
          label="Jimini Pro"
        />
      </div>
    );
  };

  // If the chat is expanded (full view), render full interface
  if (expanded) {
    return (
      <div className={`flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-lg ${className}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-primary-dark dark:text-primary">
            Jimini Assistent
          </h3>
          {renderAssistantSelector()}
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {renderMessages()}
          {loading && (
            <div className="assistant-message">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          {error && <div className="text-red-500 mt-2">{error}</div>}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={inputPlaceholder}
              className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:bg-gray-700 dark:text-white"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendButtonText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render floating chat interface for non-expanded mode
  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-primary hover:bg-primary-dark text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark dark:focus:ring-offset-slate-900 z-30 transition-transform hover:scale-110"
        aria-label="Chat with Jimini"
      >
        <span className="text-2xl">💬</span>
      </button>
      
      {/* Chat modal */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-out"
            onClick={toggleChat}
          />
          
          {/* Chat window */}
          <div className="fixed bottom-20 right-6 w-full max-w-sm max-h-[70vh] bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 z-50 flex flex-col transform transition-all duration-300 ease-out">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-600">
              <h3 className="text-lg font-semibold text-primary-dark dark:text-primary flex items-center">
                Jimini Assistent
              </h3>
              <button 
                onClick={toggleChat}
                className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
            
            {renderAssistantSelector()}
            
            <div className="flex-1 overflow-y-auto py-3 space-y-4 max-h-[30vh]">
              {renderMessages()}
              {loading && (
                <div className="assistant-message">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              {error && <div className="text-red-500 mt-2">{error}</div>}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-600">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={inputPlaceholder}
                className="flex-grow p-2 border border-slate-300 dark:border-slate-500 rounded-md focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light dark:bg-slate-700 dark:text-white"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendButtonText}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Helper component for assistant selection buttons
interface AssistantButtonProps {
  type: 'general' | 'sports' | 'expert';
  currentType: string;
  onClick: () => void;
  label: string;
}

function AssistantButton({ type, currentType, onClick, label }: AssistantButtonProps) {
  const isActive = type === currentType;
  
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded-md transition-colors ${
        isActive 
          ? 'bg-primary text-white font-medium'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
} 