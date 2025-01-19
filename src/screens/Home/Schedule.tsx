import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { ChannelList, Chat, ChannelPreviewMessenger } from 'stream-chat-react-native';
import { useChat } from '../../context/ChatContext';
import axios from 'axios';

const Schedule = () => {
  const { user } = useChat();
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2024&gameType=R');
        const games = response.data.dates.flatMap(date => date.games);
        const newChannels = games.map(game => ({
          id: `game-${game.gamePk}`,
          name: `${game.teams.away.team.name} vs ${game.teams.home.team.name}`,
          members: [user.id, 'skyline'],
          extraData: {
            score: `${game.teams.away.score} - ${game.teams.home.score}`,
            awayLogo: game.teams.away.team.logo,
            homeLogo: game.teams.home.team.logo,
          },
        }));
        setChannels(newChannels);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    fetchGames();
  }, [user]);

  return (
    <Chat client={chatClient}>
      <ChannelList
        filters={{ type: 'messaging', members: { $in: [user.id] } }}
        Preview={props => (
          <ChannelPreviewMessenger
            {...props}
            title={props.channel.data.name}
            subtitle={props.channel.data.extraData.score}
            avatarUrl={props.channel.data.extraData.awayLogo}
            avatarUrl2={props.channel.data.extraData.homeLogo}
            disabled
          />
        )}
      />
    </Chat>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  gameItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  gameText: { fontSize: 16 },
  logo: { width: 50, height: 50, marginRight: 10 },
});

export default Schedule;
