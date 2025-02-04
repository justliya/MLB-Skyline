import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface KeyPlay {
  play: string;
  win_probability: number;
  probability_change: number;
  explanation: string;
}

interface ApiData {
  play: string;
  play_label: string | null;
  home_team: string;
  inning: string;
  win_probability: number;
  key_play?: KeyPlay;
}

interface WinProbabilityChartProps {
  data: ApiData[];
}

const THEME = {
  background: '#0D1728',
  navy: '#1A2B3C',
  orange: '#FF6B35',
  gray: '#8795A1',
  white: '#FFFFFF',
};

const WinProbabilityChart: React.FC<WinProbabilityChartProps> = ({ data }) => {
  const scrollRef = useRef<ScrollView>(null);

  const formattedData = data.map((item, index) => {
    const showLabel = index === 0 || data[index - 1].inning !== item.inning;

    return {
      value: parseFloat(item.win_probability.toFixed(3)), // Fix decimal places
      label: showLabel ? `${item.inning}` : '',
      showXAxisIndex: showLabel,
      inning: item.inning, // Add inning to data point
    };
  });

  console.log("Formatted chart data:", formattedData);

  const scrollToEnd = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data[0]?.home_team} Win Probability</Text>
      <ScrollView horizontal style={styles.chartContainer} ref={scrollRef}>
        <LineChart
          areaChart
          startFillColor="rgba(255, 107, 53, 0.2)" 
          startOpacity1={0.1}
          endFillColor="rgba(255, 107, 53, 0.7)" 
          endOpacity={0.7}
          color={THEME.orange}
          thickness={3}
          data={formattedData}
          width={formattedData.length * 10} 
          height={135}
          initialSpacing={0}
          spacing={10} 
          maxValue={100}
          stepValue={25}
          noOfSections={4}
          yAxisLabelSuffix="%"
          yAxisLabelWidth={30} 
          yAxisTextStyle={{ color: THEME.white, fontSize: 12 }} 
          xAxisTextNumberOfLines={2}
          xAxisLabelTextStyle={{ fontSize: 10, color: THEME.white }} 
          hideDataPoints
          hideRules={false}
          rulesType="solid"
          rulesColor={`${THEME.gray}30`}
          backgroundColor={THEME.background}
          yAxisColor={THEME.gray}
          xAxisColor={THEME.gray}
          textFontSize={12}
          textColor={THEME.white}
          isAnimated
          animationDuration={1500}
          animateOnDataChange
          pointerConfig={{
            activatePointersOnLongPress: true,
            autoAdjustPointerLabelPosition: false,
            pointerStripColor: THEME.orange,
            pointerStripUptoDataPoint: true,
            pointerColor: THEME.orange,
            radius: 4,
            showPointerStrip: true,
            pointerLabelWidth: 80, // Increased width for better readability
            pointerLabelHeight: 40, // Increased height for better readability
            pointerLabelComponent: items => {
              const { value, inning } = items[0];
              return (
                <View
                  style={{
                    width: 80,
                    height: 40,
                    backgroundColor: THEME.navy,
                    padding: 5,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: THEME.orange,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: THEME.white, textAlign: 'center', fontSize: 14 }}>{value}%</Text>
                  <Text style={{ color: THEME.white, textAlign: 'center', fontSize: 10 }}>{inning}</Text>
                </View>
              );
            },
          }}
        />
      </ScrollView>
      <TouchableOpacity style={styles.scrollButton} onPress={scrollToEnd}>
        <Ionicons name="arrow-forward" size={20} color={THEME.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: THEME.background,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 5, // Add margin at the bottom
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  chartContainer: {
    height: 250, 
    marginBottom: 20,
    paddingBottom: 5, // Add padding at the bottom
  },
  pointerLabel: {
    backgroundColor: THEME.orange,
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  pointerLabelText: {
    color: THEME.white,
    fontWeight: 'bold',
  },
  scrollButton: {
    position: 'absolute',
    bottom: -10,
    right: 10,
    backgroundColor: THEME.orange,
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WinProbabilityChart;
