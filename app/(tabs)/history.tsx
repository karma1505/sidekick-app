import { Colors, Spacing } from '@/constants/theme';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HistoryItem {
    id: string;
    name: string;
    messagePreview: string;
    timestamp: string;
    unread?: boolean;
}

const MOCK_HISTORY: HistoryItem[] = [
    {
        id: '1',
        name: 'Sarah',
        messagePreview: "Wow, that's genuinely impressive! Has anyone ever told you that you have a great...",
        timestamp: '2m ago',
        unread: true,
    },
    {
        id: '2',
        name: 'Mike',
        messagePreview: "Okay, I have to admit, that's one way to break the ice! 🧊🔨 But seriously...",
        timestamp: '1h ago',
    },
    {
        id: '3',
        name: 'Jessica',
        messagePreview: "Listen, I'm not usually one to make the first move, but your profile really caught my...",
        timestamp: '1d ago',
    },
    {
        id: '4',
        name: 'David',
        messagePreview: "Hey! Saw you're into hiking. Have you been to that new trail up north? It looks...",
        timestamp: '2d ago',
    },
    {
        id: '5',
        name: 'Emma',
        messagePreview: "Your perspective on that book is really interesting. I've always thought the protagonist was...",
        timestamp: '3d ago',
    },
];

export default function HistoryScreen() {

    const renderItem = ({ item }: { item: HistoryItem }) => {
        const initials = item.name.charAt(0).toUpperCase();

        return (
            <TouchableOpacity style={styles.chatItem} activeOpacity={0.7}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.chatContent}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.timestamp}>{item.timestamp}</Text>
                    </View>
                    <Text style={[styles.messagePreview, item.unread && styles.unreadMessage]} numberOfLines={1}>
                        {item.messagePreview}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>History</Text>
            </View>
            <FlatList
                data={MOCK_HISTORY}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        paddingHorizontal: Spacing.m,
        marginBottom: Spacing.s,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    listContent: {
        paddingBottom: Spacing.xl,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.m,
        paddingHorizontal: Spacing.m,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.light.border,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.m,
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    chatContent: {
        flex: 1,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
    },
    timestamp: {
        fontSize: 12,
        color: Colors.light.textSecondary,
    },
    messagePreview: {
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
    unreadMessage: {
        fontWeight: '600',
        color: Colors.light.text,
    },
});
