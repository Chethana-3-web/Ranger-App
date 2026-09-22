/**
 * Tests for FakeConnectivityMonitor
 *
 * Validates test double for connectivity monitoring.
 */

import { FakeConnectivityMonitor } from '../FakeConnectivityMonitor';

describe('FakeConnectivityMonitor', () => {
  test('isOnline_initialState_returnsTrue', () => {
    // Arrange
    const monitor = FakeConnectivityMonitor(true);

    // Act
    const result = monitor.isOnline();

    // Assert
    expect(result).toBe(true);
  });

  test('isOnline_initializedOffline_returnsFalse', () => {
    // Arrange
    const monitor = FakeConnectivityMonitor(false);

    // Act
    const result = monitor.isOnline();

    // Assert
    expect(result).toBe(false);
  });

  test('subscribe_listenerCalled_withInitialState', () => {
    // Arrange
    const monitor = FakeConnectivityMonitor(true);
    const listener = jest.fn();

    // Act
    monitor.subscribe(listener);

    // Assert
    expect(listener).toHaveBeenCalledWith(true);
  });

  test('setOnline_stateChanged_notifiesListeners', () => {
    // Arrange
    const monitor = FakeConnectivityMonitor(true);
    const listener = jest.fn();
    monitor.subscribe(listener);
    listener.mockClear(); // Reset after initial call

    // Act
    monitor.setOnline(false);

    // Assert
    expect(listener).toHaveBeenCalledWith(false);
    expect(monitor.isOnline()).toBe(false);
  });

  test('setOnline_noChange_doesNotNotify', () => {
    // Arrange
    const monitor = FakeConnectivityMonitor(true);
    const listener = jest.fn();
    monitor.subscribe(listener);
    listener.mockClear();

    // Act
    monitor.setOnline(true); // Same as initial

    // Assert
    expect(listener).not.toHaveBeenCalled();
  });

  test('unsubscribe_afterUnsubscribe_listenerNotCalled', () => {
    // Arrange
    const monitor = FakeConnectivityMonitor(true);
    const listener = jest.fn();
    const unsubscribe = monitor.subscribe(listener);
    listener.mockClear();

    // Act
    unsubscribe();
    monitor.setOnline(false);

    // Assert
    expect(listener).not.toHaveBeenCalled();
  });
});
