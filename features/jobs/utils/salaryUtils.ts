/**
 * Salary Utility Functions
 * 
 * Provides utility functions for salary parsing, formatting,
 * and currency/range selection in the offer details form.
 * 
 * Requirements:
 * - 2.1: Currency_Selector SHALL provide options for USD, PKR, and GBP
 * - 2.2: Salary_Range_Selector SHALL display ranges appropriate for currency
 * - 2.3: USD ranges: $40,000–$80,000, $80,000–$120,000, etc.
 * - 2.4: PKR ranges: ₨40,000–₨80,000, ₨80,000–₨120,000, etc.
 * - 2.5: GBP ranges: £30,000–£50,000, £50,000–£70,000, etc.
 * - 2.6: Format and store salary string with appropriate currency symbol
 */

/**
 * Supported currency types
 */
export type Currency = 'USD' | 'PKR' | 'GBP';

/**
 * Dropdown option interface for currency and salary selectors
 */
export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
}

/**
 * Currency options with flag emojis
 * Requirements: 2.1
 */
export const CURRENCY_OPTIONS: DropdownOption[] = [
  { value: 'USD', label: 'USD', icon: '🇺🇸' },
  { value: 'PKR', label: 'PKR', icon: '🇵🇰' },
  { value: 'GBP', label: 'GBP', icon: '🇬🇧' },
];

/**
 * Currency symbols mapping
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  PKR: '₨',
  GBP: '£',
};

/**
 * Salary ranges for each currency
 * Requirements: 2.2, 2.3, 2.4, 2.5
 */
export const SALARY_RANGES: Record<Currency, DropdownOption[]> = {
  USD: [
    { value: '40k-80k', label: '$40,000 – $80,000' },
    { value: '80k-120k', label: '$80,000 – $120,000' },
    { value: '120k-160k', label: '$120,000 – $160,000' },
    { value: '160k-250k', label: '$160,000 – $250,000' },
    { value: '250k+', label: '$250,000+' },
  ],
  PKR: [
    { value: '40k-80k', label: '₨40,000 – ₨80,000' },
    { value: '80k-120k', label: '₨80,000 – ₨120,000' },
    { value: '120k-160k', label: '₨120,000 – ₨160,000' },
    { value: '160k-250k', label: '₨160,000 – ₨250,000' },
    { value: '250k+', label: '₨250,000+' },
  ],
  GBP: [
    { value: '30k-50k', label: '£30,000 – £50,000' },
    { value: '50k-70k', label: '£50,000 – £70,000' },
    { value: '70k-90k', label: '£70,000 – £90,000' },
    { value: '90k-120k', label: '£90,000 – £120,000' },
    { value: '120k+', label: '£120,000+' },
  ],
};

/**
 * Parsed salary result interface
 */
export interface ParsedSalary {
  currency: Currency | null;
  range: string | null;
  rawValue: string;
}

/**
 * Detects currency from a salary string based on currency symbol
 * 
 * @param salary - The salary string to analyze
 * @returns The detected currency or null if not recognized
 * 
 * Property 11: Salary Currency Parsing
 * - For any existing salary string containing a recognized currency symbol,
 *   this function returns the corresponding currency
 */
export function detectCurrencyFromString(salary: string): Currency | null {
  if (!salary || salary.trim() === '') {
    return null;
  }
  
  const trimmed = salary.trim();
  
  // Check for currency symbols
  if (trimmed.includes('$')) {
    return 'USD';
  }
  if (trimmed.includes('₨') || trimmed.toLowerCase().includes('pkr')) {
    return 'PKR';
  }
  if (trimmed.includes('£') || trimmed.toLowerCase().includes('gbp')) {
    return 'GBP';
  }
  
  return null;
}

/**
 * Attempts to match a salary string to a predefined range
 * 
 * @param salary - The salary string to match
 * @param currency - The currency to use for range matching
 * @returns The matched range value or null if no match
 */
