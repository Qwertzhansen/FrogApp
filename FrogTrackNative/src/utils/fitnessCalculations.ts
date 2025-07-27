import { Profile, ActivityLevel } from '../types';

export const activityLevelMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    'very_active': 1.9,
};

export const activityLevelLabels: Record<ActivityLevel, string> = {
    sedentary: 'Sedentary (little or no exercise)',
    light: 'Lightly Active (light exercise/sports 1-3 days/week)',
    moderate: 'Moderately Active (moderate exercise/sports 3-5 days/week)',
    active: 'Very Active (hard exercise/sports 6-7 days a week)',
    'very_active': 'Extra Active (very hard exercise/physical job)',
};


export const bodyFatEstimates: Record<string, { value: number, label: string }> = {
    'athletic_male': { value: 10, label: 'Athletic (Male, ~10%)' },
    'fit_male': { value: 15, label: 'Fit (Male, ~15%)' },
    'average_male': { value: 21, label: 'Average (Male, ~21%)' },
    'overweight_male': { value: 28, label: 'Overweight (Male, 25%+)' },
    'athletic_female': { value: 16, label: 'Athletic (Female, ~16%)' },
    'fit_female': { value: 22, label: 'Fit (Female, ~22%)' },
    'average_female': { value: 28, label: 'Average (Female, ~28%)' },
    'overweight_female': { value: 35, label: 'Overweight (Female, 32%+)' },
};

/**
 * Calculates Basal Metabolic Rate (BMR).
 * Uses Katch-McArdle formula if body fat percentage is provided,
 * otherwise falls back to Mifflin-St Jeor formula.
 */
export const calculateBMR = (profile: Profile): number => {
    const { weight, height, age, gender, bodyFatPercentage } = profile;

    if (!weight || !height || !age) return 0;

    // Katch-McArdle Formula (more accurate if body fat is known)
    if (bodyFatPercentage && bodyFatPercentage > 0 && bodyFatPercentage < 100) {
        const leanBodyMass = weight * (1 - (bodyFatPercentage / 100));
        if (leanBodyMass <= 0) return 0;
        return 370 + (21.6 * leanBodyMass);
    }

    // Mifflin-St Jeor Formula (fallback)
    if (gender === 'male') {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else { // female
        return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE) or Maintenance Calories.
 */
export const calculateTDEE = (profile: Profile): number => {
    if (profile.bmrMode === 'manual' && profile.manualBmr && profile.manualBmr > 0) {
        return Math.round(profile.manualBmr * activityLevelMultipliers[profile.activityLevel]);
    }
    
    const bmr = calculateBMR(profile);
    if (bmr <= 0) return 0;

    const multiplier = activityLevelMultipliers[profile.activityLevel];
    return Math.round(bmr * multiplier);
};
