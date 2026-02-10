// Settings management for admin controls
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { PricingTier } from '../types';

export interface AppSettings {
  classesComingSoon: boolean;
  pricingTiersINR?: PricingTier[];
  pricingTiersUSD?: PricingTier[];
  lastUpdated: any;
}

const SETTINGS_DOC_ID = 'app_settings';

/**
 * Get app settings from Firestore
 */
export const getSettings = async (): Promise<AppSettings> => {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      return settingsSnap.data() as AppSettings;
    } else {
      // Default settings
      const defaultSettings: AppSettings = {
        classesComingSoon: true, // Default to showing "coming soon"
        lastUpdated: serverTimestamp(),
      };
      // Create default settings
      await setDoc(settingsRef, defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error getting settings:', error);
    // Return default on error
    return {
      classesComingSoon: true,
      lastUpdated: new Date().toISOString(),
    };
  }
};

/**
 * Update app settings in Firestore
 */
export const updateSettings = async (updates: Partial<AppSettings>): Promise<void> => {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(settingsRef, {
      ...updates,
      lastUpdated: serverTimestamp(),
    }, { merge: true });
    console.log('✅ Settings updated:', updates);
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};
