'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import { Loader2, Save, RefreshCw, User, UserCheck, Palette, Smile } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// Use the actual valid values from the library
const HAIR_STYLES = {
    male: [
        { label: "Short Flat", value: "shortFlat" as const },
        { label: "Short Round", value: "shortRound" as const },
        { label: "Dreads", value: "shortDreads" as const },
        { label: "Sides", value: "sides" as const },
        { label: "Caesar", value: "theCaesar" as const },
    ],
    female: [
        { label: "Big Hair", value: "longHairBigHair" as const },
        { label: "Bob", value: "bob" as const },
        { label: "Bun", value: "bun" as const },
        { label: "Curly", value: "curly" as const },
        { label: "Straight", value: "straight02" as const },
        { label: "Frida", value: "frida" as const },
    ]
} as const;

const CLOTHING = [
    { label: "Blazer", value: "blazerAndShirt" as const },
    { label: "Sweater", value: "collarAndSweater" as const },
    { label: "Graphic Shirt", value: "graphicShirt" as const },
    { label: "Hoodie", value: "hoodie" as const },
    { label: "Overall", value: "overall" as const },
    { label: "V-Neck", value: "shirtVNeck" as const },
] as const;

const FACIAL_HAIR = [
    { label: "None", value: "none" as const },
    { label: "Light Beard", value: "beardLight" as const },
    { label: "Majestic Beard", value: "beardMajestic" as const },
    { label: "Medium Beard", value: "beardMedium" as const },
    { label: "Moustache", value: "moustacheFancy" as const },
    { label: "Fancy Moustache", value: "moustacheMagnum" as const },
] as const;

const EYES = [
    { label: "Default", value: "default" as const },
    { label: "Happy", value: "eyeRoll" as const },
    { label: "Squint", value: "squint" as const },
    { label: "Side Glance", value: "side" as const },
    { label: "Wink", value: "wink" as const },
    { label: "Closed", value: "closed" as const },
    { label: "Cry", value: "cry" as const },
    { label: "Hearts", value: "hearts" as const },
] as const;

const MOUTH = [
    { label: "Smile", value: "smile" as const },
    { label: "Grin", value: "twinkle" as const },
    { label: "Serious", value: "serious" as const },
    { label: "Eating", value: "eating" as const },
    { label: "Concerned", value: "concerned" as const },
    { label: "Sad", value: "sad" as const },
] as const;

const ACCESSORIES = [
    { label: "None", value: "none" as const },
    { label: "Prescription Glasses", value: "prescription02" as const },
    { label: "Round Glasses", value: "round" as const },
    { label: "Wayfarers", value: "wayfarers" as const },
    { label: "Kurt Glasses", value: "kurt" as const },
    { label: "Sunglasses", value: "sunglasses" as const },
    { label: "Eyepatch", value: "eyepatch" as const },
] as const;

const COLORS = {
    skin: ["f2d3b1", "d08b5b", "ae5d29", "614335"] as const,
    hair: ["2c1b18", "4a312c", "724133", "e8be6e", "a55728", "b58143", "727272"] as const,
    clothes: ["3c4f5c", "65c9ff", "262e33", "ff5c00", "5199e4", "e54545"] as const,
    facialHair: ["2c1b18", "4a312c", "724133", "a55728", "b58143"] as const,
} as const;

// Type helpers
type HairValue = typeof HAIR_STYLES.male[number]['value'] | typeof HAIR_STYLES.female[number]['value'];
type ClothingValue = typeof CLOTHING[number]['value'];
type FacialHairValue = typeof FACIAL_HAIR[number]['value'];
type EyesValue = typeof EYES[number]['value'];
type MouthValue = typeof MOUTH[number]['value'];
type AccessoriesValue = typeof ACCESSORIES[number]['value'];
type SkinColorValue = typeof COLORS.skin[number];
type HairColorValue = typeof COLORS.hair[number];
type ClothesColorValue = typeof COLORS.clothes[number];
type FacialHairColorValue = typeof COLORS.facialHair[number];

