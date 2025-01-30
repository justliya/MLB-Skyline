import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity,Button } from 'react-native';


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
      <TouchableOpacity onPress={onSpeak} style={styles.speakerButton}>
        <Button title="🔊" color="#090848FF" />
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
  speakerButton: {
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
