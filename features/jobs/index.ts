/**
 * Jobs Feature Module
 */

export { useJobs } from './hooks/useJobs';
export { useJob } from './hooks/useJob';
export {
  groupJobsByStatus,
  getAcceptedJob,
  sortJobs,
  STATUS_DISPLAY_ORDER,
} from './utils/jobUtils';

// Platform utilities
export {
  PREDEFINED_PLATFORMS,
  PLATFORM_OPTIONS,
  isPredefinedPlatform,
  getPlatformSelection,
  getFinalPlatformValue,
} from './utils/platformUtils';
export type { PredefinedPlatform, PlatformOption, PlatformSelection } from './utils/platformUtils';

// Salary utilities
export {
  CURRENCY_OPTIONS,
  CURRENCY_SYMBOLS,
  SALARY_RANGES,
  detectCurrencyFromString,
  matchSalaryToRange,
  parseSalaryString,
  formatSalary,
  getSalaryRangesForCurrency,
  isValidCurrency,
} from './utils/salaryUtils';
export type { Currency, DropdownOption, ParsedSalary } from './utils/salaryUtils';

// Status workflow utilities
export {
  determineStatusWorkflow,
  requiresWorkflowHandling,
} from './utils/statusWorkflow';
export type { StatusWorkflowResult } from './utils/statusWorkflow';
