/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VitalReading } from './http-vitals';

interface MonitoringState {
  currentPatientId: string | null;
  setCurrentPatientId: (id: string | null) => void;
  patientReadings: Record<string, VitalReading[]>;
  addReading: (patientId: string, reading: VitalReading) => void;
  getPatientReadings: (patientId: string) => VitalReading[];
  clearReadings: (patientId: string) => void;
}

export const useMonitoringState = create<MonitoringState>()(
  persist(
    (set, get) => ({
      currentPatientId: null,
      patientReadings: {},
      
      setCurrentPatientId: (id) => set({ currentPatientId: id }),
      
      addReading: (patientId, reading) => set((state) => {
        const currentReadings = state.patientReadings[patientId] || [];
        const newReadings = [...currentReadings, reading].slice(-1000); // Keep last 1000 readings
        
        return {
          patientReadings: {
            ...state.patientReadings,
            [patientId]: newReadings
          }
        };
      }),
      
      getPatientReadings: (patientId) => {
        return get().patientReadings[patientId] || [];
      },
      
      clearReadings: (patientId) => set((state) => ({
        patientReadings: {
          ...state.patientReadings,
          [patientId]: []
        }
      }))
    }),
    {
      name: 'patient-monitoring'
    }
  )
);
