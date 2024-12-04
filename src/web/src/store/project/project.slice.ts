/**
 * Project Redux Slice
 * 
 * Requirements Addressed:
 * - State Management (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Provides a centralized state management solution for handling project-related state,
 *   including fetching, creating, updating, and deleting projects.
 */

// @reduxjs/toolkit v1.9.5
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProjectInterface } from '../../interfaces/project.interface';
import { 
  getProjects,
  createProject,
  updateProject,
  deleteProject 
} from '../../services/project.service';

// Define the state interface for the project slice
interface ProjectState {
  projects: ProjectInterface[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ProjectState = {
  projects: [],
  loading: false,
  error: null
};

// Async thunks for handling API operations
export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      return await getProjects();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addProject = createAsyncThunk(
  'project/addProject',
  async (projectData: ProjectInterface, { rejectWithValue }) => {
    try {
      return await createProject(projectData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const editProject = createAsyncThunk(
  'project/editProject',
  async ({ 
    projectId, 
    projectData 
  }: { 
    projectId: string; 
    projectData: Partial<ProjectInterface>; 
  }, { rejectWithValue }) => {
    try {
      return await updateProject(projectId, projectData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeProject = createAsyncThunk(
  'project/removeProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      await deleteProject(projectId);
      return projectId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create the project slice
const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<ProjectInterface[]>) => {
      state.projects = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Handle fetchProjects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Handle addProject
    builder
      .addCase(addProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(addProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Handle editProject
    builder
      .addCase(editProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(editProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Handle removeProject
    builder
      .addCase(removeProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(p => p.id !== action.payload);
      })
      .addCase(removeProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions and reducer
export const { setProjects, setLoading, setError } = projectSlice.actions;
export const projectReducer = projectSlice.reducer;