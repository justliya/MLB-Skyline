import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface MessageBoxProps {
  message: string;
  onSpeak: () => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ message, onSpeak }) => {
  return (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>
        {message}
      </Text>
      <TouchableOpacity onPress={onSpeak} style={styles.speakerIcon}>
        <Icon name="volume-up" size={20} color="#090848FF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4E6EB',
    borderRadius: 20,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    position: 'relative',
  },
  speakerIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  messageText: {
    fontSize: 16,
    flex: 1,
  },
});

export default MessageBox;