// ====================== UNIFIED AVATAR GENERATION ======================
export const generateAvatar = (options: {
    seed?: string;
    gender?: 'male' | 'female';
    config?: {
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
    };
}): string => {
    const { seed = 'default', gender = 'male', config = {} } = options;

    const shouldHaveFacialHair = gender === 'male' && config.facial_hair && config.facial_hair !== 'none';

    const avatar = createAvatar(avataaars, {
        seed: seed,

        // Hair
        top: config.top ? [config.top as any] : ['shortFlat'],
        hairColor: config.hair_color ? [config.hair_color as any] : ['2c1b18'],

        // Clothing
        clothing: config.clothing ? [config.clothing as any] : ['blazerAndShirt'],
        clothesColor: config.clothes_color ? [config.clothes_color as any] : ['3c4f5c'],

        // Facial Hair - with probability
        facialHair: shouldHaveFacialHair ? [config.facial_hair as any] : [],
        facialHairColor: shouldHaveFacialHair && config.facial_hair_color ? [config.facial_hair_color as any] : [],
        facialHairProbability: shouldHaveFacialHair ? 100 : 0,

        // Eyes and mouth
        eyes: config.eyes ? [config.eyes as any] : ['default'],
        mouth: config.mouth ? [config.mouth as any] : ['smile'],

        // Accessories - with probability
        accessories: config.accessories && config.accessories !== 'none' ? [config.accessories as any] : [],
        accessoriesProbability: config.accessories && config.accessories !== 'none' ? 100 : 0,

        // Skin color
        skinColor: config.skin_color ? [config.skin_color as any] : ['f2d3b1'],
    });

    return avatar.toDataUri();
};

// Helper to convert camelCase features to snake_case for API
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

// Helper to convert snake_case API config to camelCase
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

