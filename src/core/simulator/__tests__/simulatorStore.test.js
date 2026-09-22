/**
 * Tests for SimulatorStore
 *
 * Validates fault injection store for dev/testing.
 */

import simulatorStore from '../simulatorStore';

describe('simulatorStore', () => {
  afterEach(() => {
    simulatorStore.reset();
  });

  test('get_defaultValue_returnsExpected', () => {
    // Act
    const gpsAvailable = simulatorStore.get('gpsAvailable');

    // Assert
    expect(gpsAvailable).toBe(true);
  });

  test('set_changesValue_reflected', () => {
    // Act
    simulatorStore.set('gpsAvailable', false);
    const result = simulatorStore.get('gpsAvailable');

    // Assert
    expect(result).toBe(false);
  });

  test('subscribe_onStateChange_notifiesListener', () => {
    // Arrange
    const listener = jest.fn();
    simulatorStore.subscribe(listener);

    // Act
    simulatorStore.set('gpsAvailable', false);

    // Assert
    expect(listener).toHaveBeenCalledWith('gpsAvailable', false);
  });

  test('subscribe_multipleListeners_allNotified', () => {
    // Arrange
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    simulatorStore.subscribe(listener1);
    simulatorStore.subscribe(listener2);

    // Act
    simulatorStore.set('networkOverride', 'offline');

    // Assert
    expect(listener1).toHaveBeenCalledWith('networkOverride', 'offline');
    expect(listener2).toHaveBeenCalledWith('networkOverride', 'offline');
  });

  test('unsubscribe_afterUnsubscribe_listenerNotCalled', () => {
    // Arrange
    const listener = jest.fn();
    const unsubscribe = simulatorStore.subscribe(listener);

    // Act
    unsubscribe();
    simulatorStore.set('serverUp', false);

    // Assert
    expect(listener).toHaveBeenCalledTimes(0);
  });

  test('set_sameValue_doesNotNotify', () => {
    // Arrange
    const listener = jest.fn();
    simulatorStore.subscribe(listener);
    listener.mockClear(); // Clear initial call

    // Act
    simulatorStore.set('gpsAvailable', true); // Same as default

    // Assert
    expect(listener).not.toHaveBeenCalled();
  });

  test('reset_restoredToDefaults', () => {
    // Arrange
    simulatorStore.set('gpsAvailable', false);
    simulatorStore.set('networkOverride', 'offline');

    // Act
    simulatorStore.reset();

    // Assert
    expect(simulatorStore.get('gpsAvailable')).toBe(true);
    expect(simulatorStore.get('networkOverride')).toBe('auto');
    expect(simulatorStore.get('cameraAvailable')).toBe(true);
    expect(simulatorStore.get('serverUp')).toBe(true);
  });
});
