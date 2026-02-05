import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { api } from '@/api';

interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  credits: number;
  teacher_name: string;
  enrolled_students: number;
  max_students: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface PaginatedResponse {
  items: Course[];
  total: number;
  page: number;
  limit: number;
}

const coursesAdapter = createEntityAdapter<Course>({
  selectId: (course) => course.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async ({ query = '', department = 'all', page = 1, limit = 8 }: { query?: string; department?: string; page?: number; limit?: number }) => {
    const response = await api.get(`/courses`, {
      params: {
        search: query,
        department,
        page,
        limit,
      },
    });
    return response.data as PaginatedResponse;
  }
);

export const fetchCourse = createAsyncThunk(
  'courses/fetchCourse',
  async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData: Omit<Course, 'id' | 'enrolled_students' | 'created_at' | 'updated_at'>) => {
    const response = await api.post(`/courses`, courseData);
    return response.data;
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ courseId, courseData }: { courseId: string; courseData: Partial<Course> }) => {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return response.data;
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId: string) => {
    await api.delete(`/courses/${courseId}`);
    return courseId;
  }
);

export const enrollStudentInCourse = createAsyncThunk(
  'courses/enrollStudentInCourse',
  async ({ studentId, courseId }: { studentId: string; courseId: string }) => {
    const response = await api.post(`/courses/${courseId}/enroll`, { studentId });
    return { courseId, studentId };
  }
);

export const unenrollStudentFromCourse = createAsyncThunk(
  'courses/unenrollStudentFromCourse',
  async ({ studentId, courseId }: { studentId: string; courseId: string }) => {
    const response = await api.post(`/courses/${courseId}/unenroll`, { studentId });
    return { courseId, studentId };
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState: coursesAdapter.getInitialState({
    status: 'idle' as
      | 'idle'
      | 'loading'
      | 'succeeded'
      | 'failed',
    error: null as string | null,
    currentPage: 1,
    currentQuery: '',
    currentDepartment: 'all',
    currentLimit: 8,
    totalItems: 0,
    selectedCourseIds: [] as string[],
  }),
  reducers: {
    setPagination: (state, action) > {
      const { page, limit } = action.payload;
      state.currentPage = page;
      state.currentLimit = limit;
    },
    setFilters: (state, action) > {
      const { query, department } = action.payload;
      state.currentQuery = query;
      state.currentDepartment = department;
      state.currentPage = 1;
    },
    selectCourse: (state, action) > {
      const courseId = action.payload;
      if (!state.selectedCourseIds.includes(courseId)) {
        state.selectedCourseIds.push(courseId);
      }
    },
    deselectCourse: (state, action) > {
      const courseId = action.payload;
      state.selectedCourseIds = state.selectedCourseIds.filter(id > id !== courseId);
    },
    clearSelectedCourses: (state) > {
      state.selectedCourseIds = [];
    },
  },
  extraReducers: (builder) > {
    builder
      .addCase(fetchCourses.pending, (state) > {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) > {
        state.status = 'succeeded';
        const { items, total } = action.payload;
        coursesAdapter.setAll(state, items);
        state.totalItems = total;
      })
      .addCase(fetchCourses.rejected, (state, action) > {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch courses';
      })
      .addCase(createCourse.fulfilled, (state, action) > {
        coursesAdapter.addOne(state, action.payload);
        state.totalItems += 1;
      })
      .addCase(updateCourse.fulfilled, (state, action) > {
        coursesAdapter.upsertOne(state, action.payload);
      })
      .addCase(deleteCourse.fulfilled, (state, action) > {
        coursesAdapter.removeOne(state, action.payload);
        state.totalItems -= 1;
        state.selectedCourseIds = state.selectedCourseIds.filter(id > id !== action.payload);
      })
      .addCase(enrollStudentInCourse.fulfilled, (state, action) > {
        const { courseId } = action.payload;
        const course = state.entities[courseId];
        if (course) {
          course.enrolled_students += 1;
        }
      })
      .addCase(unenrollStudentFromCourse.fulfilled, (state, action) > {
        const { courseId } = action.payload;
        const course = state.entities[courseId];
        if (course) {
          course.enrolled_students -= 1;
        }
      });
  },
});

export const { setPagination, setFilters, selectCourse, deselectCourse, clearSelectedCourses } = coursesSlice.actions;

export const {
  selectAll: selectAllCourses,
  selectById: selectCourseById,
  selectIds: selectCourseIds,
  selectTotal: selectTotalCourses,
} = coursesAdapter.getSelectors((state: RootState) > state.courses);

export const selectCoursesStatus = (state: RootState) > state.courses.status;
export const selectCoursesError = (state: RootState) > state.courses.error;
export const selectCurrentPage = (state: RootState) > state.courses.currentPage;
export const selectCurrentQuery = (state: RootState) > state.courses.currentQuery;
export const selectCurrentDepartment = (state: RootState) > state.courses.currentDepartment;
export const selectCurrentLimit = (state: RootState) > state.courses.currentLimit;
export const selectTotalItems = (state: RootState) > state.courses.totalItems;
export const selectSelectedCourseIds = (state: RootState) > state.courses.selectedCourseIds;

export const selectCoursesForCurrentPage = (state: RootState) > {
  const courses = selectAllCourses(state);
  const page = selectCurrentPage(state);
  const limit = selectCurrentLimit(state);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return courses.slice(startIndex, endIndex);
};

export const selectIsCourseSelected = (courseId: string) > {
  return (state: RootState) > selectSelectedCourseIds(state).includes(courseId);
};

export default coursesSlice.reducer;