import type { MaybeComputedRef, RemovableRef } from '@vueuse/shared'
import type { StorageOptions } from '../useStorage'
import { useStorage } from '../useStorage'
import { defaultWindow } from '../_configurable'

export function useLocalStorage(key: string, initialValue: MaybeComputedRef<string>, options?: StorageOptions<string>): RemovableRef<string>
export function useLocalStorage(key: string, initialValue: MaybeComputedRef<boolean>, options?: StorageOptions<boolean>): RemovableRef<boolean>
export function useLocalStorage(key: string, initialValue: MaybeComputedRef<number>, options?: StorageOptions<number>): RemovableRef<number>
export function useLocalStorage<T>(key: string, initialValue: MaybeComputedRef<T>, options?: StorageOptions<T>): RemovableRef<T>
export function useLocalStorage<T = unknown>(key: string, initialValue: MaybeComputedRef<null>, options?: StorageOptions<T>): RemovableRef<T>

/**
 * Reactive LocalStorage.
 *
 * @see https://vueuse.org/useLocalStorage
 * @param key
 * @param initialValue
 * @param options
 */
export function useLocalStorage<T extends(string | number | boolean | object | null)>(
  key: string,
  initialValue: MaybeComputedRef<T>,
  options: StorageOptions<T> = {},
): RemovableRef<any> {
  const { window = defaultWindow } = options
  return useStorage(key, initialValue, window?.localStorage, options)
}
