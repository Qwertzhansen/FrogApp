

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { LogEntry, ParsedLog, Profile, Meal } from '../types';
import { calculateTDEE } from "../utils/fitnessCalculations";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const logParsingSchema = {
    type: Type.OBJECT,
    properties: {
        workouts: {
            type: Type.ARRAY,
            description: "List of workouts mentioned in the text.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the workout, e.g., 'Morning Run', 'HIIT Session'." },
                    duration: { type: Type.NUMBER, description: "Duration of the workout in minutes." },
                    distance: { type: Type.NUMBER, description: "Distance covered in kilometers, if applicable." },
                    calories: { type: Type.NUMBER, description: "Estimated total calories burned during the workout." },
                    exercises: {
                        type: Type.ARRAY,
                        description: "Specific exercises performed during the workout.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "Name of the exercise, e.g., 'Bench Press'." },
                                sets: { type: Type.NUMBER, description: "Number of sets." },
                                reps: { type: Type.NUMBER, description: "Number of repetitions per set." },
                                weight: { type: Type.NUMBER, description: "Weight used in kilograms." },
                            },
                            required: ["name"]
                        }
                    }
                },
                required: ["name"]
            }
        },
        meals: {
            type: Type.ARRAY,
            description: "List of meals or food items consumed.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the meal or food, e.g., 'Scrambled Eggs'." },
                    calories: { type: Type.NUMBER, description: "Estimated total calories for the meal." },
                    protein: { type: Type.NUMBER, description: "Estimated protein in grams." },
                    carbs: { type: Type.NUMBER, description: "Estimated carbohydrates in grams." },
                    fat: { type: Type.NUMBER, description: "Estimated fat in grams." },
                },
                required: ["name", "calories"]
            }
        }
    }
};

const mealParsingSchema = {
    type: Type.OBJECT,
    properties: {
        meals: {
            type: Type.ARRAY,
            description: "List of meals or food items identified in the image.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the meal or food, e.g., 'Scrambled Eggs'." },
                    calories: { type: Type.NUMBER, description: "Estimated total calories for the meal." },
                    protein: { type: Type.NUMBER, description: "Estimated protein in grams." },
                    carbs: { type: Type.NUMBER, description: "Estimated carbohydrates in grams." },
                    fat: { type: Type.NUMBER, description: "Estimated fat in grams." },
                },
                required: ["name", "calories"]
            }
        }
    }
};

export const parseNaturalLanguageLog = async (text: string, profile: Profile): Promise<ParsedLog> => {
    let userContext = "";
    if (profile) {
        const tdee = calculateTDEE(profile);
        userContext = ` The user is a ${profile.age}-year-old ${profile.gender} who is ${profile.height}cm tall and weighs ${profile.weight}kg. Their activity level is "${profile.activityLevel}". Their estimated daily maintenance calories are ${tdee} kcal. Use this information for more accurate calorie estimations for workouts.`
    }
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Parse the following user-provided text to identify and structure workout and meal information. For workouts, you MUST estimate the total calories burned based on the activity type, duration, and any other relevant details. For meals, parse nutritional information. Infer quantities and types where possible. For example, "30 min HIIT" is a workout. "3 scrambled eggs and 200g rice" is a meal.${userContext}\n\nTEXT: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: logParsingSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ParsedLog;

    } catch (error) {
        console.error("Error parsing natural language with Gemini:", error);
        throw new Error("Failed to communicate with the AI service for parsing.");
    }
};

export const analyzeFoodImage = async (base64ImageData: string, userHint: string): Promise<ParsedLog> => {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64ImageData,
        },
    };

    const textPart = {
        text: `Analyze the attached image of a meal. Identify all distinct food items and estimate their nutritional information (calories, protein, carbs, fat) for a reasonable serving size. Use the following user-provided hint if available: "${userHint}". If no food is clearly identifiable, return an empty array for meals. Structure the output as a list of meal items.`
    };
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: mealParsingSchema,
            }
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText) as ParsedLog;

        if (!parsedData.meals) {
            return { meals: [] };
        }
        
        return parsedData;

    } catch (error) {
        console.error("Error analyzing food image with Gemini:", error);
        throw new Error("Failed to communicate with the AI service for image analysis.");
    }
};

export const generatePersonalizedTips = async (activities: LogEntry[], profile: Profile): Promise<string> => {
    const formattedActivities = activities.map(log => {
        const activityData = log.data as Meal | any;
        const details = log.type === 'meal'
            ? `${activityData.name} (${activityData.calories} kcal)`
            : `${activityData.name} (${activityData.duration} min)`;
        return `- ${log.type} on ${log.timestamp.toLocaleDateString()}: ${details}`;
    }).join('\n');
    
    const tdee = calculateTDEE(profile);
    const userGoal = profile.goal ? `The user's primary goal is to: "${profile.goal}".` : "The user has not set a primary goal.";

    const userContext = `
        User's profile:
        - Age: ${profile.age}
        - Gender: ${profile.gender}
        - Weight: ${profile.weight}kg
        - Height: ${profile.height}cm
        - Activity Level: ${profile.activityLevel}
        - Estimated Daily Calorie Needs (TDEE): approx ${tdee} kcal.
        - ${userGoal}
    `;

    const prompt = `
        You are an expert fitness and nutrition coach. Analyze the following recent activities of a user and provide 2-3 short, actionable, and encouraging tips.
        Your tips MUST be tailored to help the user achieve their specific goal.
        Base your advice on their logged activities and their profile information. Focus on balance, recovery, potential improvements, and consistency. Be friendly and supportive.

        ${userContext}

        User's recent activities:
        ${formattedActivities}

        Generate tips based on this data. Make them concise and easy to understand.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        return response.text;

    } catch (error) {
        console.error("Error generating tips with Gemini:", error);
        throw new Error("Failed to communicate with the AI service for tips.");
    }
};
