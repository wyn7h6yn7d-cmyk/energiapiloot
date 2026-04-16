/**
 * Feature flags for the current product phase.
 *
 * FULL_ACCESS_TEST_MODE:
 * - no paywall / no blur / no locked zones
 * - unlock entitlements are treated as granted (client + server)
 * - report export endpoints return demo-ready responses
 *
 * Flip to `false` when re-introducing Stripe + paid unlocks.
 */
export const FULL_ACCESS_TEST_MODE = true;