export function matchSalaryToRange(salary: string, currency: Currency): string | null {
  if (!salary || !currency) {
    return null;
  }
  
  const ranges = SALARY_RANGES[currency];
  
  // Try to find an exact label match
  for (const range of ranges) {
    if (salary.includes(range.label) || range.label.includes(salary.trim())) {
      return range.value;
    }
  }
  
  // Try to extract numbers and match to ranges
  const numbers = salary.match(/[\d,]+/g);
  if (numbers && numbers.length > 0) {
    const firstNumber = parseInt(numbers[0].replace(/,/g, ''), 10);
    
    if (!isNaN(firstNumber)) {
      // Match based on the first number in the salary string
      if (currency === 'GBP') {
        if (firstNumber >= 30000 && firstNumber < 50000) return '30k-50k';
        if (firstNumber >= 50000 && firstNumber < 70000) return '50k-70k';
        if (firstNumber >= 70000 && firstNumber < 90000) return '70k-90k';
        if (firstNumber >= 90000 && firstNumber < 120000) return '90k-120k';
        if (firstNumber >= 120000) return '120k+';
      } else {
        // USD and PKR have the same range structure
        if (firstNumber >= 40000 && firstNumber < 80000) return '40k-80k';
        if (firstNumber >= 80000 && firstNumber < 120000) return '80k-120k';
        if (firstNumber >= 120000 && firstNumber < 160000) return '120k-160k';
        if (firstNumber >= 160000 && firstNumber < 250000) return '160k-250k';
        if (firstNumber >= 250000) return '250k+';
      }
    }
  }
  
  return null;
}

/**
 * Parses a salary string to extract currency and range information
 * 
 * @param salary - The salary string to parse
 * @returns Parsed salary object with currency, range, and raw value
 * 
 * Property 11: Salary Currency Parsing
 * - For any existing salary string containing a recognized currency symbol ($, ₨, £),
 *   the offer details form SHALL pre-select the corresponding currency
 * 
 * Requirements: 5.5
 */
export function parseSalaryString(salary: string): ParsedSalary {
  const rawValue = salary || '';
  
  if (!salary || salary.trim() === '') {
    return {
      currency: null,
      range: null,
      rawValue,
    };
  }
  
  const currency = detectCurrencyFromString(salary);
  const range = currency ? matchSalaryToRange(salary, currency) : null;
  
  return {
    currency,
    range,
    rawValue,
  };
}

/**
 * Formats a salary string from currency and range selection
 * 
 * @param currency - The selected currency
 * @param range - The selected salary range value
 * @returns Formatted salary string with currency symbol
 * 
 * Property 4: Salary Formatting
 * - For any combination of currency and salary range selection,
 *   the formatted salary string SHALL contain the correct currency symbol
 *   and range values
 * 
 * Requirements: 2.6
 */
export function formatSalary(currency: Currency, range: string): string {
  if (!currency || !range) {
    return '';
  }
  
  const ranges = SALARY_RANGES[currency];
  const selectedRange = ranges.find((r) => r.value === range);
  
  if (selectedRange) {
    return selectedRange.label;
  }
  
  // Fallback: construct from range value
  const symbol = CURRENCY_SYMBOLS[currency];
  
  // Parse range value like "40k-80k" or "250k+"
  if (range.endsWith('+')) {
    const value = range.replace('+', '').replace('k', ',000');
    return `${symbol}${value}+`;
  }
  
  const [min, max] = range.split('-');
  const minFormatted = min.replace('k', ',000');
  const maxFormatted = max.replace('k', ',000');
  
  return `${symbol}${minFormatted} – ${symbol}${maxFormatted}`;
}

/**
 * Gets salary ranges for a specific currency
 * 
 * @param currency - The currency to get ranges for
 * @returns Array of salary range options for the currency
 * 
 * Property 3: Currency-Specific Salary Ranges
 * - For any currency selection, the Salary_Range_Selector SHALL display
 *   only the salary ranges defined for that specific currency
 * 
 * Requirements: 2.2
 */
export function getSalaryRangesForCurrency(currency: Currency): DropdownOption[] {
  return SALARY_RANGES[currency] || [];
}

/**
 * Validates if a currency value is valid
 * 
 * @param value - The value to check
 * @returns true if the value is a valid currency
 */
export function isValidCurrency(value: string): value is Currency {
  return ['USD', 'PKR', 'GBP'].includes(value);
}
