import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
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
  key_play?: KeyPlay;
}

// Define structure for chart data points
interface ChartDataPoint {
  value: number;
  label?: string;
  showXAxisIndex?: boolean;
}

interface WinProbabilityChartProps {
  apiData: ApiData;
}

const THEME = {
  background: '#FFFFFFCD',
  navy: '#1A2B3C',
  orange: '#FF6B35',
  gray: '#8795A1',
  white: '#FFFFFF',
};

const WinProbabilityChart: React.FC<WinProbabilityChartProps> = ({ apiData }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    console.log("Received apiData:", apiData);
    if (apiData) {
      const winProbability = apiData.win_probability * 100;
      console.log("Calculated win probability:", winProbability);
      
      setChartData((prevData) => {
        const updatedData = [...prevData];

        const newDataPoint: ChartDataPoint = {
          value: winProbability
        };
        
        console.log("New data point:", newDataPoint);
        console.log("Previous data:", prevData);

        // Always append new data point to maintain continuous line
        updatedData.push(newDataPoint);
        return updatedData;
      });
    }
  }, [apiData]);

  useEffect(() => {
    console.log("Rendering chart with data:", chartData);
  }, [chartData]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Win Probability</Text>

      {/* Scrollable Chart */}
      <ScrollView horizontal ref={scrollRef} style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={Math.max(chartData.length * 30, 300)} 
          height={290}  // 300 cuts off the x-axis labels atm
          yAxisLabelSuffix="%"
          yAxisLabelWidth={30}
          initialSpacing={30}
          spacing={30}
          maxValue={100}
          hideRules={false}
          hideYAxisText={false}
          isAnimated
          animateOnDataChange
          animationDuration={500}
          showVerticalLines
          verticalLinesColor={`${THEME.gray}20`}
          dataPointsColor={THEME.orange}
          color={THEME.navy}
          thickness={2.5}
          backgroundColor={THEME.background}
          yAxisColor={THEME.gray}
          xAxisColor={THEME.gray}
          yAxisTextStyle={{ color: THEME.navy }}
          rulesType="solid"
          rulesColor={`${THEME.gray}30`}
          textFontSize={12}
          textColor={THEME.navy}
        />
      </ScrollView>
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
    marginBottom: 20, // Add margin at the bottom
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
    height: 350, // Adjusted container height
    marginBottom: 20,
    paddingBottom: 20, // Add padding at the bottom
  },
});

export default WinProbabilityChart;