// src/context/ChatContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';


// Define types for the context state
interface ChatContextType {
  selectedGame: Game | null;
  setSelectedGame: React.Dispatch<React.SetStateAction<Game | null>>;
  chatMode: 'casual' | 'technical';
  setChatMode: React.Dispatch<React.SetStateAction<'casual' | 'technical'>>;
  interval: number;
  setInterval: React.Dispatch<React.SetStateAction<number>>;
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
}

// Define the structure of a game object
interface Game {
  batteam: string;
  gid: string;
  pitteam: string;
}

// Define props for the ChatProvider component
interface ChatProviderProps {
  children: ReactNode;
}

// Create the context
const ChatContext = createContext<ChatContextType | null>(null);

// ChatProvider component
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [chatMode, setChatMode] = useState<'casual' | 'technical'>('casual');
  const [interval, setInterval] = useState<number>(20);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  return (
    <ChatContext.Provider
      value={{
        selectedGame,
        setSelectedGame,
        chatMode,
        setChatMode,
        interval,
        setInterval,
        isPaused,
        setIsPaused,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Hook to use the ChatContext
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
