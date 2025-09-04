'use client';

import { useState, useEffect } from 'react';

export interface Settings {
  esp32IpAddress: string;
}

const defaultSettings: Settings = {
  esp32IpAddress: 'localhost:81',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage on component mount
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    }
  }, []);

  const setEsp32IpAddress = (ip: string) => {
    const newSettings = { ...settings, esp32IpAddress: ip };
    setSettings(newSettings);
    localStorage.setItem('app-settings', JSON.stringify(newSettings));
  };

  return {
    ...settings,
    setEsp32IpAddress,
  };
}
