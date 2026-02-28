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
        // 1. Validate User limits
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("Authentication required.");

        // Ultra users bypass all limits instantly
        if (isUltra) {
            console.log("Ultra User detected. Bypassing usage limits.");
        } else {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('daily_requests_used, last_request_date')
                .eq('id', session.user.id)
                .maybeSingle();

            if (profileError) {
                console.error('Error fetching profile limits:', JSON.stringify(profileError));
                throw new Error("Unable to verify account limits.");
            }

            let requestsUsed = profile?.daily_requests_used || 0;
            const lastRequestDate = profile?.last_request_date ? profile.last_request_date.split('T')[0] : '';
            const today = new Date().toISOString().split('T')[0];

            if (lastRequestDate !== today) {
                requestsUsed = 0; // Reset for a new day
            }

            // Dynamics Limits based on Business Plan
            const currentLimit = isPro ? 30 : 5; // Pro = 30, Free = 5

            if (requestsUsed >= currentLimit) {
                throw new Error("PAYWALL_LIMIT_REACHED");
            }
        }

        console.log('Uploading screenshot...');
        // 2. Upload logic we just built
        const publicUrl = await uploadScreenshot(imageUri);
        console.log('Uploaded to:', publicUrl);


        console.log('Calling parsing backend at 192.168.1.3...');
        // 3. Make the API Call to our new Python Backend on local network
        const backendResponse = await fetch('http://192.168.1.3:8000/api/v1/chat/parse', {
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
            // Increment usage count natively UNLESS they are ultra (they don't need tracking)
            if (!isUltra) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('daily_requests_used')
                    .eq('id', session.user.id)
                    .maybeSingle();

                const currentCount = profile?.daily_requests_used || 0;

                const { error: updateError, data: updateData } = await supabase.from('profiles').update({
                    daily_requests_used: currentCount + 1,
                    last_request_date: new Date().toISOString()
                }).eq('id', session.user.id).select();

                if (updateError) {
                    console.error('Failed to increment usage:', JSON.stringify(updateError));
                } else {
                    console.log('Successfully incremented usage:', updateData);
                }
            }

            return data.replies;
        } else {
            return ["No responses generated."];
        }

    } catch (error: any) {
        console.error('Error parsing screenshot:', error);
        // Throw the explicit paywall marker out
        if (error.message === 'PAYWALL_LIMIT_REACHED') {
            throw error;
        }

        // Fallback to error message
        return ["Failed to process the screenshot. Is the backend running at 192.168.1.3:8000?"];
    }
};
