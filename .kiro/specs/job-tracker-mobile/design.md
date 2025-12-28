# Design Document

## Overview

The Job Tracker Mobile application is a React Native mobile app built with Expo that provides full functional parity with the existing web application. It enables job seekers to track applications, manage tasks, notes, and habits while providing a native mobile experience optimized for touch interactions.

The app follows a feature-based architecture with clear separation between UI components, business logic, and data services. It uses Expo Router for file-based navigation, TanStack React Query for server state management, Zustand for client state, and NativeWind for styling.

### Tech Stack

- **Framework**: React Native with Expo (EAS enabled)
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router (file-based routing)
- **Server State**: TanStack React Query
- **Client State**: Zustand with persist middleware
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Animations**: React Native Reanimated + Gesture Handler
- **HTTP Client**: Axios with interceptors
- **Secure Storage**: Expo SecureStore
- **Notifications**: Expo Notifications

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Screens   │  │ Components  │  │   Modals    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Hooks Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  useJobs    │  │  useAuth    │  │  useTasks   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Services Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  API Client │  │Auth Service │  │Storage Svc  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         State Layer                              │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │  React Query Cache  │  │   Zustand Store     │               │
│  │   (Server State)    │  │   (Client State)    │               │
│  └─────────────────────┘  └─────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
Mobile-App/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Auth group (sign-in)
│   │   ├── _layout.tsx
│   │   └── sign-in.tsx
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Dashboard
│   │   ├── notes.tsx
│   │   ├── tasks.tsx
│   │   └── habits.tsx
│   ├── job/
│   │   └── [id].tsx              # Job detail screen
│   ├── modals/
│   │   ├── add-job.tsx
│   │   ├── edit-job.tsx
│   │   ├── offer-details.tsx
│   │   └── goal-setting.tsx
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Skeleton.tsx
│   │   └── Toast.tsx
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── JobList.tsx
│   │   ├── JobForm.tsx
│   │   ├── StatusBadge.tsx
│   │   └── AcceptedJobBanner.tsx
│   ├── dashboard/
│   │   ├── StatsHeader.tsx
│   │   ├── DailyProgress.tsx
│   │   └── StatusAccordion.tsx
│   ├── notes/
│   │   ├── NoteCard.tsx
│   │   ├── NoteList.tsx
│   │   └── NoteForm.tsx
│   ├── tasks/
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx
│   │   └── TaskForm.tsx
│   ├── habits/
│   │   ├── HabitCard.tsx
│   │   ├── HabitList.tsx
│   │   └── HabitForm.tsx
│   └── common/
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       ├── LoadingScreen.tsx
│       └── OfflineIndicator.tsx
├── features/
│   ├── auth/
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── services/
│   │       └── authService.ts
│   ├── jobs/
│   │   ├── hooks/
│   │   │   └── useJobs.ts
│   │   ├── services/
│   │   │   └── jobsService.ts
│   │   └── types/
│   │       └── job.ts
│   ├── notes/
│   │   ├── hooks/
│   │   │   └── useNotes.ts
│   │   └── services/
│   │       └── notesService.ts
│   ├── tasks/
│   │   ├── hooks/
│   │   │   └── useTasks.ts
│   │   └── services/
│   │       └── tasksService.ts
│   └── habits/
│       ├── hooks/
│       │   └── useHabits.ts
│       └── services/
│           └── habitsService.ts
├── services/
│   ├── api/
│   │   ├── client.ts             # Axios instance with interceptors
│   │   ├── types.ts              # API response types
│   │   └── endpoints.ts          # API endpoint constants
│   ├── storage/
│   │   ├── secureStorage.ts      # SecureStore wrapper
│   │   └── asyncStorage.ts       # AsyncStorage wrapper
│   └── notifications/
│       └── pushNotifications.ts
├── store/
│   ├── index.ts                  # Root store
│   ├── authStore.ts              # Auth state
│   ├── uiStore.ts                # UI preferences
│   └── offlineStore.ts           # Offline queue
├── hooks/
│   ├── useNetworkStatus.ts
│   ├── useHaptics.ts
│   └── useRefreshOnFocus.ts
├── utils/
│   ├── date.ts                   # Date formatting utilities
│   ├── validation.ts             # Form validation
│   └── constants.ts              # App constants
├── types/
│   └── index.ts                  # Shared type definitions
├── app.json                      # Expo config
├── babel.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Components and Interfaces

