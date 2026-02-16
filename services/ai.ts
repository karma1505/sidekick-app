import * as ImageManipulator from 'expo-image-manipulator';
import OpenAI from 'openai';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

// Initialize OpenAI client
// Note: In production, it's recommended to call OpenAI from a backend/Edge Function 
// to avoid exposing keys, but for MVP/prototype, client-side is acceptable with warnings.
const openai = new OpenAI({
    apiKey: apiKey || 'dummy-key',
    dangerouslyAllowBrowser: true, // Required for React Native
});

export interface GeneratedResponse {
    responses: string[];
}

export const generateResponses = async (
    imageUri: string,
    tone: string
): Promise<string[]> => {
    try {
        if (!apiKey) {
            console.warn('No OpenAI API Key found. Returning mock responses.');
            return mockResponses(tone);
        }

        // 1. Optimize Image (Resize and Compress)
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ resize: { width: 800 } }], // Resize to max width 800px
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        const base64Image = `data:image/jpeg;base64,${manipulatedImage.base64}`;

        // 2. Call OpenAI Vision API
        const prompt = `
      You are a dating coach assistant. 
      Analyze this dating app conversation screenshot.
      Provide 3 distinct ${tone} responses that the user could send next.
      
      Rules:
      - Keep them natural and human-like.
      - Match the vibe of the conversation.
      - Don't be too cringy unless the tone is 'funny'.
      - Return ONLY a JSON object with a "responses" array of strings.
      - Do not include markdown formatting like \`\`\`json.
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64Image,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 300,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error('No response from AI');

        // 3. Parse Response
        const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const json: GeneratedResponse = JSON.parse(cleanedContent);

        return json.responses;

    } catch (error) {
        console.error('Error generating responses:', error);
        // Fallback to mock data if API fails
        return mockResponses(tone);
    }
};

const mockResponses = (tone: string): string[] => {
    switch (tone) {
        case 'flirty':
            return [
                "Are you a magician? Because whenever I look at your photos, everyone else disappears. 😉",
                "I was going to play it cool, but you're making that really hard.",
                "So, aside from taking my breath away, what do you do for a living?"
            ];
        case 'funny':
            return [
                "Do you believe in love at first swipe, or should I unmatch and swipe again? 😂",
                "I'm not saying you're the best catch here, but... wait, yes I am.",
                "My dog thinks we'd be a cute couple. He's rarely wrong."
            ];
        case 'thoughtful':
            return [
                "That's a really interesting perspective. I'd love to hear more about what led you to think that way.",
                "It seems like you're really passionate about your work. That's admirable.",
                "I saw your travel photo! What was the highlight of that trip?"
            ];
        default:
            return [
                "Hey! How's your week going?",
                "That looks like such a fun place!",
                "Tell me more about that."
            ];
    }
};
