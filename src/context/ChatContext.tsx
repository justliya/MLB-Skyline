import React, { createContext, useContext, useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { useNavigation } from '@react-navigation/native';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

const ChatContext = createContext(null);

const chatClient = StreamChat.getInstance('YOUR_STREAM_API_KEY');

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });

    const initializeSkylineUser = async () => {
      const existingUser = await chatClient.queryUsers({ id: 'skyline' });
      if (existingUser.users.length === 0) {
        await chatClient.upsertUser({
          id: 'skyline',
          name: 'Skyline',
        });
      }
    };

    initializeSkylineUser();
  }, []);

  const loginUser = async (userData) => {
    const { id, name, email } = userData;
    const existingUser = await chatClient.queryUsers({ id });
    if (existingUser.users.length === 0) {
      await chatClient.upsertUser({
        id,
        name,
        email,
      });
    }
    await chatClient.connectUser({ id, name, email }, chatClient.devToken(id));
    setUser(userData);
  };

  const logoutUser = async () => {
    await chatClient.disconnectUser();
    setUser(null);
    navigation.navigate('Login');
  };

  return (
    <ChatContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
