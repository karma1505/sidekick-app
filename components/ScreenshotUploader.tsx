import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ScreenshotUploaderProps {
    onImageSelected: (uri: string) => void;
    selectedImage: string | null;
}

export default function ScreenshotUploader({ onImageSelected, selectedImage }: ScreenshotUploaderProps) {
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            onImageSelected(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={pickImage}
                activeOpacity={0.8}
                style={styles.uploadAreaContainer}
            >
                {selectedImage ? (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: selectedImage }} style={styles.image} resizeMode="contain" />
                        <View style={styles.editOverlay}>
                            <Text style={styles.editText}>Change Screenshot</Text>
                        </View>
                    </View>
                ) : (
                    <LinearGradient
                        colors={['#F3F4F6', '#E5E7EB']}
                        style={styles.placeholder}
                    >
                        <View style={styles.iconCircle}>
                            <Feather name="upload" size={32} color={Colors.light.secondary} />
                        </View>
                        <Text style={styles.ctaTitle}>Upload Conversation</Text>
                        <Text style={styles.ctaSubtitle}>Select a screenshot to analyze</Text>
                    </LinearGradient>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: Spacing.m,
        width: '100%',
        alignItems: 'center',
    },
    uploadAreaContainer: {
        width: '100%',
        aspectRatio: 3 / 4, // Typical phone screenshot aspect ratio
        maxHeight: 400,
        borderRadius: BorderRadius.xl + 8,
        backgroundColor: '#fff',
        ...Shadows.medium,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#000',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    editOverlay: {
        position: 'absolute',
        bottom: Spacing.m,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        borderRadius: BorderRadius.circle,
    },
    editText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.xl + 8,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.m,
        ...Shadows.soft,
    },
    ctaTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 4,
        textAlign: 'center',
    },
    ctaSubtitle: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
});
