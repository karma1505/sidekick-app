import { Colors, Spacing } from '@/constants/theme';
import { TextSize, useTheme } from '@/context/ThemeContext';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const THUMB_SIZE = 24;
const DOT_SIZE = 12;
const TRACK_HEIGHT = 2;

export default function TextSizeSlider() {
    const { textSize, setTextSize } = useTheme();
    const width = useSharedValue(0);
    const translateX = useSharedValue(0);
    const context = useSharedValue({ startX: 0 });

    const sizeToIndex = (size: TextSize) => {
        switch (size) {
            case 'small': return 0;
            case 'medium': return 1;
            case 'large': return 2;
        }
    };

    const indexToSize = (index: number): TextSize => {
        if (index <= 0.5) return 'small';
        if (index <= 1.5) return 'medium';
        return 'large';
    };

    const updatePosition = (size: TextSize, animate = true) => {
        const index = sizeToIndex(size);
        if (width.value > 0) {
            const maxTranslate = width.value - THUMB_SIZE;
            const step = maxTranslate / 2;
            const targetX = index * step;
            if (animate) {
                translateX.value = withSpring(targetX, { damping: 20 });
            } else {
                translateX.value = targetX;
            }
        }
    }

    useEffect(() => {
        updatePosition(textSize);
    }, [textSize]);

    const pan = Gesture.Pan()
        .onStart(() => {
            context.value = { startX: translateX.value };
        })
        .onUpdate((event) => {
            const maxTranslate = width.value - THUMB_SIZE;
            let nextX = context.value.startX + event.translationX;

            if (nextX < 0) nextX = 0;
            if (nextX > maxTranslate) nextX = maxTranslate;

            translateX.value = nextX;
        })
        .onEnd(() => {
            const maxTranslate = width.value - THUMB_SIZE;
            const step = maxTranslate / 2;

            // Calculate nearest snap point
            const approximateIndex = Math.round(translateX.value / step);
            const finalX = approximateIndex * step;

            translateX.value = withSpring(finalX, { damping: 20 });

            const newSize = indexToSize(approximateIndex);
            if (newSize !== textSize) {
                runOnJS(setTextSize)(newSize);
            }
        });

    const rThumbStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <View style={styles.container}>
            <GestureDetector gesture={pan}>
                <Animated.View
                    style={styles.contentContainer}
                    onLayout={(e) => {
                        const layoutWidth = e.nativeEvent.layout.width;
                        width.value = layoutWidth;
                        // Set initial position without animation on layout
                        updatePosition(textSize, false);
                    }}
                >
                    {/* Track Line */}
                    <View style={styles.track} />

                    {/* Dots */}
                    <View style={styles.dotsContainer}>
                        {['small', 'medium', 'large'].map((size, index) => (
                            <View key={size} style={styles.dotWrapper}>
                                <View style={styles.dot} />
                                <Text style={[styles.label, { fontSize: index === 0 ? 14 : index === 1 ? 16 : 20, fontWeight: index === sizeToIndex(textSize) ? 'bold' : '600', color: index === sizeToIndex(textSize) ? Colors.light.primary : Colors.light.textSecondary }]}>
                                    A
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Draggable Thumb */}
                    <Animated.View style={[styles.thumb, rThumbStyle]} />
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.s,
    },
    contentContainer: {
        height: 60,
        justifyContent: 'center',
        // Ensure this captures touches
        backgroundColor: 'transparent',
    },
    track: {
        height: TRACK_HEIGHT,
        backgroundColor: Colors.light.border,
        width: '100%',
        position: 'absolute',
        top: 29, // Adjusted to align vertically based on dot centers (60/2 - 1)
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        position: 'absolute',
        top: 24, // dot wrapper top (60/2 - 24/2)
    },
    dotWrapper: {
        alignItems: 'center',
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        justifyContent: 'center',
    },
    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: Colors.light.border,
        zIndex: 1,
    },
    label: {
        position: 'absolute',
        top: 28, // Below dot wrapper
        textAlign: 'center',
        width: 60,
        left: -18, // Center relative to wrapper (24 - 60)/2 = -18
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: Colors.light.primary,
        position: 'absolute',
        top: 24, // Align with dot wrappers
        left: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 10,
    },
});
