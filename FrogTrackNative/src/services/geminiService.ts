import { LogEntry, ParsedLog, Profile, Meal } from '../types';
import { calculateTDEE } from "../utils/fitnessCalculations";

const API_URL = 'http://localhost:3000/api';

export const parseNaturalLanguageLog = async (text: string, profile: Profile): Promise<ParsedLog> => {
    let userContext = "";
    if (profile) {
        const tdee = calculateTDEE(profile);
        userContext = ` The user is a ${profile.age}-year-old ${profile.gender} who is ${profile.height}cm tall and weighs ${profile.weight}kg. Their activity level is "${profile.activityLevel}". Their estimated daily maintenance calories are ${tdee} kcal. Use this information for more accurate calorie estimations for workouts.`
    }

    const prompt = `Parse the following user-provided text to identify and structure workout and meal information. For workouts, you MUST estimate the total calories burned based on the activity type, duration, and any other relevant details. For meals, parse nutritional information. Infer quantities and types where possible. For example, "30 min HIIT" is a workout. "3 scrambled eggs and 200g rice" is a meal.${userContext}\n\nTEXT: "${text}"`;

    try {
        const response = await fetch(`${API_URL}/analyze-text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });
        const data = await response.json();
        return JSON.parse(data.text) as ParsedLog;
    } catch (error) {
        console.error("Error parsing natural language:", error);
        throw new Error("Failed to communicate with the AI service for parsing.");
    }
};

export const analyzeFoodImage = async (base64ImageData: string, userHint: string): Promise<ParsedLog> => {
    // This will be implemented later, as it requires file system access to read the image
    return Promise.resolve({ meals: [] });
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
        const response = await fetch(`${API_URL}/get-tips`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });
        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Error generating tips:", error);
        throw new Error("Failed to communicate with the AI service for tips.");
    }
};