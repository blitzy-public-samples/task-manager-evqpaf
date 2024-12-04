// @reduxjs/toolkit v1.9.5
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TaskInterface } from '../../interfaces/task.interface';
import { 
  createTask as createTaskService,
  getTaskById as getTaskByIdService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService 
} from '../../services/task.service';

/**
 * Human Tasks:
 * - Configure error tracking service for Redux action errors
 * - Verify task status and priority values match backend validation
 * - Ensure proper error handling UI components are in place
 */

/**
 * Interface defining the shape of the task slice state
 */
interface TaskState {
  tasks: TaskInterface[];
  loading: boolean;
  error: string | null;
  selectedTask: TaskInterface | null;
}

/**
 * Initial state for the task slice
 * Requirements Addressed:
 * - Task Management (Technical Specification/1.3 Scope/In-Scope Elements/Core Features and Functionalities)
 */
const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  selectedTask: null
};

/**
 * Redux slice for managing task-related state
 * Implements actions and reducers for task operations
 */
const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    // Sets loading state when fetching tasks begins
    fetchTasksStart(state) {
      state.loading = true;
      state.error = null;
    },

    // Updates state with fetched tasks
    fetchTasksSuccess(state, action: PayloadAction<TaskInterface[]>) {
      state.loading = false;
      state.tasks = action.payload;
      state.error = null;
    },

    // Sets error state when task operations fail
    fetchTasksFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Adds a new task to the state
    addTask(state, action: PayloadAction<TaskInterface>) {
      state.tasks.push(action.payload);
    },

    // Updates an existing task in the state
    updateTaskInState(state, action: PayloadAction<TaskInterface>) {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },

    // Removes a task from the state
    removeTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },

    // Sets the selected task
    setSelectedTask(state, action: PayloadAction<TaskInterface | null>) {
      state.selectedTask = action.payload;
    },

    // Clears any error state
    clearError(state) {
      state.error = null;
    }
  }
});

// Export action creators
export const {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  addTask,
  updateTaskInState,
  removeTask,
  setSelectedTask,
  clearError
} = taskSlice.actions;

// Export the reducer
export const taskReducer = taskSlice.reducer;

// Async thunk actions for task operations
export const createTaskAsync = (taskData: TaskInterface) => async (dispatch: any) => {
  try {
    dispatch(fetchTasksStart());
    const newTask = await createTaskService(taskData);
    dispatch(addTask(newTask));
  } catch (error) {
    dispatch(fetchTasksFailure(error instanceof Error ? error.message : 'Failed to create task'));
  }
};

export const updateTaskAsync = (taskId: string, taskData: Partial<TaskInterface>) => async (dispatch: any) => {
  try {
    dispatch(fetchTasksStart());
    const updatedTask = await updateTaskService(taskId, taskData);
    dispatch(updateTaskInState(updatedTask));
  } catch (error) {
    dispatch(fetchTasksFailure(error instanceof Error ? error.message : 'Failed to update task'));
  }
};

export const deleteTaskAsync = (taskId: string) => async (dispatch: any) => {
  try {
    dispatch(fetchTasksStart());
    await deleteTaskService(taskId);
    dispatch(removeTask(taskId));
  } catch (error) {
    dispatch(fetchTasksFailure(error instanceof Error ? error.message : 'Failed to delete task'));
  }
};

export const fetchTaskByIdAsync = (taskId: string) => async (dispatch: any) => {
  try {
    dispatch(fetchTasksStart());
    const task = await getTaskByIdService(taskId);
    dispatch(setSelectedTask(task));
  } catch (error) {
    dispatch(fetchTasksFailure(error instanceof Error ? error.message : 'Failed to fetch task'));
  }
};