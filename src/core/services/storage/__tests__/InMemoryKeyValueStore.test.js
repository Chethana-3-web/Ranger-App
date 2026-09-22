/**
 * Tests for InMemoryKeyValueStore
 *
 * Validates ephemeral storage contract.
 */

import { InMemoryKeyValueStore } from '../InMemoryKeyValueStore';

describe('InMemoryKeyValueStore', () => {
  let store;

  beforeEach(() => {
    store = InMemoryKeyValueStore();
  });

  test('set_putValue_canRetrieve', async () => {
    // Arrange
    const key = 'test-key';
    const value = { id: 1, name: 'Test' };

    // Act
    const setResult = await store.set(key, value);
    const getResult = await store.get(key);

    // Assert
    expect(setResult).toBe(true);
    expect(getResult).toEqual(value);
  });

  test('get_keyNotFound_returnsNull', async () => {
    // Act
    const result = await store.get('nonexistent');

    // Assert
    expect(result).toBeNull();
  });

  test('remove_existingKey_deletesValue', async () => {
    // Arrange
    await store.set('key', { data: 'value' });

    // Act
    const removeResult = await store.remove('key');
    const getResult = await store.get('key');

    // Assert
    expect(removeResult).toBe(true);
    expect(getResult).toBeNull();
  });

  test('clear_afterClear_allValuesGone', async () => {
    // Arrange
    await store.set('key1', { a: 1 });
    await store.set('key2', { b: 2 });

    // Act
    await store.clear();
    const result1 = await store.get('key1');
    const result2 = await store.get('key2');

    // Assert
    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  test('set_overwrite_replacesValue', async () => {
    // Arrange
    await store.set('key', 'old');

    // Act
    await store.set('key', 'new');
    const result = await store.get('key');

    // Assert
    expect(result).toBe('new');
  });
});
