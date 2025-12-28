'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { EXERCISES } from '@/constants/exercises';

export type WorkoutStatus = 'IDLE' | 'ACTIVE' | 'REST' | 'FINISHED';

export interface WorkoutLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  bodyPart: string;
  weight: number;
  reps: number;
  timestamp: string;
}

export interface WorkoutState {
  status: WorkoutStatus;
  currentExercise: {
    id: string;
    name: string;
    part: string;
  };
  weight: number;
  reps: number;
  logs: WorkoutLog[];
  sessionData: {
    start: number | null;
    end: number | null;
  };
  isSaving: boolean;
}

type WorkoutAction =
  | { type: 'START_WORKOUT' }
  | { type: 'FINISH_WORKOUT'; endTime: number }
  | { type: 'RESET' }
  | { type: 'CHANGE_EXERCISE'; exercise: { id: string; name: string; part: string } }
  | { type: 'SET_WEIGHT'; weight: number }
  | { type: 'SET_REPS'; reps: number }
  | { type: 'LOG_SET'; log: WorkoutLog }
  | { type: 'START_REST' }
  | { type: 'END_REST' }
  | { type: 'SET_SAVING'; isSaving: boolean };

const initialState: WorkoutState = {
  status: 'IDLE',
  currentExercise: EXERCISES[0],
  weight: 20,
  reps: 10,
  logs: [],
  sessionData: {
    start: null,
    end: null,
  },
  isSaving: false,
};

function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'START_WORKOUT':
      return {
        ...state,
        status: 'ACTIVE',
        sessionData: {
          start: Date.now(),
          end: null,
        },
      };

    case 'FINISH_WORKOUT':
      return {
        ...state,
        status: 'FINISHED',
        sessionData: {
          ...state.sessionData,
          end: action.endTime,
        },
      };

    case 'RESET':
      return initialState;

    case 'CHANGE_EXERCISE':
      return {
        ...state,
        currentExercise: action.exercise,
      };

    case 'SET_WEIGHT':
      return {
        ...state,
        weight: action.weight,
      };

    case 'SET_REPS':
      return {
        ...state,
        reps: action.reps,
      };

    case 'LOG_SET':
      return {
        ...state,
        logs: [...state.logs, action.log],
      };

    case 'START_REST':
      return {
        ...state,
        status: 'REST',
      };

    case 'END_REST':
      return {
        ...state,
        status: 'ACTIVE',
      };

    case 'SET_SAVING':
      return {
        ...state,
        isSaving: action.isSaving,
      };

    default:
      return state;
  }
}

interface WorkoutContextValue {
  state: WorkoutState;
  dispatch: React.Dispatch<WorkoutAction>;
}

const WorkoutContext = createContext<WorkoutContextValue | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  return (
    <WorkoutContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within WorkoutProvider');
  }
  return context;
}
