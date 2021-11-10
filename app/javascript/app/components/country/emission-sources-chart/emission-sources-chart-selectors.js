/* eslint-disable no-confusing-arrow */
import { createSelector } from 'reselect';
import { INDICATOR_SLUGS } from 'data/constants';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import isEmpty from 'lodash/isEmpty';

// This depends on the country-ghg-emissions-actions fetch
const getMeta = state =>
  (state.ghgEmissionsMeta && state.ghgEmissionsMeta.meta) || null;
const getCountries = state => (state.countries && state.countries.data) || null;

const getData = state => (state.emissions && state.emissions.data) || null;
const getIso = (state, props) => (props && props.iso) || null;
const getIndicators =
  (state => state.ndcs && state.ndcs.data && state.ndcs.data.indicators) ||
  null;

export const getEmissionsIndicator = createSelector(
  [getIndicators],
  indicators => {
    if (!indicators) return null;
    return indicators.find(i => i.slug === INDICATOR_SLUGS.emissions) || null;
  }
);

export const getCountryNames = createSelector(
  [getCountries],
  countries =>
    (countries &&
      countries.reduce(
        (acc, current) => ({
          ...acc,
          [current.iso_code3]: current.wri_standard_name
        }),
        {}
      )) ||
    null
);

export const getEmissions = createSelector(
  [getIso, getEmissionsIndicator],
  (iso, indicator) => {
    if (!indicator || !iso) return null;
    const colors = ['#045480', '#0877B3', '#02A0CA', '#02B4D2', '#89DDEA'];
    const locations = Object.entries(indicator.locations).map(
      ([emissionsIso, values]) => ({
        iso: emissionsIso,
        percentage: parseFloat(values.value),
        ...(emissionsIso === iso ? { current: true } : {})
      })
    );
    return sortBy(locations, 'percentage')
      .reverse()
      .map((location, i) => ({
        ...location,
        color: colors[i] || '#cccdcf' // gray2 as others
      }));
  }
);

export const getOtherParties = createSelector([getEmissions], emissions => {
  if (!emissions) return null;
  // eslint-disable-next-line no-confusing-arrow
  const otherCountriesPercentageSum = emissions.reduce(
    (acc, curr, i) => (i > 5 ? acc + curr.percentage : acc),
    0
  );
  return {
    number: emissions.length + 1 - 5, // 5 countries with color
    percentage: Math.round(otherCountriesPercentageSum * 100) / 100
  };
});

export const getEmissionProviderFilters = createSelector(
  [getMeta, getIso],
  (meta, iso) => {
    if (!meta || !iso || isEmpty(meta)) return null;
    const allGhgGas = meta.gas.find(g => g.label === 'All GHG');
    const CaitSource = meta.data_source.find(g => g.name === 'CAIT');
    return {
      gas: allGhgGas && allGhgGas.value,
      location: iso,
      source: CaitSource && CaitSource.value
    };
  }
);

export const getSectorData = createSelector(
  [getData, getMeta],
  (data, meta) => {
    if (!data || !data.length || !meta || isEmpty(meta)) return [];

    const colors = {
      Energy: '#F36C34',
      Agriculture: '#F6C12E',
      'Industrial Processes': '#F281A1',
      'Land Use': '#709EA1'
    };

    const notAggregatedSectors = uniq(
      meta.sector
        .map(
          s =>
            !s.parentId &&
            s.label !== 'Bunker Fuels' &&
            !s.aggregatedSectorIds.length &&
            s.label
        )
        .filter(Boolean)
    );
    let totalValue = 0;
    const emissionData = data
      .filter(d => notAggregatedSectors.includes(d.sector))
      .map(d => {
        const lastEmission = d.emissions[d.emissions.length - 1];
        const emission = lastEmission && lastEmission.value;
        if (emission) {
          totalValue += emission;
        }
        return {
          sector: d.sector,
          emission: lastEmission && lastEmission.value,
          color: colors[d.sector] || '#cccdcf' // gray2 as others
        };
      });
    return sortBy(emissionData, 'emission')
      .reverse()
      .map(d => ({
        ...d,
        percentage: d.emission && (100 * d.emission) / totalValue
      }));
  }
);
