import React, { createContext, ReactNode, useState } from 'react';
import type { Channel } from 'stream-chat';

// Define types for ChatContext state
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

// Create the ChatContext
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
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Define types for AppContext state
export type AppContextValue = {
  channel: Channel | undefined;
  setChannel: (channel: Channel) => void;
};

// Create the AppContext
export const AppContext = React.createContext<AppContextValue>({
  setChannel: () => {},
  channel: undefined,
});

// AppProvider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [channel, setChannel] = useState<Channel>();

  const contextValue = { channel, setChannel };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

// Hook to use the AppContext
export const useAppContext = () => React.useContext(AppContext);

// Combine both providers
export const CombinedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AppProvider>
      <ChatProvider>{children}</ChatProvider>
    </AppProvider>
  );
};
