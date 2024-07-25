import { computed, reactive } from 'vue'
import { stringify, parse } from '@emanimation/js-serial-js'
import lzutf8 from 'lzutf8'
const { compress, decompress } = lzutf8
/**
 * Base options for the history.
 */
export const BasePiniaHistoryOptions = {
  max: 10,
  persistent: false,
  omit: [],
  persistentStrategy: {
    get(store, type) {
      if (typeof localStorage !== undefined) {
        const key = persistentKey(store, type)
        const value = localStorage.getItem(key)
        if (!value) return
        const string = decompress(value, {
          inputEncoding: 'Base64',
        })
        return string.split(',')
      }
    },
    set(store, type, value) {
      if (typeof localStorage !== undefined) {
        const key = persistentKey(store, type)
        const string = value.join(',')
        localStorage.setItem(
          key,
          compress(string, {
            outputEncoding: 'Base64',
          })
        )
      }
    },
    remove(store, type) {
      if (typeof localStorage !== undefined) {
        const key = persistentKey(store, type)
        localStorage.removeItem(key)
      }
    },
  },
}
/**
 * Merge the user options with the default ones.
 *
 * @param options
 * @returns {HistoryPluginOptions}
 */
function mergeOptions(options) {
  return {
    ...BasePiniaHistoryOptions,
    ...(typeof options === 'boolean' ? {} : options),
  }
}
/**
 * Clone store state and remove omitted properties from the store state.
 * @param store The store the plugin is augmenting.
 * @param $history
 * @param state
 * @returns {string} State of the store without omitted keys.
 */
function cloneRemoveOmittedKeys(store, $history, state) {
  const src = !!state ? stringify(state) : stringify(store.$state)
  const clone = parse(src)
  if ($history.omit.length) {
    $history.omit.forEach((key) => {
      delete clone[key]
    })
  }
  return stringify(clone)
}
/**
 * Save the history based on the given persistent strategy.
 *
 * @param store
 * @param $history
 */
function persistHistory(store, $history) {
  const {
    persistent,
    persistentStrategy: { set },
    done,
    undone,
  } = $history
  if (persistent) {
    set(store, 'undo', done)
    set(store, 'redo', undone)
  }
}
/**
 * Create a persistent history.
 *
 * @param $store
 * @param $history
 * @returns
 */
function createPersistentHistory($store, $history) {
  var _a, _b
  const {
    persistent,
    persistentStrategy: { get, set, remove },
  } = $history
  if (persistent) {
    if ($history.done.length === 0) {
      $history.done =
        (_a = get($store, 'undo')) !== null && _a !== void 0 ? _a : []
    } else {
      set($store, 'undo', $history.done)
    }
    if ($history.undone.length === 0) {
      $history.undone =
        (_b = get($store, 'redo')) !== null && _b !== void 0 ? _b : []
    } else {
      set($store, 'redo', $history.undone)
    }
  } else {
    remove($store, 'undo')
    remove($store, 'redo')
  }
}
/**
 * Create an undo/redo method for the given store.
 *
 * @param store
 * @param $history
 * @param method
 * @returns
 */
function createStackMethod($store, $history, method) {
  const can = method === 'undo' ? 'canUndo' : 'canRedo'
  // todo allow a param to be passed to stack methods that allows undo/redo of specific store state props?
  return () => {
    if ($store[can]) {
      const { undone, done, max, current } = $history
      const stack = method === 'undo' ? done : undone
      const reverseStack = method === 'undo' ? undone : done
      const state = stack.pop()
      if (state === undefined) return
      if (reverseStack.length >= max) {
        reverseStack.splice(0, 1)
      }
      reverseStack.push(current)
      $history.preventUpdateOnSubscribe = false
      $store.$patch(Object.assign({}, $store.$state, parse(state)))
      $history.preventUpdateOnSubscribe = true
      persistHistory($store, $history)
    }
  }
}
/**
 * Create the store watcher to save
 * every mutation change.
 *
 * @param $store
 * @param $history
 * @returns
 */
function createWatcher($store, $history) {
  return (_mutation, state) => {
    const { preventUpdateOnSubscribe, max, done, current } = $history
    if (preventUpdateOnSubscribe) {
      if (done.length >= max) {
        done.splice(0, 1)
      }
      done.push(current)
      $history.undone = []
      persistHistory($store, $history)
    }
    $history.current = cloneRemoveOmittedKeys($store, $history, state)
  }
}
/**
 * Create a key for storing history state.
 *
 * @param store
 * @param method
 * @returns
 */
export function persistentKey(store, method) {
  return `pinia-plugin-history-${store.$id}-${method}`
}
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
export const PiniaHistory = ({ options, store }) => {
  const { history } = options
  if (history) {
    const { max, omit, persistent, persistentStrategy } = mergeOptions(history)
    const $store = store
    const $history = reactive({
      max,
      omit,
      persistent,
      persistentStrategy,
      done: [],
      undone: [],
      current: '',
      preventUpdateOnSubscribe: true,
      resetUndone: false,
    })
    $history.current = cloneRemoveOmittedKeys($store, $history)
    store.canUndo = computed(() => $history.done.length > 0)
    store.canRedo = computed(() => $history.undone.length > 0)
    store.undo = createStackMethod($store, $history, 'undo')
    store.redo = createStackMethod($store, $history, 'redo')
    store.$subscribe(createWatcher($store, $history))
    createPersistentHistory($store, $history)
  }
}
//# sourceMappingURL=index.js.map
