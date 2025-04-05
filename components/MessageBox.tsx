import React, { useState, useEffect } from 'react';

interface MessageBoxProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onClose?: () => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className={`message-box ${type} show`}
      role="alert"
    >
      {message}
    </div>
  );
};

// This function creates a container for message boxes and manages their state
export const useMessages = () => {
  const [messages, setMessages] = useState<Array<{ id: number; message: string; type: 'success' | 'error' }>>([]);
  const [nextId, setNextId] = useState(1);

  const showMessage = (message: string, type: 'success' | 'error' = 'success', duration: number = 3000) => {
    const id = nextId;
    setMessages(prev => [...prev, { id, message, type }]);
    setNextId(id + 1);
    
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id));
    }, duration);

    return id;
  };

  const clearMessage = (id: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const MessageContainer = () => (
    <div className="fixed bottom-5 left-0 w-full flex flex-col items-center space-y-2 z-50">
      {messages.map(({ id, message, type }) => (
        <MessageBox 
          key={id} 
          message={message} 
          type={type} 
          onClose={() => clearMessage(id)} 
        />
      ))}
    </div>
  );

  return { showMessage, clearMessage, MessageContainer };
};

export default MessageBox; 