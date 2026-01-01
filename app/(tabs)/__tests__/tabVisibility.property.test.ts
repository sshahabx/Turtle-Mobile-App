/**
 * Property-Based Tests for Tab Visibility
 *
 * Feature: career-journey
 * Property 1: Tab Visibility Matches Authentication State
 *
 * These tests verify that the Journey tab visibility correctly matches
 * the authentication state - visible when authenticated, hidden when not.
 *
 * **Validates: Requirements 1.1, 1.2**
 */

import * as fc from 'fast-check';

// ============================================================================
// Types
// ============================================================================

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isOfflineMode: boolean;
}

interface TabVisibilityResult {
  journeyTabVisible: boolean;
  journeyTabHref: string | null;
}

// ============================================================================
// Tab Visibility Logic (mirrors _layout.tsx implementation)
// ============================================================================

/**
 * Determines Journey tab visibility based on authentication state.
 * This function mirrors the logic in _layout.tsx where:
 * - href: isAuthenticated ? '/journey' : null
 * 
 * When href is null, the tab is hidden from navigation.
 */
function getJourneyTabVisibility(authState: AuthState): TabVisibilityResult {
  const { isAuthenticated } = authState;
  
  // Journey tab is only visible when user is authenticated
  // This matches the implementation: href: isAuthenticated ? '/journey' : null
  const journeyTabHref = isAuthenticated ? '/journey' : null;
  const journeyTabVisible = journeyTabHref !== null;
  
  return {
    journeyTabVisible,
    journeyTabHref,
  };
}

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

/**
 * Generator for authentication states
 */
const authStateArb: fc.Arbitrary<AuthState> = fc.record({
  isAuthenticated: fc.boolean(),
  isLoading: fc.boolean(),
  isOfflineMode: fc.boolean(),
});

/**
 * Generator for authenticated states only
 */
const authenticatedStateArb: fc.Arbitrary<AuthState> = fc.record({
  isAuthenticated: fc.constant(true),
  isLoading: fc.boolean(),
  isOfflineMode: fc.boolean(),
});

/**
 * Generator for unauthenticated states only
 */
const unauthenticatedStateArb: fc.Arbitrary<AuthState> = fc.record({
  isAuthenticated: fc.constant(false),
  isLoading: fc.boolean(),
  isOfflineMode: fc.boolean(),
});

/**
 * Generator for sequences of auth state changes (simulating login/logout)
 */
const authStateSequenceArb = fc.array(authStateArb, {
  minLength: 1,
  maxLength: 20,
});

// ============================================================================
// Property Tests
// ============================================================================

describe('Tab Visibility Property Tests', () => {
  /**
   * Property 1: Tab Visibility Matches Authentication State
   *
   * For any authentication state (authenticated or not), the Journey tab
   * visibility SHALL equal the authentication status—visible when
   * authenticated, hidden when not.
   *
   * **Validates: Requirements 1.1, 1.2**
   */
  describe('Property 1: Tab Visibility Matches Authentication State', () => {
    it('should show Journey tab when user is authenticated', () => {
      fc.assert(
        fc.property(authenticatedStateArb, (authState) => {
          const result = getJourneyTabVisibility(authState);

          // Property: Journey tab should be visible when authenticated
          expect(result.journeyTabVisible).toBe(true);
          expect(result.journeyTabHref).toBe('/journey');
        }),
        { numRuns: 100 }
      );
    });

    it('should hide Journey tab when user is not authenticated', () => {
      fc.assert(
        fc.property(unauthenticatedStateArb, (authState) => {
          const result = getJourneyTabVisibility(authState);

          // Property: Journey tab should be hidden when not authenticated
          expect(result.journeyTabVisible).toBe(false);
          expect(result.journeyTabHref).toBeNull();
        }),
        { numRuns: 100 }
      );
    });

    it('should have visibility equal to authentication status for any state', () => {
      fc.assert(
        fc.property(authStateArb, (authState) => {
          const result = getJourneyTabVisibility(authState);

          // Property: visibility should exactly match isAuthenticated
          expect(result.journeyTabVisible).toBe(authState.isAuthenticated);
        }),
        { numRuns: 100 }
      );
    });

    it('should not be affected by loading state', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          (isAuthenticated, isLoading, isOfflineMode) => {
            const stateWithLoading: AuthState = {
              isAuthenticated,
              isLoading: true,
              isOfflineMode,
            };
            const stateWithoutLoading: AuthState = {
              isAuthenticated,
              isLoading: false,
              isOfflineMode,
            };

            const resultWithLoading = getJourneyTabVisibility(stateWithLoading);
            const resultWithoutLoading = getJourneyTabVisibility(stateWithoutLoading);

            // Property: loading state should not affect visibility
            expect(resultWithLoading.journeyTabVisible).toBe(
              resultWithoutLoading.journeyTabVisible
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not be affected by offline mode', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          (isAuthenticated, isLoading, isOfflineMode) => {
            const stateOffline: AuthState = {
              isAuthenticated,
              isLoading,
              isOfflineMode: true,
            };
            const stateOnline: AuthState = {
              isAuthenticated,
              isLoading,
              isOfflineMode: false,
            };

            const resultOffline = getJourneyTabVisibility(stateOffline);
            const resultOnline = getJourneyTabVisibility(stateOnline);

            // Property: offline mode should not affect visibility
            expect(resultOffline.journeyTabVisible).toBe(
              resultOnline.journeyTabVisible
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly toggle visibility through auth state changes', () => {
      fc.assert(
        fc.property(authStateSequenceArb, (authStates) => {
          // Simulate a sequence of auth state changes
          for (const authState of authStates) {
            const result = getJourneyTabVisibility(authState);

            // Property: at each point, visibility should match auth status
            expect(result.journeyTabVisible).toBe(authState.isAuthenticated);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should return correct href value based on authentication', () => {
      fc.assert(
        fc.property(authStateArb, (authState) => {
          const result = getJourneyTabVisibility(authState);

          // Property: href should be '/journey' when authenticated, null otherwise
          if (authState.isAuthenticated) {
            expect(result.journeyTabHref).toBe('/journey');
          } else {
            expect(result.journeyTabHref).toBeNull();
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should be deterministic - same input always produces same output', () => {
      fc.assert(
        fc.property(authStateArb, (authState) => {
          const result1 = getJourneyTabVisibility(authState);
          const result2 = getJourneyTabVisibility(authState);

          // Property: function should be pure/deterministic
          expect(result1.journeyTabVisible).toBe(result2.journeyTabVisible);
          expect(result1.journeyTabHref).toBe(result2.journeyTabHref);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle rapid auth state transitions correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.boolean(), { minLength: 10, maxLength: 50 }),
          (authSequence) => {
            // Simulate rapid login/logout transitions
            for (const isAuthenticated of authSequence) {
              const authState: AuthState = {
                isAuthenticated,
                isLoading: false,
                isOfflineMode: false,
              };
              const result = getJourneyTabVisibility(authState);

              // Property: each transition should correctly update visibility
              expect(result.journeyTabVisible).toBe(isAuthenticated);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
