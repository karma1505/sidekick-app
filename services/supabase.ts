import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const ExpoStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve(null);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const uploadScreenshot = async (uri: string): Promise<string> => {
  try {
    const ext = uri.substring(uri.lastIndexOf('.') + 1) || 'jpg';
    const fileName = `screenshot_${Date.now()}.${ext}`;
    const base64FileCode = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    const { data, error } = await supabase.storage
      .from('chat_screenshots')
      .upload(fileName, decode(base64FileCode), {
        contentType: 'image/jpeg',
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('chat_screenshots')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading screenshot:', error);
    throw error;
  }
};

export const uploadScreenshots = async (uris: string[]): Promise<string[]> => {
  try {
    // Upload all screenshots in parallel
    const uploadPromises = uris.map(uri => uploadScreenshot(uri));
    const publicUrls = await Promise.all(uploadPromises);
    return publicUrls;
  } catch (error) {
    console.error('Error uploading multiple screenshots:', error);
    throw error;
  }
};
