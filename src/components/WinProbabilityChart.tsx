import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

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

interface ChartDataPoint {
  value: number;
  label?: string;
  showXAxisIndex?: boolean;
}

interface WinProbabilityChartProps {
  data: ApiData[];
}

const THEME = {
  background: '#FFFFFFCD',
  navy: '#1A2B3C',
  orange: '#FF6B35',
  gray: '#8795A1',
  white: '#FFFFFF',
};

const WinProbabilityChart: React.FC<WinProbabilityChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map((item, index) => {
        const showLabel = index === 0 || data[index - 1].inning !== item.inning;
        return {
          value: item.win_probability * 100,
          label: showLabel ? `Inning ${item.inning}` : undefined,
          showXAxisIndex: showLabel,
        };
      });
      
      setChartData(formattedData);
      console.log("Chart data updated:", formattedData);
    }
  }, [data]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Win Probability</Text>
      <ScrollView horizontal style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={Math.max(chartData.length * 30, 300)}
          height={290}
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