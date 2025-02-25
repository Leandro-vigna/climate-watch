export const initialState = {
  loading: false,
  loaded: false,
  error: false,
  data: {}
};

const setLoading = (state, loading) => ({ ...state, loading });
const setError = (state, error) => ({ ...state, error });
const setLoaded = (state, loaded) => ({ ...state, loaded });

export default {
  fetchNDCSInit: state => setLoading(state, true),
  // eslint-disable-next-line no-confusing-arrow
  fetchNDCSReady: (state, { payload }) =>
    !state.data || !payload
      ? null
      : setLoaded(
        setLoading(
          {
            ...state,
            data: {
              categories: payload.categories,
              sectors: payload.sectors,
              indicators: payload.indicators
            }
          },
          false
        ),
        true
      ),
  fetchNDCSFail: state => setError(state, true)
};
