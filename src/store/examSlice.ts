import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

interface ExamState {
  exams: unknown[];
  examModes: Record<string, unknown>;
  questionModes: Record<string, { name: string; desc: string }>;
  sections: unknown[];
  topics: unknown[];
  categories: unknown[];
  subCategories: unknown[];
  subSubCategories: unknown[];
  questionsPerStage: number;
  totalQuestionsFromSections: number;
  totalStagesFromSections: number;
  loading: boolean;
}

const initialState: ExamState = {
  exams: [],
  examModes: {},
  questionModes: {},
  sections: [],
  topics: [],
  categories: [],
  subCategories: [],
  subSubCategories: [],
  questionsPerStage: 40,
  totalQuestionsFromSections: 0,
  totalStagesFromSections: 0,
  loading: false,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiError = (error: any) => error?.response?.data ?? { message: 'Network Error' };

export const getExams = createAsyncThunk(
  'exam/getExams',
  async (page: number | undefined, { rejectWithValue }) => {
    try {
      const response = await api.get(`/exams/get?page=${page ?? 1}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const getExamQuestions = createAsyncThunk(
  'exam/getExamQuestions',
  async (examId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/exams/get-questions?exam_id=${examId}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const getQuestion = createAsyncThunk(
  'exam/getQuestion',
  async (questionId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/exams/${questionId}/get-question`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const getCurrentStage = createAsyncThunk(
  'exam/getCurrentStage',
  async (examId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/exams/${examId}/current-stage`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const getStage = createAsyncThunk(
  'exam/getStage',
  async ({ examId, stageNumber }: { examId: number; stageNumber: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/exams/${examId}/stage/${stageNumber}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const advanceStage = createAsyncThunk(
  'exam/advanceStage',
  async (examId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/exams/${examId}/advance-stage`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const getExamOverview = createAsyncThunk(
  'exam/getExamOverview',
  async (examId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/exams/${examId}/overview`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const finishExam = createAsyncThunk(
  'exam/finishExam',
  async (examId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/exams/${examId}/finish`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const saveExamResult = createAsyncThunk(
  'exam/saveExamResult',
  async ({ examId, result }: { examId: number; result: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/exams/${examId}/store-question-answer`, result);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const saveExamSingle = createAsyncThunk(
  'exam/saveExamSingle',
  async ({ examId, obj }: { examId: number; obj: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/exams/${examId}/store-single-question-answer`, obj);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const fetchCreateData = createAsyncThunk(
  'exam/fetchCreateData',
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await api.get('/exams/create');
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const fetchSubCategories = createAsyncThunk(
  'exam/fetchSubCategories',
  async (categoryIds: number[], { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      categoryIds.forEach((id) => params.append('category_ids[]', String(id)));
      const response = await api.get(`/exams/subcategories?${params.toString()}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const fetchSubSubCategories = createAsyncThunk(
  'exam/fetchSubSubCategories',
  async (subCategoryIds: number[], { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      subCategoryIds.forEach((id) => params.append('sub_category_ids[]', String(id)));
      const response = await api.get(`/exams/sub-subcategories?${params.toString()}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const fetchSections = createAsyncThunk(
  'exam/fetchSections',
  async (
    {
      categoryIds,
      subCategoryIds,
      subSubCategoryIds,
    }: {
      categoryIds: number[];
      subCategoryIds?: number[];
      subSubCategoryIds?: number[];
    },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      categoryIds.forEach((id) => params.append('category_ids[]', String(id)));
      subCategoryIds?.forEach((id) => params.append('sub_category_ids[]', String(id)));
      subSubCategoryIds?.forEach((id) => params.append('sub_sub_category_ids[]', String(id)));
      const response = await api.get(`/exams/sections?${params.toString()}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const fetchTopics = createAsyncThunk(
  'exam/fetchTopics',
  async (
    {
      sectionIds,
      categoryIds = [],
      subCategoryIds = [],
      subSubCategoryIds = [],
    }: {
      sectionIds: number[];
      categoryIds?: number[];
      subCategoryIds?: number[];
      subSubCategoryIds?: number[];
    },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      sectionIds.forEach((id) => params.append('section_ids[]', String(id)));
      categoryIds.forEach((id) => params.append('category_ids[]', String(id)));
      subCategoryIds.forEach((id) => params.append('sub_category_ids[]', String(id)));
      subSubCategoryIds.forEach((id) => params.append('sub_sub_category_ids[]', String(id)));
      const response = await api.get(`/exams/topics?${params.toString()}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const storeExam = createAsyncThunk(
  'exam/storeExam',
  async (exam: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const response = await api.post('/exams/store', exam);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const resetExams = createAsyncThunk(
  'exam/resetExams',
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await api.post('/exams/reset');
      return response.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    clearExamData(state) {
      state.subCategories = [];
      state.subSubCategories = [];
      state.sections = [];
      state.topics = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getExams.fulfilled, (state, action) => {
        state.exams = action.payload?.data?.exams || [];
      })
      .addCase(fetchCreateData.fulfilled, (state, action) => {
        const data = action.payload || {};
        state.examModes = data.exam_modes || {};
        state.questionModes = data.question_modes || {};
        state.categories = data.categories || [];
        state.subCategories = [];
        state.sections = [];
        state.topics = [];
        state.questionsPerStage = data.questions_per_stage || 40;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.subCategories = action.payload?.sub_categories || [];
      })
      .addCase(fetchSubSubCategories.fulfilled, (state, action) => {
        state.subSubCategories = action.payload?.sub_sub_categories || [];
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.sections = action.payload?.sections || [];
        state.totalQuestionsFromSections = action.payload?.total_questions || 0;
        state.totalStagesFromSections = action.payload?.total_stages || 0;
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.topics = action.payload?.topics || [];
      });
  },
});

export const { clearExamData } = examSlice.actions;
export default examSlice.reducer;
