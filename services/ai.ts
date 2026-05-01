import { uploadScreenshot, uploadScreenshots, supabase } from './supabase';

export interface GeneratedResponse {
    responses: string[];
}

// Ensure you match the session interface returned by your Python backend
interface ParsedChatMessage {
    message_id: string;
    order: number;
    sender: string;
    text: string;
    timestamp: string;
    is_me: boolean;
}

interface ParsedChatSession {
    messages: ParsedChatMessage[];
}

export const generateResponses = async (
    imageUris: string[],
    tone: string,
    isPro: boolean,
    isUltra: boolean,
    mode: 'chat' | 'prompts' = 'chat',
    mission?: string,
    userGoal?: string | null,
    targetGoal?: string | null
): Promise<string[]> => {
    try {
        console.log('Validating session...');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("Authentication required.");

        console.log(`Uploading ${imageUris.length} screenshot(s)...`);
        const publicUrls = await uploadScreenshots(imageUris);
        console.log('Uploaded to:', publicUrls);

        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
        const now = new Date();
        const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const endpoint = mode === 'chat' ? '/api/v1/chat/parse' : '/api/v1/prompts/generate';
        const body = mode === 'chat'
            ? {
                image_urls: publicUrls,
                target_tone: tone,
                client_date: localDate
            }
            : {
                image_urls: publicUrls,
                mission: mission || "",
                user_goal: userGoal,
                target_goal: targetGoal,
                target_tone: tone,
                client_date: localDate
            };

        console.log(`Calling ${mode} backend...`);
        const backendResponse = await fetch(`${apiUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify(body),
        });

        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            throw new Error(`Backend error: ${backendResponse.status} ${errorText}`);
        }
        const data = await backendResponse.json();

        if (data.replies && data.replies.length > 0) {
            return data.replies;
        } else {
            return ["No responses generated."];
        }

    } catch (error: any) {
        console.error('Error parsing screenshot:', error);
        // Throw the explicit paywall marker out if backend returned 403 or caught locally
        if (error.message === 'PAYWALL_LIMIT_REACHED' || error.message.includes('403 PAYWALL_LIMIT_REACHED') || error.message.includes('403')) {
            error.message = 'PAYWALL_LIMIT_REACHED';
            throw error;
        }

        // Fallback to error message
        return [`Failed to process the screenshot. Is the backend running?`];
    }
};
