/**
 * Ranger App – Dependency Injection Container
 *
 * Simple service locator / composition root.
 * Use: container.register(name, factory); later container.resolve(name).
 */

class DIContainer {
  constructor() {
    this.factories = new Map();
    this.singletons = new Map();
  }

  /**
   * Register a service factory (called on each resolve).
   *
   * @param {string} name
   * @param {() => any} factory
   */
  register(name, factory) {
    if (typeof factory !== 'function') {
      throw new Error(`[DIContainer] factory for "${name}" must be a function`);
    }
    this.factories.set(name, factory);
  }

  /**
   * Register a singleton (created once, cached).
   *
   * @param {string} name
   * @param {any} instance
   */
  singleton(name, instance) {
    this.singletons.set(name, instance);
  }

  /**
   * Resolve a service.
   *
   * @param {string} name
   * @returns {any}
   * @throws if not found
   */
  resolve(name) {
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`[DIContainer] service "${name}" not found`);
    }

    return factory();
  }

  /**
   * Check if a service is registered.
   *
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this.singletons.has(name) || this.factories.has(name);
  }
}

/**
 * Create a new DI container.
 *
 * @returns {DIContainer}
 */
export function createContainer() {
  return new DIContainer();
}

export default { createContainer };
