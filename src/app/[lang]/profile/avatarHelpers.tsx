// utils/avatarHelpers.ts
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

export interface AvatarConfig {
    top?: string;
    clothing?: string;
    facial_hair?: string;
    eyes?: string;
    mouth?: string;
    accessories?: string;
    skin_color?: string;
    hair_color?: string;
    clothes_color?: string;
    facial_hair_color?: string;
}

export interface AvatarOptions {
    seed?: string;
    gender?: 'male' | 'female';
    config?: AvatarConfig;
}

/**
 * Generate avatar URL from configuration
 * This is the SINGLE source of truth for avatar generation
 */
export const generateAvatar = (options: AvatarOptions): string => {
    const { seed = 'default', gender = 'male', config } = options;

    const shouldHaveFacialHair = gender === 'male' && config?.facial_hair && config.facial_hair !== 'none';

    const avatar = createAvatar(avataaars, {
        seed: seed,

        // Hair
        top: config?.top ? [config.top as any] : ['shortFlat'],
        hairColor: config?.hair_color ? [config.hair_color as any] : ['2c1b18'],

        // Clothing
        clothing: config?.clothing ? [config.clothing as any] : ['blazerAndShirt'],
        clothesColor: config?.clothes_color ? [config.clothes_color as any] : ['3c4f5c'],

        // Facial Hair - with probability
        facialHair: shouldHaveFacialHair ? [config.facial_hair as any] : [],
        facialHairColor: shouldHaveFacialHair && config?.facial_hair_color ? [config.facial_hair_color as any] : [],
        facialHairProbability: shouldHaveFacialHair ? 100 : 0,

        // Eyes and mouth
        eyes: config?.eyes ? [config.eyes as any] : ['default'],
        mouth: config?.mouth ? [config.mouth as any] : ['smile'],

        // Accessories - with probability
        accessories: config?.accessories && config.accessories !== 'none' ? [config.accessories as any] : [],
        accessoriesProbability: config?.accessories && config.accessories !== 'none' ? 100 : 0,

        // Skin color
        skinColor: config?.skin_color ? [config.skin_color as any] : ['f2d3b1'],
    });

    return avatar.toDataUri();
};

/**
 * Generate avatar from user object (convenience function)
 */
export const generateAvatarFromUser = (user: any): string => {
    return generateAvatar({
        seed: user?.username || user?.email || 'default',
        gender: user?.gender || 'male',
        config: user?.avatar_config,
    });
};

/**
 * Convert camelCase features to snake_case for API
 */
export const featuresToApiConfig = (features: any) => {
    return {
        top: features.top,
        clothing: features.clothing,
        facial_hair: features.facialHair,
        eyes: features.eyes,
        mouth: features.mouth,
        accessories: features.accessories,
        skin_color: features.skinColor,
        hair_color: features.hairColor,
        clothes_color: features.clothesColor,
        facial_hair_color: features.facialHairColor,
    };
};

/**
 * Convert snake_case API config to camelCase for component
 */
export const apiConfigToFeatures = (config: any) => {
    if (!config) return null;

    return {
        top: config.top || 'shortFlat',
        clothing: config.clothing || 'blazerAndShirt',
        facialHair: config.facial_hair || 'none',
        eyes: config.eyes || 'default',
        mouth: config.mouth || 'smile',
        accessories: config.accessories || 'none',
        skinColor: config.skin_color || 'f2d3b1',
        hairColor: config.hair_color || '2c1b18',
        clothesColor: config.clothes_color || '3c4f5c',
        facialHairColor: config.facial_hair_color || '2c1b18',
    };
};