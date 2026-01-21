import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

interface HistoryChartProps {
    data: number[]; // Array of numerical values (e.g., scores, bpm, etc.)
    color?: string;
    gradientColor?: string;
    label?: string;
}

export default function HistoryChart({
    data,
    color = '#1de9b6',
    gradientColor = '#1de9b6',
    label
}: HistoryChartProps) {

    if (!data || data.length === 0) {
        return (
            <View className="h-40 items-center justify-center bg-bg-card rounded-2xl">
                <Text className="text-text-tertiary">No data available</Text>
            </View>
        );
    }

    // Transform simple number array to object array expected by gifted-charts
    const chartData = data.map((value) => ({ value }));
    const screenWidth = Dimensions.get('window').width;

    return (
        <View className="bg-bg-card rounded-2xl p-4 shadow-sm w-full my-4">
            {label && (
                <Text className="text-sm font-semibold text-text-secondary mb-4 ml-2">
                    {label.toUpperCase()}
                </Text>
            )}
            <View style={{ overflow: 'hidden' }}>
                <LineChart
                    data={chartData}
                    areaChart
                    curved
                    isAnimated
                    animationDuration={1200}
                    color={color}
                    startFillColor={gradientColor}
                    startOpacity={0.2}
                    endFillColor={gradientColor}
                    endOpacity={0.05}
                    thickness={3}
                    hideDataPoints
                    adjustToWidth

                    // Axes styling
                    xAxisColor="transparent"
                    yAxisColor="transparent"
                    yAxisTextStyle={{ color: '#8E8E93', fontSize: 10 }}
                    rulesColor="rgba(255,255,255,0.05)"
                    hideRules

                    // Dimensions (Adjust width slightly for padding)
                    width={screenWidth - 80}
                    height={160}

                    // Pointer config for interaction
                    pointerConfig={{
                        pointerStripHeight: 160,
                        pointerStripColor: color,
                        pointerStripWidth: 2,
                        pointerColor: color,
                        radius: 6,
                        pointerLabelWidth: 100,
                        pointerLabelHeight: 90,
                        activatePointersOnLongPress: false,
                        autoAdjustPointerLabelPosition: true,
                        // pointerLabelComponent: (items: any) => {
                        //     return (
                        //         <View className="bg-bg-surface p-2 rounded-lg">
                        //             <Text className="text-text-primary font-bold">{items[0].value}</Text>
                        //         </View>
                        //     );
                        // },
                    }}
                />
            </View>
        </View>
    );
}
