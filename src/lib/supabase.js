// No-op Supabase client stub.
//
// Returns a chainable Proxy that resolves to { data: [], error: null, count: 0 }
// when awaited, so any `supabase.from(...).select(...).eq(...)...` chain in the
// codebase resolves without throwing. Architecture.jsx and proposalsStore.js
// rely on this; until a real @supabase/supabase-js client is wired (with
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars), this keeps the build
// green and renders those views with empty data.

const RESULT = Object.freeze({ data: [], error: null, count: 0 });

function chain() {
  return new Proxy(Promise.resolve(RESULT), {
    get(target, prop) {
      if (prop in target) {
        const value = Reflect.get(target, prop, target);
        return typeof value === 'function' ? value.bind(target) : value;
      }
      return () => chain();
    },
  });
}

export const supabase = {
  from() { return chain(); },
  rpc()  { return chain(); },
};

export default supabase;
