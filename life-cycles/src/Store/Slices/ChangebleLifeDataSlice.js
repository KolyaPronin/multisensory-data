import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  steps: null,
  heartbeat: null,
  sleep: null,
  path: null,
  notifications: null,
  coordinates: null,
  startTimestamp: null, 
};

const changebleLifeDataSlice = createSlice({
  name: 'changebleLifeData',
  initialState,
  reducers: {
    changeStartTimestamp: (state, action) => {
      state.startTimestamp = action.payload;
    },
    changeStepsInStore(state, action) {
      state.steps = action.payload;
    },
    changeHeartbeatInStore(state, action) {
      state.heartbeat = action.payload;
    },
    changeSleepInStore(state, action) {
      state.sleep = action.payload;
    },
    changePathInStore(state, action) {
      state.path = action.payload;
    },
    changeNotificationsInStore(state, action) {
      state.notifications = action.payload;
    },
    changeCoordinatesInStore(state, action) {
      state.coordinates = action.payload;
    },
  },
});

export const {
  changeStepsInStore,
  changeStartTimestamp,  
  changeHeartbeatInStore,
  changeSleepInStore,
  changePathInStore,
  changeNotificationsInStore,
  changeCoordinatesInStore,
} = changebleLifeDataSlice.actions;

export default changebleLifeDataSlice.reducer;