### API Client Interface

```typescript
// services/api/client.ts
interface ApiClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

// Interceptors handle:
// - Adding Authorization header with JWT token
// - Refreshing expired tokens
// - Redirecting to sign-in on 401
// - Network error handling
```

### Authentication Service Interface

```typescript
// features/auth/services/authService.ts
interface AuthService {
  signInWithGoogle(): Promise<AuthResult>;
  signInWithGitHub(): Promise<AuthResult>;
  signOut(): Promise<void>;
  getStoredToken(): Promise<string | null>;
  refreshToken(): Promise<string>;
  isAuthenticated(): Promise<boolean>;
}

interface AuthResult {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}
```

### Jobs Service Interface

```typescript
// features/jobs/services/jobsService.ts
interface JobsService {
  getJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job>;
  createJob(data: JobCreateInput): Promise<JobWithGoalInfo>;
  updateJob(id: string, data: JobUpdateInput): Promise<Job>;
  deleteJob(id: string): Promise<void>;
}

interface JobWithGoalInfo extends Job {
  goalInfo?: {
    todaysCount: number;
    dailyGoal: number;
    goalReached: boolean;
  };
}
```

### React Query Hooks Interface

```typescript
// features/jobs/hooks/useJobs.ts
interface UseJobsReturn {
  jobs: Job[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addJob: UseMutationResult<Job, Error, JobCreateInput>;
  updateJob: UseMutationResult<Job, Error, { id: string; data: JobUpdateInput }>;
  deleteJob: UseMutationResult<void, Error, string>;
}
```

### Zustand Store Interface

```typescript
// store/uiStore.ts
interface UIState {
  sortBy: 'date' | 'title' | 'company';
  viewMode: 'list' | 'grid';
  expandedSections: JobStatus[];
  
  setSortBy: (sort: 'date' | 'title' | 'company') => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  toggleSection: (status: JobStatus) => void;
}

// store/authStore.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setAuthenticated: (auth: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}
```

### Navigation Types

```typescript
// Expo Router file-based routing
// app/(tabs)/_layout.tsx - Tab navigator
// app/(auth)/_layout.tsx - Auth stack
// app/job/[id].tsx - Dynamic route for job details
// app/modals/*.tsx - Modal screens
```

## Data Models

### Job Model

```typescript
interface Job {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  platform: string | null;
  deadline: Date | null;
  notes: string | null;
  offerTitle: string | null;
  offerCompany: string | null;
  offerSalary: string | null;
  offerBenefits: string | null;
  offerAcceptedDate: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

enum JobStatus {
  PENDING = 'PENDING',
  APPLIED = 'APPLIED',
  INTERVIEWING = 'INTERVIEWING',
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

interface JobCreateInput {
  title: string;
  company: string;
  status?: JobStatus;
  platform?: string;
  deadline?: Date;
  notes?: string;
}

interface JobUpdateInput extends Partial<JobCreateInput> {
  offerTitle?: string;
  offerCompany?: string;
  offerSalary?: string;
  offerBenefits?: string;
  offerAcceptedDate?: Date;
  replaceAccepted?: boolean;
}
```

### Note Model

```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NoteCreateInput {
  title: string;
  content: string;
}

interface NoteUpdateInput extends Partial<NoteCreateInput> {}
```

### Task Model

```typescript
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

interface TaskCreateInput {
  title: string;
  description?: string;
  dueDate?: Date;
}

interface TaskUpdateInput extends Partial<TaskCreateInput> {
  status?: TaskStatus;
}
```

### Habit Model

```typescript
interface Habit {
  id: string;
  name: string;
  description: string | null;
  targetDays: number;
  currentStreak: number;
  bestStreak: number;
  lastCompleted: Date | null;
  userId: string;
  entries: HabitEntry[];
  createdAt: Date;
  updatedAt: Date;
}

interface HabitEntry {
  id: string;
  habitId: string;
  date: Date;
  completed: boolean;
  createdAt: Date;
}

interface HabitCreateInput {
  name: string;
  description?: string;
  targetDays?: number;
}
```

### User Model

```typescript
interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  dailyJobGoal: number;
}
```

### API Response Types

