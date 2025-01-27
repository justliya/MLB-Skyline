import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the structure of a game object
interface Game {
  batteam: string;
  gid: string;
  pitteam: string;
}

// Define the context structure
interface ChatContextType {
  selectedGame: Game | null;
  setSelectedGame: React.Dispatch<React.SetStateAction<Game | null>>;
  chatMode: 'casual' | 'technical';
  setChatMode: React.Dispatch<React.SetStateAction<'casual' | 'technical'>>;
  interval: number;
  setInterval: React.Dispatch<React.SetStateAction<number>>;
}

// Create the ChatContext
const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [chatMode, setChatMode] = useState<'casual' | 'technical'>('casual');
  const [interval, setInterval] = useState<number>(20);

  return (
    <ChatContext.Provider
      value={{
        selectedGame,
        setSelectedGame,
        chatMode,
        setChatMode,
        interval,
        setInterval,
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
