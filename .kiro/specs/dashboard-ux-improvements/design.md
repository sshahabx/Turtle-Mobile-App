# Design Document: Dashboard UX Improvements

## Overview

This design improves the mobile dashboard experience by implementing collapsible status sections, global search, navigation fixes, and status update reliability. The architecture follows React Native best practices with Expo Router for navigation, React Query for state management, and a centralized theme system for consistent styling.

## Architecture

The dashboard improvements follow a component-based architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    DashboardScreen                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │              SearchBar Component                 │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │              StatsHeader Component               │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │         CollapsibleStatusSection (x6)            │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │         StatusHeader (tap to toggle)     │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │         JobCard[] (when expanded)        │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### State Management

- **Expanded Sections State**: Local React state (`useState`) tracking which status sections are expanded
- **Search Query State**: Local React state for the current search input
- **Jobs Data**: React Query cache, invalidated on mutations
- **Navigation**: Expo Router with proper back navigation support

## Components and Interfaces

### SearchBar Component

```typescript
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}
```

A controlled input component with search icon, clear button, and debounced input handling.

### CollapsibleStatusSection Component

```typescript
interface CollapsibleStatusSectionProps {
  status: JobStatus;
  jobs: Job[];
  isExpanded: boolean;
  onToggle: () => void;
  onJobPress: (jobId: string) => void;
}
```

Renders a status header with count badge and animated expand/collapse content area.

### Updated JobCard Component

```typescript
interface JobCardProps {
  job: Job;
  onPress: () => void;
  compact?: boolean; // For search results
}
```

Displays job title, company, and relative date. Shows status badge when in search results mode.

### Job Detail Screen Header

```typescript
interface DetailHeaderProps {
  title: string;
  onBack: () => void;
}
```

Header component with back button, title, and optional action buttons.

## Data Models

### Expanded Sections State

```typescript
type ExpandedSections = {
  [K in JobStatus]: boolean;
};

// Default: all collapsed except first non-empty section
const defaultExpandedSections: ExpandedSections = {
  ACCEPTED: false,
  OFFERED: false,
  INTERVIEWING: false,
  APPLIED: false,
  PENDING: false,
  REJECTED: false,
};
```

### Search Filter Logic

```typescript
function filterJobsBySearch(jobs: Job[], query: string): Job[] {
  if (!query.trim()) return jobs;
  
  const lowerQuery = query.toLowerCase();
  return jobs.filter(job => 
    job.title.toLowerCase().includes(lowerQuery) ||
    job.company.toLowerCase().includes(lowerQuery) ||
    (job.notes?.toLowerCase().includes(lowerQuery) ?? false)
  );
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Job Grouping by Status is Accurate

*For any* array of jobs with various statuses, grouping them by status SHALL result in each group containing exactly the jobs with that status, and the sum of all group sizes SHALL equal the total number of jobs.

**Validates: Requirements 1.1, 4.3**

### Property 2: Toggle State Changes Correctly

*For any* expanded/collapsed state and any status section, toggling that section SHALL invert its expanded state while leaving all other sections unchanged.

**Validates: Requirements 1.2**

### Property 3: Status Count Matches Job Count

*For any* status section with N jobs, the displayed count SHALL equal N, regardless of whether the section is expanded or collapsed.

**Validates: Requirements 1.3**

### Property 4: Search Filter Matches on Title, Company, and Notes

*For any* search query and array of jobs, the filtered results SHALL contain exactly the jobs where the query appears as a substring (case-insensitive) in the title, company, OR notes fields. An empty query SHALL return all jobs.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 5: Status Update Persists Correctly

*For any* job and any valid status, updating the job's status SHALL result in the job having the new status when retrieved from storage.

**Validates: Requirements 4.1**

## Error Handling

### Status Update Failures

- Display toast notification with error message
- Maintain previous status in UI (optimistic update rollback)
- Log error for debugging

### Search Edge Cases

- Empty query: Show all jobs grouped by status
- No results: Show friendly empty state with suggestion to adjust search
- Special characters: Escape regex characters to prevent errors

### Navigation Errors

- If job not found on detail screen, show error state with back button
- Handle deep link to non-existent job gracefully

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

- Search with empty query returns all jobs
- Search with no matches returns empty array
- Toggle on collapsed section expands it
- Toggle on expanded section collapses it
- Status display order matches expected priority

### Property-Based Tests

Property-based tests will use fast-check to verify universal properties across many generated inputs:

- **Library**: fast-check (already in project dependencies)
- **Minimum iterations**: 100 per property test
- **Tag format**: Feature: dashboard-ux-improvements, Property N: [property text]

Each correctness property will be implemented as a single property-based test that generates random jobs, queries, and states to verify the property holds universally.

### Integration Tests

- Status update flow: tap status → verify storage → verify UI update
- Navigation flow: dashboard → job detail → back → verify dashboard state
- Search flow: type query → verify filtered results → clear → verify all jobs

## UI/UX Design Details

### Collapsible Section Animation

```typescript
// Use LayoutAnimation for smooth expand/collapse
LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
```

### Search Bar Design

- Positioned below header, above stats
- Subtle background color (backgroundSecondary)
- Search icon on left, clear button on right when text present
- Placeholder: "Search jobs..."
- Debounce input by 300ms to avoid excessive filtering

### Back Navigation Design

- Use Expo Router's built-in back navigation
- Add explicit back button in header for clarity
- Icon: chevron-left or arrow-left
- Touch target: minimum 44x44 points

### Tab Bar Fixes

- Ensure paddingBottom accounts for safe area
- Center icons vertically in tab
- Consistent spacing between icon and label