```typescript
// Raw API response (dates as strings)
interface JobApiResponse {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  platform: string | null;
  deadline: string | null;  // ISO date string
  notes: string | null;
  offerTitle: string | null;
  offerCompany: string | null;
  offerSalary: string | null;
  offerBenefits: string | null;
  offerAcceptedDate: string | null;  // ISO date string
  userId: string;
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
}

// Transformation function
function parseJobResponse(response: JobApiResponse): Job {
  return {
    ...response,
    deadline: response.deadline ? new Date(response.deadline) : null,
    offerAcceptedDate: response.offerAcceptedDate ? new Date(response.offerAcceptedDate) : null,
    createdAt: new Date(response.createdAt),
    updatedAt: new Date(response.updatedAt),
  };
}

// Serialization function for requests
function serializeJobInput(input: JobCreateInput | JobUpdateInput): Record<string, unknown> {
  return {
    ...input,
    deadline: input.deadline?.toISOString(),
    offerAcceptedDate: 'offerAcceptedDate' in input && input.offerAcceptedDate 
      ? input.offerAcceptedDate.toISOString() 
      : undefined,
  };
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Authentication state determines navigation
*For any* app state, if no valid token is stored then the app should display the sign-in screen, and if a valid token is stored then the app should navigate to the dashboard.
**Validates: Requirements 1.1, 1.5**

### Property 2: Sign-out clears authentication
*For any* authenticated session, after sign-out the stored token should be null and the app should display the sign-in screen.
**Validates: Requirements 1.6**

### Property 3: Job grouping by status is accurate
*For any* list of jobs, grouping by status should produce groups where each group contains exactly the jobs with that status, and the count displayed for each group should equal the length of that group.
**Validates: Requirements 2.2, 7.2**

### Property 4: Job item display contains required fields
*For any* job, the rendered job item should contain the job title, company name, and a formatted creation date.
**Validates: Requirements 2.4**

### Property 5: Accepted jobs appear first
*For any* list of jobs containing at least one ACCEPTED job, the ACCEPTED jobs should appear before all other jobs in the display order.
**Validates: Requirements 2.5**

### Property 6: Form validation rejects empty required fields
*For any* job form submission where title or company is empty or contains only whitespace, the submission should be rejected and validation errors should be displayed.
**Validates: Requirements 3.3**

### Property 7: Successful creation adds job to list
*For any* valid job creation input, after successful API response the job list should contain a job with matching title and company.
**Validates: Requirements 3.2**

### Property 8: Optimistic update rollback on failure
*For any* optimistic update (create, update, or status change) that fails, the UI should revert to the previous state and display an error notification.
**Validates: Requirements 3.5, 5.5**

### Property 9: Edit form pre-population
*For any* job, when opening the edit form the form fields should contain values matching the job's current data.
**Validates: Requirements 4.3**

### Property 10: Deletion removes job from list
*For any* job deletion that succeeds, the job list should no longer contain a job with that ID.
**Validates: Requirements 4.6**

### Property 11: Status buttons availability
*For any* job detail view, status update buttons should be available for all six JobStatus values.
**Validates: Requirements 5.1**

### Property 12: Accepted status triggers offer form
*For any* status change to ACCEPTED, the offer details form should be displayed.
**Validates: Requirements 5.3**

### Property 13: Multiple accepted jobs conflict handling
*For any* attempt to accept a job when another job is already ACCEPTED, a confirmation dialog should be displayed.
**Validates: Requirements 5.4**

### Property 14: Daily progress calculation
*For any* set of jobs, the daily progress should equal the count of jobs created today divided by the daily goal, displayed as both a count and a progress bar.
**Validates: Requirements 6.5**

### Property 15: Goal validation bounds
*For any* daily goal input, values less than 1 or greater than 50 should be rejected.
**Validates: Requirements 6.3**

### Property 16: Notes sorted by update time
*For any* list of notes, they should be sorted by updatedAt in descending order (most recent first).
**Validates: Requirements 8.1**

### Property 17: Tasks sorted by status and due date
*For any* list of tasks, PENDING tasks should appear before COMPLETED tasks, and within each status group tasks should be sorted by due date ascending.
**Validates: Requirements 9.1**

### Property 18: Task status toggle
*For any* task, tapping the checkbox should toggle the status between PENDING and COMPLETED.
**Validates: Requirements 9.4**

### Property 19: Habit completion creates entry
*For any* habit completion action, a HabitEntry should be created for today's date and the streak count should be updated.
**Validates: Requirements 10.3**

### Property 20: Completed habit disables button
*For any* habit that has been completed today, the complete button should be disabled.
**Validates: Requirements 10.6**

### Property 21: Sort option changes list order
*For any* sort option selection (date, title, company), the job list should be reordered according to that criterion.
**Validates: Requirements 11.2**

### Property 22: Preferences persistence
*For any* UI preference change (sort, view mode), the preference should be persisted and restored on app restart.
**Validates: Requirements 11.4**

### Property 23: Offline displays cached data
*For any* network disconnection, the app should display the last successfully fetched data.
**Validates: Requirements 12.1**

### Property 24: Theme matches system preference
*For any* system theme setting (light or dark), the app theme should match the system preference.
**Validates: Requirements 13.1**

### Property 25: Loading shows skeleton
*For any* data fetch operation, skeleton loading states should be displayed while loading is in progress.
**Validates: Requirements 14.3**

### Property 26: 401 response triggers sign-out
*For any* API response with status 401, the stored token should be cleared and the app should navigate to sign-in.
**Validates: Requirements 16.1**

### Property 27: Auth token in request headers
*For any* authenticated API request, the Authorization header should contain the stored JWT token.
**Validates: Requirements 16.4**

### Property 28: API response serialization round-trip
*For any* valid Job, Note, Task, or Habit object, serializing to JSON for API request and then deserializing the response should produce an equivalent object with all date fields correctly parsed.
**Validates: Requirements 17.3**

## Error Handling

### Network Errors
- Display offline indicator when network is unavailable
- Show cached data with stale indicator
- Provide retry button for failed requests
- Queue mutations for retry when online (optional enhancement)

### Authentication Errors
- 401 responses trigger automatic sign-out
- Token refresh failures redirect to sign-in
- Clear error messages for OAuth failures

### Validation Errors
- Inline field validation with error messages
- Prevent form submission until errors resolved
- Highlight invalid fields with red border

### Server Errors
- Display user-friendly error messages
- Log detailed errors for debugging
- Provide retry option where appropriate

### Optimistic Update Failures
- Revert UI to previous state
- Display error toast notification
- Preserve user input for retry

## Testing Strategy

### Property-Based Testing Library
The application will use **fast-check** for property-based testing, consistent with the web application's testing approach.

### Unit Testing
Unit tests will cover:
- Utility functions (date formatting, validation)
- Store actions and selectors
- API response transformers
- Component rendering with specific props

### Property-Based Testing
Property tests will verify the correctness properties defined above. Each property test will:
- Run a minimum of 100 iterations
- Use generators for random valid inputs
- Tag tests with the property number and requirements reference

Example property test structure:
```typescript
import * as fc from 'fast-check';

