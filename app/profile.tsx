import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { data, updateData } = useOnboarding();
    const colors = useThemeColor();
    const router = useRouter();

    // Local state for form fields
    const [name, setName] = useState(data.name);
    const [age, setAge] = useState(data.age);
    const [gender, setGender] = useState(data.gender);
    const [ft, setFt] = useState(data.heightFt);
    const [inches, setInches] = useState(data.heightIn);
    const [religion, setReligion] = useState(data.religion);
    const [bio, setBio] = useState(data.bio);

    const RELIGIONS = [
        'Agnostic', 'Atheist', 'Buddhist', 'Catholic',
        'Christian', 'Hindu', 'Jewish', 'Muslim',
        'Sikh', 'Spiritual', 'Other', 'Prefer not to say'
    ];

    const handleSave = () => {
        updateData({
            name,
            age,
            gender,
            heightFt: ft,
            heightIn: inches,
            religion,
            bio,
        });
        router.back();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol name="chevron.left" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
                    <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                        <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* Name */}
                    <View style={styles.fieldContainer}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
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
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
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
                            {['Male', 'Female', 'Other'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.genderOption,
                                        {
                                            borderColor: gender === option ? colors.primary : colors.border,
                                            backgroundColor: gender === option ? colors.primary + '10' : 'transparent',
                                        },
                                    ]}
                                    onPress={() => setGender(option as any)}
                                >
                                    <Text style={{ color: gender === option ? colors.primary : colors.text }}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Height */}
                    <View style={styles.fieldContainer}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Height</Text>
                        <View style={styles.heightContainer}>
                            <View style={styles.heightInputWrapper}>
                                <TextInput
                                    style={[styles.input, { textAlign: 'center', color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                                    value={ft}
                                    onChangeText={setFt}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                />
                                <Text style={{ color: colors.textSecondary, marginLeft: Spacing.xs }}>ft</Text>
                            </View>
                            <View style={styles.heightInputWrapper}>
                                <TextInput
                                    style={[styles.input, { textAlign: 'center', color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                                    value={inches}
                                    onChangeText={setInches}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                />
                                <Text style={{ color: colors.textSecondary, marginLeft: Spacing.xs }}>in</Text>
                            </View>
                        </View>
                    </View>

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
                                            backgroundColor: religion === option ? colors.primary + '10' : 'transparent',
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
                            style={[styles.input, { height: 120, textAlignVertical: 'top', color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={4}
                            placeholder="Tell us about yourself..."
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

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
        borderBottomColor: '#ccc',
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
        gap: Spacing.m,
    },
    genderOption: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.m,
        borderRadius: Spacing.m,
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
});
