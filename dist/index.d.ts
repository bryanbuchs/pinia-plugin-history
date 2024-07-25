import { PiniaPluginContext, Store } from 'pinia'
import { ComputedRef } from 'vue'
declare module 'pinia' {
  interface DefineStoreOptionsBase<S, Store> {
    history?: boolean | Partial<HistoryPluginOptions>
  }
  function defineStore<
    Id extends string,
    S extends StateTree = {},
    G extends _GettersTree<S> = {},
    A = {},
    H = false
  >(
    id: Id,
    options: Omit<DefineStoreOptions<Id, S, G, A>, 'id'> & {
      history: H
    }
  ): H extends false
    ? StoreDefinition<Id, S, G, A>
    : StoreDefinition<Id, S, G & HistoryPluginGetters, A & HistoryPluginActions>
  function defineStore<
    Id extends string,
    S extends StateTree = {},
    G extends _GettersTree<S> = {},
    A = {},
    H = false
  >(
    options: DefineStoreOptions<Id, S, G, A> & {
      history: H
    }
  ): H extends false
    ? StoreDefinition<Id, S, G, A>
    : StoreDefinition<Id, S, G & HistoryPluginGetters, A & HistoryPluginActions>
  function defineStore<Id extends string, SS, H = false>(
    id: Id,
    storeSetup: () => SS,
    options?: DefineSetupStoreOptions<
      Id,
      StoreState<SS>,
      StoreGetters<SS>,
      StoreActions<SS>
    > & {
      history: H
    }
  ): H extends false
    ? StoreDefinition<Id, StoreState<SS>, StoreGetters<SS>, StoreActions<SS>>
    : StoreDefinition<
        Id,
        StoreState<SS>,
        StoreGetters<SS> & HistoryPluginGetters,
        StoreActions<SS> & HistoryPluginActions
      >
}
export interface HistoryPluginOptions {
  max: number
  persistent: boolean
  omit: Array<string>
  persistentStrategy: {
    get(store: HistoryStore, type: 'undo' | 'redo'): string[] | undefined
    set(store: HistoryStore, type: 'undo' | 'redo', value: string[]): void
    remove(store: HistoryStore, type: 'undo' | 'redo'): void
  }
}
export interface HistoryPluginActions {
  undo(): void
  redo(): void
}
export interface HistoryPluginGetters {
  canUndo: ComputedRef<boolean>
  canRedo: ComputedRef<boolean>
}
export interface History extends HistoryPluginOptions {
  done: string[]
  undone: string[]
  current: string
  preventUpdateOnSubscribe: boolean
}
export interface HistoryStore
  extends Store,
    HistoryPluginGetters,
    HistoryPluginActions {}
/**
 * Base options for the history.
 */
export declare const BasePiniaHistoryOptions: {
  max: number
  persistent: boolean
  omit: never[]
  persistentStrategy: {
    get(store: HistoryStore, type: 'undo' | 'redo'): string[] | undefined
    set(store: HistoryStore, type: 'undo' | 'redo', value: string[]): void
    remove(store: HistoryStore, type: 'undo' | 'redo'): void
  }
}
/**
 * Create a key for storing history state.
 *
 * @param store
 * @param method
 * @returns
 */
export declare function persistentKey(
  store: Store,
  method: 'undo' | 'redo'
): `pinia-plugin-history-${string}-undo` | `pinia-plugin-history-${string}-redo`
/**
 * Adds a `history` option to your store to add `undo` and `redo` methods
 * and manage your state history.
 *
 * @example
 *
 * ```ts
 * import { PiniaHistory } from 'pinia-plugin-history'
 *
 * // Pass the plugin to your application's pinia plugin
 * pinia.use(PiniaHistory)
 * ```
 */
export declare const PiniaHistory: ({
  options,
  store,
}: PiniaPluginContext) => void
//# sourceMappingURL=index.d.ts.map