// **Feature: job-tracker-mobile, Property 3: Job grouping by status is accurate**
// **Validates: Requirements 2.2, 7.2**
describe('Job grouping', () => {
  it('should group jobs accurately by status', () => {
    fc.assert(
      fc.property(
        fc.array(jobArbitrary, { minLength: 0, maxLength: 50 }),
        (jobs) => {
          const grouped = groupJobsByStatus(jobs);
          
          // Each group contains only jobs with that status
          for (const status of Object.values(JobStatus)) {
            const group = grouped[status] || [];
            expect(group.every(job => job.status === status)).toBe(true);
          }
          
          // Total count equals original list length
          const totalCount = Object.values(grouped).reduce(
            (sum, group) => sum + group.length, 0
          );
          expect(totalCount).toBe(jobs.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing
Integration tests will cover:
- Navigation flows between screens
- API integration with mock server
- Authentication flow end-to-end
- Offline/online transitions

### Test File Organization
```
__tests__/
├── unit/
│   ├── utils/
│   │   ├── date.test.ts
│   │   └── validation.test.ts
│   ├── store/
│   │   ├── authStore.test.ts
│   │   └── uiStore.test.ts
│   └── services/
│       └── apiTransformers.test.ts
├── property/
│   ├── jobGrouping.property.test.ts
│   ├── formValidation.property.test.ts
│   ├── sorting.property.test.ts
│   ├── serialization.property.test.ts
│   └── authentication.property.test.ts
└── integration/
    ├── auth.integration.test.ts
    ├── jobs.integration.test.ts
    └── navigation.integration.test.ts
```

### Test Commands
```bash
# Run all tests
npm test

# Run property tests only
npm run test:property

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```
