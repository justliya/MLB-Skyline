import React from 'react';
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

interface WinProbabilityChartProps {
  data: ApiData[];
}

const THEME = {
  background: '#FFFFFFFF',
  navy: '#1A2B3C',
  orange: '#FF6B35',
  gray: '#8795A1',
  white: '#FFFFFF',
};

const WinProbabilityChart: React.FC<WinProbabilityChartProps> = ({ data }) => {
  const formattedData = data.map((item, index) => {
    const showLabel = index === 0 || data[index - 1].inning !== item.inning;

    return {
      value: parseFloat(item.win_probability.toFixed(3)), // Fix decimal places
      label: showLabel ? `${item.inning}` : '',
      showXAxisIndex: showLabel,
    };
  });

  console.log("Formatted chart data:", formattedData);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Win Probability</Text>
      <ScrollView horizontal style={styles.chartContainer}>
        <LineChart
          areaChart
          startFillColor="rgba(230, 113, 5, 0.2)" 
          startOpacity1={0.1}
          endFillColor="rgba(230, 113, 5, 0.7)" 
          endOpacity={0.7}
          color={THEME.orange}
          thickness={3}
          data={formattedData}
          width={formattedData.length * 30} // Adjust width to end after the last data point
          height={280}
          initialSpacing={0}
          spacing={5} 
          maxValue={100}
          stepValue={25}
          noOfSections={4}
          yAxisLabelSuffix="%"
          yAxisLabelWidth={15}
          yAxisTextStyle={{ color: THEME.navy }}
          xAxisTextNumberOfLines={2}
          xAxisLabelTextStyle={{ fontSize: 8 }}
          hideDataPoints
          hideRules={false}
          rulesType="solid"
          rulesColor={`${THEME.gray}30`}
          backgroundColor={THEME.background}
          yAxisColor={THEME.gray}
          xAxisColor={THEME.gray}
          textFontSize={12}
          textColor={THEME.navy}
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
            pointerLabelWidth: 70,
            pointerLabelHeight: 35,
            pointerLabelComponent: items => {
              const { value } = items[0];
              return (
                <View
                  style={{
                    width: 70,
                    height: 35,
                    backgroundColor: THEME.navy,
                    padding: 5,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: THEME.navy,
                    marginTop: -20,

                  }}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>{value}%</Text>
                </View>
              );
            },
          }}
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
    marginBottom: 5, // Add margin at the bottom
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
});

export default WinProbabilityChart;