// ====================== AVATAR BUILDER COMPONENT ======================
export function AvatarBuilder({ user, onSuccess }: { user: any; onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [genderFilter, setGenderFilter] = useState<'male' | 'female'>(user?.gender || 'male');
    const { updateUser } = useAuth();


    // Load existing avatar config from user
    const userFeatures = apiConfigToFeatures(user?.avatar_config);

    const [features, setFeatures] = useState({
        top: (userFeatures?.top || "shortFlat") as HairValue,
        clothing: (userFeatures?.clothing || "blazerAndShirt") as ClothingValue,
        facialHair: (userFeatures?.facialHair || "none") as FacialHairValue,
        eyes: (userFeatures?.eyes || "default") as EyesValue,
        mouth: (userFeatures?.mouth || "smile") as MouthValue,
        accessories: (userFeatures?.accessories || "none") as AccessoriesValue,
        skinColor: (userFeatures?.skinColor || "f2d3b1") as SkinColorValue,
        hairColor: (userFeatures?.hairColor || "2c1b18") as HairColorValue,
        clothesColor: (userFeatures?.clothesColor || "3c4f5c") as ClothesColorValue,
        facialHairColor: (userFeatures?.facialHairColor || "2c1b18") as FacialHairColorValue,
    });

    // Update gender filter when user gender changes
    useEffect(() => {
        if (user?.gender) {
            setGenderFilter(user.gender);
        }
    }, [user?.gender]);

    // Use the unified generateAvatar function
    const avatarUri = useMemo(() => {
        return generateAvatar({
            seed: user?.username || user?.email || 'default',
            gender: genderFilter,
            config: {
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
            }
        });
    }, [features, user, genderFilter]);

    const handleUpdate = (key: keyof typeof features, value: any) => {
        setFeatures(prev => ({ ...prev, [key]: value }));
    };

    const handleRandomize = () => {
        const availableHair = genderFilter === 'male' ? HAIR_STYLES.male : HAIR_STYLES.female;
        const randomTop = availableHair[Math.floor(Math.random() * availableHair.length)].value;
        const randomClothing = CLOTHING[Math.floor(Math.random() * CLOTHING.length)].value;
        const randomEyes = EYES[Math.floor(Math.random() * EYES.length)].value;
        const randomMouth = MOUTH[Math.floor(Math.random() * MOUTH.length)].value;
        const randomAccessories = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].value;

        let randomFacialHair: FacialHairValue = "none";
        if (genderFilter === 'male') {
            const facialHairOptions = FACIAL_HAIR;
            randomFacialHair = facialHairOptions[Math.floor(Math.random() * facialHairOptions.length)].value;
        }

        setFeatures({
            top: randomTop,
            clothing: randomClothing,
            facialHair: randomFacialHair,
            eyes: randomEyes,
            mouth: randomMouth,
            accessories: randomAccessories,
            skinColor: COLORS.skin[Math.floor(Math.random() * COLORS.skin.length)],
            hairColor: COLORS.hair[Math.floor(Math.random() * COLORS.hair.length)],
            clothesColor: COLORS.clothes[Math.floor(Math.random() * COLORS.clothes.length)],
            facialHairColor: COLORS.facialHair[Math.floor(Math.random() * COLORS.facialHair.length)],
        });

        toast.success("Random avatar generated!");
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const avatarConfig = featuresToApiConfig(features);

            const response = await api.post(ENDPOINTS.AUTH.UPDATE_AVATAR, {
                avatar_config: avatarConfig,
                gender: genderFilter,
            });

            // Update local auth context with new avatar config and gender
            const updatedUserData = response.data?.data || response.data;
            if (updatedUserData) {
                updateUser({
                    avatar_config: updatedUserData.avatar_config,
                    gender: updatedUserData.gender,
                });
            }

            toast.success("Avatar saved successfully!");
            onSuccess();
        } catch (error: any) {
            console.error('Save error:', error);
            const errorMessage = error.response?.data?.message || "Failed to save avatar.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-10 py-6">
            {/* Preview */}
            <div className="lg:w-96 flex-shrink-0 flex flex-col items-center">
                <div className="relative w-72 h-72 rounded-3xl border-4 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden shadow-xl">
                    <img src={avatarUri} alt="Avatar Preview" className="w-full h-full object-cover" />
                </div>

                <div className="mt-6 flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl w-full">
                    <button
                        onClick={() => setGenderFilter('male')}
                        className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                            genderFilter === 'male' ? "bg-white dark:bg-zinc-800 shadow-sm text-orange-600" : "text-zinc-500 hover:text-zinc-700")}
                    >
                        <User size={16} /> Male
                    </button>
                    <button
                        onClick={() => setGenderFilter('female')}
                        className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                            genderFilter === 'female' ? "bg-white dark:bg-zinc-800 shadow-sm text-orange-600" : "text-zinc-500 hover:text-zinc-700")}
                    >
                        <UserCheck size={16} /> Female
                    </button>
                </div>

                <Button
                    onClick={handleRandomize}
                    variant="outline"
                    className="mt-6 w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                    <RefreshCw size={16} className="mr-2" /> Randomize
                </Button>

                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full h-14 mt-4 bg-zinc-900 dark:bg-white dark:text-zinc-900 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
                    SAVE TO PROFILE
                </Button>
            </div>

            {/* Controls */}
            <div className="flex-1 space-y-10 max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-4">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Smile className="text-orange-600" size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Expression & Traits</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FeatureGroup label="Eyes" current={features.eyes} options={EYES} onSelect={(v: any) => handleUpdate('eyes', v)} />
                        <FeatureGroup label="Mouth" current={features.mouth} options={MOUTH} onSelect={(v: any) => handleUpdate('mouth', v)} />
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Palette className="text-orange-600" size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Hair Style & Color</span>
                    </div>
                    <FeatureGroup
                        label="Hairstyle"
                        current={features.top}
                        options={genderFilter === 'male' ? HAIR_STYLES.male : HAIR_STYLES.female}
                        onSelect={(v: any) => handleUpdate('top', v)}
                        colorKey="hairColor"
                        currentColor={features.hairColor}
                        onColorChange={(v: any) => handleUpdate('hairColor', v)}
                    />
                </div>

                {genderFilter === 'male' && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Palette className="text-orange-600" size={18} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Facial Hair</span>
                        </div>
                        <FeatureGroup
                            label="Style"
                            current={features.facialHair}
                            options={FACIAL_HAIR}
                            onSelect={(v: any) => handleUpdate('facialHair', v)}
                            colorKey="facialHairColor"
                            currentColor={features.facialHairColor}
                            onColorChange={(v: any) => handleUpdate('facialHairColor', v)}
                        />
                    </div>
                )}

                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Palette className="text-orange-600" size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Clothing & Accessories</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FeatureGroup
                            label="Clothing"
                            current={features.clothing}
                            options={CLOTHING}
                            onSelect={(v: any) => handleUpdate('clothing', v)}
                            colorKey="clothesColor"
                            currentColor={features.clothesColor}
                            onColorChange={(v: any) => handleUpdate('clothesColor', v)}
                        />
                        <FeatureGroup
                            label="Accessories"
                            current={features.accessories}
                            options={ACCESSORIES}
                            onSelect={(v: any) => handleUpdate('accessories', v)}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Palette className="text-orange-600" size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Skin Tone</span>
                    </div>
                    <ColorPicker current={features.skinColor} options={COLORS.skin} onSelect={(v: any) => handleUpdate('skinColor', v)} />
                </div>
            </div>
        </div>
    );
}

