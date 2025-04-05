import React, { useState, useEffect, useRef } from 'react';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } catch (e) {
        console.error('Error parsing saved messages:', e);
      }
    } else {
      // Add initial welcome message
      setMessages([
        {
          role: 'assistant',
          content: 'Hei! Jeg er Jim, din turneringsassistent. Hvordan kan jeg hjelpe deg med turneringsplanleggingen i dag?',
          timestamp: new Date()
        }
      ]);
    }
  }, []);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExpanded]);
  
  // Focus input when chat is expanded
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Call API to get assistant response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        let errorMessage = 'Beklager, det oppstod en feil ved behandling av meldingen din.';
        
        // Special handling for API key errors
        if (data.error && data.error.includes('API key')) {
          errorMessage = 'OpenAI API-nøkkel mangler eller er ugyldig. Vennligst sett en gyldig nøkkel i .env.local filen.';
        }
        
        throw new Error(errorMessage);
      }
      
      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content || 'Beklager, jeg kunne ikke generere et svar akkurat nå.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Beklager, det oppstod en feil ved behandling av meldingen din. Prøv igjen senere.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const clearChat = () => {
    if (window.confirm('Er du sikker på at du vil slette alle meldinger?')) {
      setMessages([
        {
          role: 'assistant',
          content: 'Hei! Jeg er Jim, din turneringsassistent. Hvordan kan jeg hjelpe deg med turneringsplanleggingen i dag?',
          timestamp: new Date()
        }
      ]);
    }
  };
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col ${isExpanded ? 'h-[80vh] sm:h-[500px] w-[95vw] sm:w-[400px]' : 'h-14 w-14'} transition-all duration-300 ease-in-out`}>
      {/* Chat toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg ${isExpanded ? 'absolute top-2 right-2 bg-red-500 hover:bg-red-600 z-10' : 'bg-blue-500 hover:bg-blue-600'} transition-colors duration-200`}
        aria-label={isExpanded ? 'Lukk chat' : 'Åpne chat'}
      >
        {isExpanded ? '×' : '💬'}
      </button>
      
      {/* Chat window */}
      <div className={`${isExpanded ? 'flex flex-col h-full w-full rounded-lg bg-white dark:bg-slate-800 shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700' : 'hidden'}`}>
        {/* Chat header */}
        <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
          <h2 className="font-bold">Jim - Turneringsassistent</h2>
          <button 
            onClick={clearChat}
            className="text-white hover:text-blue-100 text-sm"
            aria-label="Tøm chat"
          >
            Tøm chat
          </button>
        </div>
        
        {/* Messages container */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-100 dark:bg-slate-900">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                }`}
              >
                <div className="text-sm mb-1 whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs ${message.role === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'} text-right`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[80%] p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex space-x-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
              placeholder="Skriv en melding..."
              rows={2}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatAssistant; 