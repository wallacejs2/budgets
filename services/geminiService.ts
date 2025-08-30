import { GoogleGenAI, Type } from "@google/genai";
import { EXPENSE_CATEGORIES } from '../constants';

// IMPORTANT: This check is for client-side environments.
// An API key should not be exposed in production client-side code.
// This is for demonstration purposes only.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const parseReceipt = async (base64Image: string, mimeType: string): Promise<{ description: string, amount: number, date: string } | null> => {
    if (!apiKey) {
        console.warn("API_KEY not set. Receipt scanning disabled.");
        return null;
    }

    try {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Image,
            },
        };
        const textPart = {
            text: `Analyze this receipt image and extract the following information:
1.  A short description of the vendor or store name.
2.  The final total amount.
3.  The date of the transaction in YYYY-MM-DD format.

Return the result in a JSON format.`
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: {
                            type: Type.STRING,
                            description: "The vendor or store name.",
                        },
                        amount: {
                            type: Type.NUMBER,
                            description: "The final total amount of the transaction.",
                        },
                        date: {
                            type: Type.STRING,
                            description: "The date of the transaction in YYYY-MM-DD format.",
                        },
                    },
                    required: ["description", "amount", "date"],
                },
            },
        });

        const jsonString = response.text;
        const parsed = JSON.parse(jsonString);

        if (parsed.description && typeof parsed.amount === 'number' && parsed.date) {
            return {
                description: parsed.description,
                amount: parsed.amount,
                date: parsed.date
            };
        }

        return null;

    } catch (error) {
        console.error('Error parsing receipt with Gemini API:', error);
        return null;
    }
}

export const categorizeExpense = async (description: string): Promise<string> => {
    if (!apiKey) {
        return 'Other';
    }

    try {
        const prompt = `Analyze the expense description and categorize it into one of the following options: ${EXPENSE_CATEGORIES.join(', ')}. Description: "${description}"`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        category: {
                            type: Type.STRING,
                            description: `The expense category, which must be one of: ${EXPENSE_CATEGORIES.join(', ')}.`,
                            enum: EXPENSE_CATEGORIES
                        },
                    },
                    required: ["category"],
                },
            },
        });

        const jsonString = response.text;
        const parsed = JSON.parse(jsonString);
        
        const category = parsed.category;

        if (category && EXPENSE_CATEGORIES.includes(category)) {
            return category;
        }

        return 'Other';
    } catch (error) {
        console.error('Error categorizing expense with Gemini API:', error);
        return 'Other'; // Fallback category
    }
};