/**
 * Tests for DI Container
 *
 * Validates service registration and resolution.
 */

import { createContainer } from '../container';

describe('DIContainer', () => {
  let container;

  beforeEach(() => {
    container = createContainer();
  });

  test('register_factory_resolvesNewInstance', () => {
    // Arrange
    const factory = () => ({ id: 'test' });
    container.register('service', factory);

    // Act
    const result = container.resolve('service');

    // Assert
    expect(result).toEqual({ id: 'test' });
  });

  test('register_factoryCalledTwice_returnsDifferentInstances', () => {
    // Arrange
    const factory = () => ({ rand: Math.random() });
    container.register('service', factory);

    // Act
    const first = container.resolve('service');
    const second = container.resolve('service');

    // Assert
    expect(first).not.toBe(second);
  });

  test('singleton_storesSingleInstance', () => {
    // Arrange
    const instance = { id: 'singleton' };
    container.singleton('service', instance);

    // Act
    const first = container.resolve('service');
    const second = container.resolve('service');

    // Assert
    expect(first).toBe(instance);
    expect(second).toBe(instance);
    expect(first).toBe(second);
  });

  test('resolve_notFound_throws', () => {
    // Act & Assert
    expect(() => container.resolve('nonexistent')).toThrow(
      '[DIContainer] service "nonexistent" not found'
    );
  });

  test('register_nonFunction_throws', () => {
    // Act & Assert
    expect(() => container.register('service', 'not-a-function')).toThrow(
      '[DIContainer] factory for "service" must be a function'
    );
  });

  test('has_registeredService_returnsTrue', () => {
    // Arrange
    container.register('service', () => ({}));

    // Act
    const result = container.has('service');

    // Assert
    expect(result).toBe(true);
  });

  test('has_unregisteredService_returnsFalse', () => {
    // Act
    const result = container.has('nonexistent');

    // Assert
    expect(result).toBe(false);
  });

  test('has_singleton_returnsTrue', () => {
    // Arrange
    container.singleton('service', {});

    // Act
    const result = container.has('service');

    // Assert
    expect(result).toBe(true);
  });
});
