/**
 * Tests for permissions.js
 * Naming: <method>_<condition>_<expectedResult>
 */

import { canReviewCameraTraps } from '../permissions';

describe('canReviewCameraTraps', () => {
  test('canReviewCameraTraps_parkManager_returnsTrue', () => {
    expect(canReviewCameraTraps({ role: 'park_manager' })).toBe(true);
  });

  test.each(['officer', 'community', 'admin', 'researcher'])(
    'canReviewCameraTraps_%s_returnsFalse',
    (role) => {
      expect(canReviewCameraTraps({ role })).toBe(false);
    }
  );

  test('canReviewCameraTraps_noUser_returnsFalse', () => {
    expect(canReviewCameraTraps(null)).toBe(false);
    expect(canReviewCameraTraps(undefined)).toBe(false);
  });

  test('canReviewCameraTraps_userWithoutRole_returnsFalse', () => {
    expect(canReviewCameraTraps({})).toBe(false);
  });
});
