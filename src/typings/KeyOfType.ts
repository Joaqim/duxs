/**
 * Gets the keys of a type that match a specified value
 *
 * @template T The type to get the keys from
 * @template V The value to check for in each key of T
 */
export type KeyOfType<T, V> = keyof {
  /**
   * The key of T that has a value of type V
   */
  [P in keyof T as T[P] extends V ? P : never]: any;
};
