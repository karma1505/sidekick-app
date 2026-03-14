import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

export default function ProfileScreen() {
    const { data, updateData, submitOnboarding } = useOnboarding();
    const colors = useThemeColor();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const router = useRouter();

    const cardGradientColors = isDark ? ['#1e1e1e', '#2c2c2c'] as const : ['#F3F4F6', '#E5E7EB'] as const;

    // Local state for form fields
    const [name, setName] = useState(data.name);
    const [age, setAge] = useState(data.age);
    const [gender, setGender] = useState(data.gender);
    const [ft, setFt] = useState(data.heightFt);
    const [inches, setInches] = useState(data.heightIn);
    const [religion, setReligion] = useState(data.religion);
    const [bio, setBio] = useState(data.bio);
    const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl);

    const RELIGIONS = [
        'Agnostic', 'Atheist', 'Buddhist', 'Catholic',
        'Christian', 'Hindu', 'Jewish', 'Muslim',
        'Sikh', 'Spiritual', 'Other', 'Prefer not to say'
    ];

    const handleSave = async () => {
        const updates = {
            name,
            age,
            gender,
            heightFt: ft,
            heightIn: inches,
            religion,
            bio,
            avatarUrl,
        };
        updateData(updates);

        try {
            await submitOnboarding(updates);
        } catch (error) {
            console.error('Failed to save profile to db:', error);
        }

        router.back();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Background Gradient */}
            <LinearGradient
                colors={[colors.tint + '30', colors.background] as const}
                style={styles.backgroundGradient}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol name="chevron.left" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
                    <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                        <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <Animated.Image
                            source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/avatar.png')}
                            style={[styles.largeAvatar, { borderColor: colors.card }]}
                        />
                    </View>

                    {/* Basic Info Card */}
                    <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Core Details</Text>
                    <LinearGradient colors={cardGradientColors} style={[styles.card, { borderColor: colors.border }]}>
                        {/* Name */}
                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#252525' : '#FFF' }]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Your Name"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        {/* Age */}
                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Age</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#252525' : '#FFF' }]}
                                value={age}
                                onChangeText={setAge}
                                keyboardType="number-pad"
                                maxLength={3}
                                placeholder="Age"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        {/* Gender */}
                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Gender</Text>
                            <View style={styles.genderContainer}>
                                {['Male', 'Female', 'Other', 'Prefer not to say'].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.genderOption,
                                            {
                                                borderColor: gender === option ? colors.primary : colors.border,
                                                backgroundColor: gender === option ? colors.primary + '10' : (isDark ? '#252525' : '#FFF'),
                                            },
                                        ]}
                                        onPress={() => setGender(option as any)}
                                    >
                                        <Text style={{ color: gender === option ? colors.primary : colors.text, fontSize: 13, fontWeight: '500' }}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Physical Attributes Card */}
                    <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Physical Attributes</Text>
                    <LinearGradient colors={cardGradientColors} style={[styles.card, { borderColor: colors.border }]}>
                        {/* Height */}
                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Height</Text>
                            <View style={styles.heightContainer}>
                                <View style={styles.heightInputWrapper}>
                                    <TextInput
                                        style={[styles.input, { textAlign: 'center', minWidth: 60, color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#252525' : '#FFF' }]}
                                        value={ft}
                                        onChangeText={setFt}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                    />
                                    <Text style={{ color: colors.textSecondary, marginLeft: Spacing.xs }}>ft</Text>
                                </View>
                                <View style={styles.heightInputWrapper}>
                                    <TextInput
                                        style={[styles.input, { textAlign: 'center', minWidth: 60, color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#252525' : '#FFF' }]}
                                        value={inches}
                                        onChangeText={setInches}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                    />
                                    <Text style={{ color: colors.textSecondary, marginLeft: Spacing.xs }}>in</Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Personal & Bio Card */}
                    <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Personal & Bio</Text>
                    <LinearGradient colors={cardGradientColors} style={[styles.card, { borderColor: colors.border }]}>
                        {/* Religion */}
                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Religion</Text>
                            <View style={styles.chipsContainer}>
                                {RELIGIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.chip,
                                            {
                                                borderColor: religion === option ? colors.primary : colors.border,
                                                backgroundColor: religion === option ? colors.primary + '10' : (isDark ? '#252525' : '#FFF'),
                                            },
                                        ]}
                                        onPress={() => setReligion(option)}
                                    >
                                        <Text style={{ color: religion === option ? colors.primary : colors.text, fontSize: 13, fontWeight: '500' }}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Bio */}
                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Bio & Personal Details</Text>
                            <TextInput
                                style={[styles.input, { height: 120, textAlignVertical: 'top', color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#252525' : '#FFF' }]}
                                value={bio}
                                onChangeText={setBio}
                                multiline
                                numberOfLines={4}
                                placeholder="Tell us about yourself..."
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                    </LinearGradient>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backButton: {
        padding: Spacing.s,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveButton: {
        padding: Spacing.s,
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        padding: Spacing.m,
        gap: Spacing.l,
        paddingBottom: Spacing.xl * 2,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: Spacing.m,
    },
    largeAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        ...Shadows.medium,
    },
    fieldContainer: {
        gap: Spacing.xs,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: Spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderRadius: Spacing.m,
        padding: Spacing.m,
        fontSize: 16,
    },
    genderContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.s,
        marginTop: Spacing.xs,
    },
    genderOption: {
        paddingVertical: Spacing.s,
        paddingHorizontal: Spacing.m,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
    },
    heightContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: Spacing.m,
    },
    heightInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.s,
        marginTop: Spacing.xs,
    },
    chip: {
        paddingVertical: Spacing.s,
        paddingHorizontal: Spacing.m,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 400,
    },
    card: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.l,
        marginBottom: Spacing.m,
        borderWidth: 1,
        ...Shadows.medium,
        gap: Spacing.m,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: Spacing.s,
        marginLeft: Spacing.s,
        textTransform: 'uppercase',
    },
});
