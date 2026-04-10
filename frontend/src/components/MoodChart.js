import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function MoodChart({ data, theme }) {
  // Convert mood strings to numeric values for chart
  const moodToValue = (mood) => {
    if (mood.includes('Happy') || mood.includes('Energetic')) return 5;
    if (mood.includes('Neutral')) return 3;
    if (mood.includes('Sad')) return 2;
    if (mood.includes('Tired')) return 1;
    return 3;
  };

  const chartData = data.slice(-7).reverse(); // Last 7 days
  const labels = chartData.map((_, i) => `Day ${i+1}`);
  const values = chartData.map(entry => moodToValue(entry.mood));

  return (
    <View>
      <LineChart
        data={{
          labels: labels,
          datasets: [{ data: values, strokeWidth: 2 }],
        }}
        width={width - 80}
        height={220}
        chartConfig={{
          backgroundColor: theme.surface,
          backgroundGradientFrom: theme.surface,
          backgroundGradientTo: theme.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => theme.secondary.replace('rgb', 'rgba').replace(')', `, ${opacity})`),
          labelColor: (opacity = 1) => theme.text.replace('rgb', 'rgba').replace(')', `, ${opacity})`),
          style: { borderRadius: 16 },
          propsForDots: { r: '6', strokeWidth: '2', stroke: theme.accent },
        }}
        bezier
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    </View>
  );
}