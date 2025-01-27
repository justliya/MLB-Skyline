/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react-native/no-inline-styles */
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { Text, SafeAreaView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useChatClient } from './src/hooks/useChatClient';
import { useWatchers } from './UseWatchers.ts';
import { AppProvider, useAppContext } from './src/context/GameContext';
import {
  Chat,
  OverlayProvider,
  ChannelList,
  Channel,
  MessageList,
  MessageInput,
  AITypingIndicatorView,
  MessageType,
} from 'stream-chat-react-native';
import { StreamChat, ChannelSort, Channel as ChannelType } from 'stream-chat';
import { chatUserId, chatApiKey } from './src/config/chatConfig';
import { startAI, stopAI } from './src/AI/RequestApi.ts';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const chatInstance = StreamChat.getInstance(chatApiKey);

const filters = {
  members: {
    $in: [chatUserId],
  },
};

const sort: ChannelSort = { last_updated: -1 };

const chatTheme = {};

type ChannelRoute = { ChannelScreen: undefined };
type ChannelListRoute = { ChannelListScreen: undefined };
type NavigationParamsList = ChannelRoute & ChannelListRoute;

const Stack = createStackNavigator<NavigationParamsList>();

// Channel List Screen
const ChannelListScreen: React.FC<{
  navigation: StackNavigationProp<NavigationParamsList, 'ChannelListScreen'>;
}> = ({ navigation }) => {
  const { setChannel } = useAppContext();

  return (
    <ChannelList
      filters={filters}
      sort={sort}
      onSelect={(channel) => {
        setChannel(channel);
        navigation.navigate('ChannelScreen');
      }}
      ListEmptyComponent={() => <Text style={{ textAlign: 'center' }}>No Channels Available</Text>}
    />
  );
};

// AI Control Button
const ControlAIButton: React.FC<{ channel: ChannelType }> = ({ channel }) => {
  const channelId = channel.id;
  const { watchers, loading } = useWatchers({ channel });
  const [isAIOn, setIsAIOn] = useState(false);

  useEffect(() => {
    if (watchers) {
      setIsAIOn(watchers.some((watcher) => watcher.startsWith('ai-bot')));
    }
  }, [watchers]);

  const onPress = async () => {
    if (!channelId) {
      Alert.alert('Error', 'Channel ID is not available');
      return;
    }

    try {
      if (isAIOn) {
        await stopAI(channelId);
        Alert.alert('AI Stopped', 'AI has been stopped for this channel.');
      } else {
        await startAI(channelId);
        Alert.alert('AI Started', 'AI has been started for this channel.');
      }
      setIsAIOn(!isAIOn);
    } catch (error) {
      Alert.alert('Error', 'Failed to update AI state. Please try again.');
    }
  };

  return watchers && !loading ? (
    <Pressable
      style={{
        padding: 8,
        position: 'absolute',
        top: 18,
        right: 18,
        backgroundColor: '#D8BFD8',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
      }}
      onPress={onPress}
    >
      <Text style={{ fontSize: 16, fontWeight: '500' }}>
        {isAIOn ? 'Stop AI 🪄' : 'Start AI 🪄'}
      </Text>
    </Pressable>
  ) : (
    <ActivityIndicator style={{ margin: 10 }} size="small" color="#000" />
  );
};

// Channel Screen
const ChannelScreen: React.FC<{
  navigation: StackNavigationProp<NavigationParamsList, 'ChannelScreen'>;
}> = () => {
  const { channel } = useAppContext();

  if (!channel) {
    return <Text style={{ textAlign: 'center' }}>No Channel Selected</Text>;
  }

  return (
    <Channel channel={channel}>
      <MessageList />
      <ControlAIButton channel={channel} />
      <AITypingIndicatorView />
      <MessageInput />
    </Channel>
  );
};

// Navigation Stack
const NavigationStack = () => {
  const { clientIsReady } = useChatClient();

  if (!clientIsReady) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading chats...</Text>
      </SafeAreaView>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name="ChannelListScreen" component={ChannelListScreen} />
      <Stack.Screen name="ChannelScreen" component={ChannelScreen} />
    </Stack.Navigator>
  );
};

// Main App Component
export default () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <AppProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
          <OverlayProvider value={{ style: chatTheme }}>
            <Chat
              client={chatInstance}
              isMessageAIGenerated={(message: MessageType) => !!message.ai_generated}
            >
              <NavigationContainer>
                <NavigationStack />
              </NavigationContainer>
            </Chat>
          </OverlayProvider>
          </GestureHandlerRootView>
      </AppProvider>
    </SafeAreaView>
  );
};
