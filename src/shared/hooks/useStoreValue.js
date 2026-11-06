import { useEffect, useState } from 'react';
import { onChange } from '../../services/events';

/**
 * Re-reads a value from the repository whenever storage changes, in this tab
 * or another one. `read` must be stable (wrap it in useCallback); when it
 * changes, the value is re-read during render instead of inside an effect.
 */
export function useStoreValue(read) {
  const [state, setState] = useState(() => ({ read, value: read() }));

  if (state.read !== read) {
    setState({ read, value: read() });
  }

  useEffect(() => onChange(() => setState({ read, value: read() })), [read]);

  return state.read === read ? state.value : read();
}
