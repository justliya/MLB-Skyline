import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';

import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

// Types for Messages and Cards
interface Message {
  id: string;
  text: string;
  user: string;
  type: 'chat' | 'trade'; // Differentiates chat vs trade messages
  timestamp: number;
  cardOffer?: string; // Optional card name for trades
  points?: number;    // Points offered for trade
}

// Component
const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [user, setUser] = useState('Player1'); // Replace with dynamic user ID
  const [selectedCard, setSelectedCard] = useState('');
  const [tradeOffer, setTradeOffer] = useState(0);

  // Fetch Messages from Firestore
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        const fetchedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];

        setMessages(fetchedMessages);
      });

    return () => unsubscribe();
  }, []);

  // Send Chat Message
  const sendMessage = async () => {
    if (messageText.trim()) {
      await firestore().collection('messages').add({
        text: messageText,
        user,
        type: 'chat',
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
      setMessageText('');
    }
  };

  // Offer Card for Trade
  const offerCard = async () => {
    if (selectedCard && tradeOffer > 0) {
      await firestore().collection('messages').add({
        text: `${user} offers ${selectedCard} for ${tradeOffer} points!`,
        user,
        type: 'trade',
        timestamp: firestore.FieldValue.serverTimestamp(),
        cardOffer: selectedCard,
        points: tradeOffer,
      });
      setSelectedCard('');
      setTradeOffer(0);
    } else {
      Alert.alert('Select a card and enter points to trade!');
    }
  };

  return (
    <View style={styles.container}>
      {/* Chat Messages */}
      <FlatList
        data={messages}
        inverted
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.type === 'trade' && styles.tradeMessage,
            ]}
          >
            <Text style={styles.messageText}>
              {item.user}: {item.text}
            </Text>
          </View>
        )}
      />

      {/* Chat Input */}
      <TextInput
        style={styles.input}
        value={messageText}
        onChangeText={setMessageText}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={sendMessage} />

      {/* Card Trading Options */}
      <Text style={styles.sectionTitle}>Trade Cards:</Text>
      <TextInput
        style={styles.input}
        placeholder="Card Name"
        value={selectedCard}
        onChangeText={setSelectedCard}
      />
      <TextInput
        style={styles.input}
        placeholder="Offer Points"
        value={tradeOffer.toString()}
        onChangeText={(value) => setTradeOffer(Number(value))}
        keyboardType="numeric"
      />
      <Button title="Offer Card" onPress={offerCard} />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  input: {
    height: 40,
    borderWidth: 1,
    paddingHorizontal: 10,
    marginVertical: 10,
    borderRadius: 8,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
  },
  tradeMessage: { backgroundColor: '#e6f7ff' }, // Highlight trades
  messageText: { fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
});

export default ChatRoom;