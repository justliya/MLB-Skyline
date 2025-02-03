/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import SoundPlayer from 'react-native-sound-player';

interface TextToSpeechProps {
  message: string;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ message }) => {
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  /** Convert text to speech */
  const handleSpeak = async () => {
    setLoading(true);

    try {
      const response = await fetch('https://cloud-speech-114778801742.us-central1.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audio, status: ${response.status} message: ${response.statusText}`);
      }

      const { audioUrl } = await response.json();
      console.log('🔊 Audio URL:', audioUrl);

      // Load & Play the audio
      playAudio(audioUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to process speech.');
      console.error('TTS Error:', error);
    }

    setLoading(false);
  };

  /** Load & Play the generated audio */
  const playAudio = async (audioUrl: string) => {
    try {
      SoundPlayer.loadUrl(audioUrl); // Load the audio
      SoundPlayer.play(); // Play the loaded audio
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert('Playback Error', 'Failed to play the audio.');
    }
  };

  /** Pause Audio */
  const handlePause = () => {
    try {
      SoundPlayer.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Pause Error:', error);
    }
  };

  /** Resume Audio */
  const handleResume = () => {
    try {
      SoundPlayer.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Resume Error:', error);
    }
  };

  /** Stop Audio */
  const handleStop = () => {
    try {
      SoundPlayer.stop();
      setIsPlaying(false);
    } catch (error) {
      console.error('Stop Error:', error);
    }
  };

  return (
    <View>
      {loading ? (
        <ActivityIndicator size="small" color="#FFA500" />
      ) : (
        <TouchableOpacity
          onPress={isPlaying ? handlePause : handleSpeak}
          style={{
            padding: 10,
            backgroundColor: isPlaying ? '#FF4500' : '#FFA500',
            borderRadius: 8,
          }}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
            {isPlaying ? '⏸ Pause' : '🔊 Play'}
          </Text>
        </TouchableOpacity>
      )}

      {isPlaying && (
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <TouchableOpacity
            onPress={handleResume}
            style={{ padding: 10, backgroundColor: '#32CD32', borderRadius: 8, marginRight: 10 }}>
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>▶️ Resume</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleStop}
            style={{ padding: 10, backgroundColor: '#FF3B30', borderRadius: 8 }}>
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>⏹ Stop</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default TextToSpeech;