// Reusable FeatureGroup
function FeatureGroup({ label, current, options, onSelect, colorKey, currentColor, onColorChange }: any) {
    return (
        <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{label}</p>
            <div className="flex flex-wrap gap-2">
                {options.map((opt: any) => (
                    <button
                        key={opt.value}
                        onClick={() => onSelect(opt.value)}
                        className={cn(
                            "px-4 py-2 rounded-2xl text-xs font-bold border transition-all",
                            current === opt.value
                                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent shadow"
                                : "border-zinc-200 dark:border-zinc-700 hover:border-orange-600/50"
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {colorKey && onColorChange && (
                <div className="pt-2">
                    <p className="text-[9px] font-bold uppercase text-zinc-500 mb-2">Color</p>
                    <div className="flex gap-2 flex-wrap">
                        {(colorKey === 'hairColor' ? COLORS.hair :
                            colorKey === 'clothesColor' ? COLORS.clothes :
                                COLORS.facialHair).map((color: string) => (
                                    <button
                                        key={color}
                                        onClick={() => onColorChange(color)}
                                        className={cn(
                                            "w-9 h-9 rounded-2xl border-2 transition-all",
                                            currentColor === color ? "border-orange-600 scale-110 shadow-lg shadow-orange-600/30" : "border-transparent hover:scale-105"
                                        )}
                                        style={{ backgroundColor: `#${color}` }}
                                    />
                                ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ColorPicker({ current, options, onSelect }: any) {
    return (
        <div className="flex gap-3 flex-wrap">
            {options.map((color: string) => (
                <button
                    key={color}
                    onClick={() => onSelect(color)}
                    className={cn(
                        "w-11 h-11 rounded-2xl border-2 transition-all",
                        current === color ? "border-orange-600 scale-110 shadow-lg shadow-orange-600/30" : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: `#${color}` }}
                />
            ))}
        </div>
    );
}

// Export helper for use in other components
export const generateAvatarFromUser = (user: any): string => {
    return generateAvatar({
        seed: user?.username || user?.email || 'default',
        gender: user?.gender || 'male',
        config: user?.avatar_config,
    });
};