import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Animated, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

// Define API response type
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
  key_plays?: KeyPlay[];
}

// Define structure for chart data points
interface ChartDataPoint {
  value: number;
  inning: number;
}

interface WinProbabilityChartProps {
  apiData: ApiData;
}

const THEME = {
  background: '#FFFFFFCD',
  navy: '#1A2B3C',
  orange: '#FF6B35',
  lightOrange: '#FF8B5E',
  gray: '#8795A1',
  lightGray: '#CBD2D9',
  white: '#FFFFFF',
};

const WinProbabilityChart: React.FC<WinProbabilityChartProps> = ({ apiData }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [keyPlays, setKeyPlays] = useState<KeyPlay[]>([]);
  const [selectedKeyPlay, setSelectedKeyPlay] = useState<KeyPlay | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log("Received apiData:", apiData);
    if (apiData) {
      const inning = Number(apiData.inning);
      if (!inning || inning < 1 || inning > 9) return;

      setChartData((prevData) => {
        const updatedData = [...prevData];

        // Ensure only unique inning labels
        const existingIndex = updatedData.findIndex((d) => d.inning === inning);
        if (existingIndex !== -1) {
          updatedData[existingIndex] = { value: apiData.win_probability * 100, inning };
        } else {
          updatedData.push({ value: apiData.win_probability * 100, inning });
        }

        // Sort by inning for proper display
        return updatedData.sort((a, b) => a.inning - b.inning);
      });

      // Update key plays
      if (apiData.key_plays?.length) {
        setKeyPlays(apiData.key_plays);
      }

      // Animate transition
      Animated.timing(animation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [apiData]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Win Probability</Text>

      {/* Scrollable Chart */}
      <ScrollView horizontal ref={scrollRef} style={styles.chartContainer}>
        <LineChart
          data={chartData.map(({ value, inning }) => ({ value, label: inning.toString() }))}
          width={Math.max(chartData.length * 80, 400)} // Increased width per data point and minimum width
          height={250} // Increased height
          yAxisLabel="%"
          yAxisLabelWidth={40}
          initialSpacing={20}
          spacing={70} // Increased spacing between points
          hideRules={false}
          hideYAxisText={false}
          isAnimated
          animationDuration={500}
          curved
          showVerticalLines
          verticalLinesColor={`${THEME.gray}20`}
          dataPointsColor={THEME.navy}
          color={THEME.navy}
          backgroundColor={THEME.background}
          yAxisColor={THEME.gray}
          xAxisColor={THEME.gray}
          yAxisTextStyle={{ color: THEME.navy }}
          xAxisTextStyle={{ color: THEME.navy }}
          rulesType="solid"
          rulesColor={`${THEME.gray}30`}
          onDataPointClick={(dataPoint, index) => {
            const keyPlay = keyPlays.find((kp) => kp.win_probability * 100 === dataPoint.value);
            if (keyPlay) {
              setSelectedKeyPlay(keyPlay);
            }
          }}
          customDataPoint={(index) => {
            const keyPlay = keyPlays.find((kp) => kp.win_probability * 100 === chartData[index]?.value);
            return keyPlay ? <View style={styles.keyPlayMarker} /> : null;
          }}
        />
      </ScrollView>

      {/* Key Play Details Section */}
      {selectedKeyPlay && (
        <View style={styles.keyPlayContainer}>
          <Text style={styles.keyPlayTitle}>Key Play Impact</Text>
          <View style={styles.keyPlayContent}>
            <View style={styles.keyPlayRow}>
              <Text style={styles.keyPlayLabel}>Play:</Text>
              <Text style={styles.keyPlayValue}>{selectedKeyPlay.play}</Text>
            </View>
            <View style={styles.keyPlayRow}>
              <Text style={styles.keyPlayLabel}>Win Probability Change:</Text>
              <Text style={[
                styles.keyPlayValue,
                selectedKeyPlay.probability_change > 0 ? styles.positiveChange : styles.negativeChange
              ]}>
                {selectedKeyPlay.probability_change.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.keyPlayRow}>
              <Text style={styles.keyPlayLabel}>Explanation:</Text>
              <Text style={styles.keyPlayValue}>{selectedKeyPlay.explanation}</Text>
            </View>
          </View>
        </View>
      )}
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
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    color: THEME.navy,
    letterSpacing: 0.5,
  },
  chartContainer: {
    height: 300, // Increased height for container
    marginBottom: 15,
  },
  keyPlayMarker: {
    width: 12,
    height: 12,
    backgroundColor: THEME.orange,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: THEME.white,
    shadowColor: THEME.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  keyPlayContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: `${THEME.navy}90`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${THEME.gray}30`,
  },
  keyPlayTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: THEME.white,
    textAlign: 'center',
  },
  keyPlayContent: {
    gap: 10,
  },
  keyPlayRow: {
    marginBottom: 8,
  },
  keyPlayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.gray,
    marginBottom: 4,
  },
  keyPlayValue: {
    fontSize: 15,
    color: THEME.white,
    lineHeight: 20,
  },
  positiveChange: {
    color: THEME.orange,
    fontWeight: '600',
  },
  negativeChange: {
    color: '#FF4D4D',
    fontWeight: '600',
  },
});

export default WinProbabilityChart;