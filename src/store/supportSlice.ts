import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

interface SupportState {
  loading: boolean;
}

const initialState: SupportState = { loading: false };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiError = (error: any) => error?.response?.data ?? { message: 'Network Error' };

export const sendContact = createAsyncThunk(
  'support/sendContact',
  async (payload: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const response = await api.post('/contactus', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const sendSupport = createAsyncThunk(
  'support/sendSupport',
  async (payload: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const response = await api.post('/support', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendContact.pending, (state) => { state.loading = true; })
      .addCase(sendContact.fulfilled, (state) => { state.loading = false; })
      .addCase(sendContact.rejected, (state) => { state.loading = false; });
  },
});

export default supportSlice.reducer;
