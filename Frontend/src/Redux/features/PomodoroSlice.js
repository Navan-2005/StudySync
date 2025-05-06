import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  minutes: 25,
  seconds: 0,
  isActive: false,
  progress: 100,
  mode: 'work', // 'work' or 'break'
  workDuration: 25, // minutes
  breakDuration: 5, // minutes
  cycles: 0, // number of completed work sessions
  totalTimeInSeconds: 25 * 60,
  remainingTimeInSeconds: 25 * 60,
  lastUpdatedAt: null, // to track elapsed time when app was in background
};

const PomodoroSlice = createSlice({
  name: 'pomodoro',
  initialState,
  reducers: {
    startTimer: (state) => {
      state.isActive = true;
      state.lastUpdatedAt = Date.now();
    },
    pauseTimer: (state) => {
      state.isActive = false;
    },
    resetTimer: (state) => {
      const duration = state.mode === 'work' ? state.workDuration : state.breakDuration;
      state.minutes = duration;
      state.seconds = 0;
      state.isActive = false;
      state.progress = 100;
      state.totalTimeInSeconds = duration * 60;
      state.remainingTimeInSeconds = duration * 60;
    },
    updateTimer: (state) => {
      // Calculate elapsed time since last update
      const now = Date.now();
      const elapsed = state.lastUpdatedAt ? Math.floor((now - state.lastUpdatedAt) / 1000) : 0;
      state.lastUpdatedAt = now;
      
      if (!state.isActive || elapsed <= 0) return;
      
      // Update remaining time
      let newRemainingTime = state.remainingTimeInSeconds - elapsed;
      
      // Check if timer completed
      if (newRemainingTime <= 0) {
        // Switch modes
        const newMode = state.mode === 'work' ? 'break' : 'work';
        const newDuration = newMode === 'work' ? state.workDuration : state.breakDuration;
        
        // If work mode completed, increment cycles
        if (state.mode === 'work') {
          state.cycles += 1;
        }
        
        state.mode = newMode;
        state.minutes = newDuration;
        state.seconds = 0;
        state.remainingTimeInSeconds = newDuration * 60;
        state.totalTimeInSeconds = newDuration * 60;
        state.progress = 100;
      } else {
        // Update timer normally
        state.remainingTimeInSeconds = newRemainingTime;
        state.minutes = Math.floor(newRemainingTime / 60);
        state.seconds = newRemainingTime % 60;
        state.progress = (newRemainingTime / state.totalTimeInSeconds) * 100;
      }
    },
    setCustomTimer: (state, action) => {
      const { workDuration, breakDuration } = action.payload;
      state.workDuration = workDuration;
      state.breakDuration = breakDuration;
      
      // Reset current session with new values
      if (state.mode === 'work') {
        state.minutes = workDuration;
        state.totalTimeInSeconds = workDuration * 60;
      } else {
        state.minutes = breakDuration;
        state.totalTimeInSeconds = breakDuration * 60;
      }
      
      state.seconds = 0;
      state.remainingTimeInSeconds = state.totalTimeInSeconds;
      state.progress = 100;
      state.isActive = false;
    }
  },
});

export const { 
  startTimer, 
  pauseTimer, 
  resetTimer, 
  updateTimer,
  setCustomTimer 
} = PomodoroSlice.actions;

export default PomodoroSlice.reducer;