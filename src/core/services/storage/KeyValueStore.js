/**
 * Ranger App – KeyValueStore Contract
 *
 * Abstract contract for typed, namespaced key-value storage.
 * Implementations: AsyncStorageKeyValueStore (persistent), InMemoryKeyValueStore (tests).
 */

/**
 * @typedef {Object} KeyValueStore
 * @property {(key: string) => Promise<any|null>} get
 * @property {(key: string, value: any) => Promise<boolean>} set
 * @property {(key: string) => Promise<boolean>} remove
 * @property {() => Promise<void>} clear
 */

export default {};
