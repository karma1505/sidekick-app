import { uploadScreenshot, supabase } from './supabase';

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
    imageUri: string,
    tone: string, // Used in original, but MVP is just to parse the chat
    isPro: boolean,
    isUltra: boolean
): Promise<string[]> => {
    try {
        // Limits are now strictly enforced by the backend API.
        console.log('Validating session...');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("Authentication required.");

        console.log('Uploading screenshot...');
        // 2. Upload logic we just built
        const publicUrl = await uploadScreenshot(imageUri);
        console.log('Uploaded to:', publicUrl);


        console.log('Calling parsing backend...');
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

        // 3. Make the API Call to our new Python Backend on Render
        const backendResponse = await fetch(`${apiUrl}/api/v1/chat/parse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ image_urls: [publicUrl], target_tone: tone }),
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
