import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface UserInfoProps {
  displayName: string;
  photoURL: string;
}

const UserInfo: React.FC<UserInfoProps> = ({ displayName, photoURL }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: photoURL }} style={styles.photo} />
      <Text style={styles.displayName}>{displayName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    paddingBottom: 25,
  },
  photo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default UserInfo;
