import { createSelector } from 'reselect';
import { get } from 'js-lenses';
import _ from 'lodash-inflection';
import _find from 'lodash/find';
// import identity from 'lodash/identity';
import isEmpty from 'lodash/isEmpty';
// import _filter from 'lodash/filter';
// import { format } from 'd3-format';
import {
  processLineData,
  processLegendData,
  processPieData,
  flatMapVis,
  mapFilter
} from './viz-creator-utils';
import * as lenses from './viz-creator-lenses';

export const dataSelector = state => state;
export const datasetsSelector = state => get(lenses.$datasets, state);
export const visualisationsSelector = state =>
  get(lenses.$visualisations, state);
export const locationsSelector = state => get(lenses.$locations, state);
export const modelsSelector = state => get(lenses.$models, state);
export const scenariosSelector = state => get(lenses.$scenarios, state);
export const indicatorsSelector = state => get(lenses.$indicators, state);
export const categoriesSelector = state => get(lenses.$categories, state);
export const subcategoriesSelector = state => get(lenses.$subcategories, state);
export const yearsSelector = state => get(lenses.$years, state);
export const timeseriesSelector = state => get(lenses.$timeseries, state);

export const hasDataSelector = createSelector(
  [timeseriesSelector, scenariosSelector],
  (timeseries, scenarios) =>
    timeseries &&
    !isEmpty(timeseries.data) &&
    scenarios &&
    !isEmpty(scenarios.data)
);

export const vizTypes = data => data && data['viz-types'];
export const vizSelector = createSelector(datasetsSelector, sets =>
  vizTypes(_find(sets.data, { id: sets.selected }))
);

export const legendDataSelector = createSelector(
  [hasDataSelector, timeseriesSelector, scenariosSelector],
  (hasData, timeseries, scenarios) => {
    if (!hasData) return [];
    return processLegendData(timeseries.data, scenarios.data);
  }
);

export const selectedStructureSelector = createSelector(
  [vizSelector, visualisationsSelector, locationsSelector],
  (vizStructure, visualisations) => {
    const selectedStructure = _find(flatMapVis(vizStructure), {
      id: visualisations && visualisations.selected
    });
    return selectedStructure || {};
  }
);

export const filtersSelector = createSelector(
  selectedStructureSelector,
  selectedStructure => (selectedStructure && selectedStructure.filters) || []
);

export const visualisationChartSelector = createSelector(
  selectedStructureSelector,
  selectedStructure => selectedStructure && selectedStructure.chart
);

export const visualisationType = createSelector(
  visualisationChartSelector,
  chart => chart && chart.type
);

export const visualisationOptions = createSelector(
  visualisationChartSelector,
  chart => chart && chart.options
);

export const chartDataSelector = createSelector(
  [
    hasDataSelector,
    timeseriesSelector,
    scenariosSelector,
    selectedStructureSelector
  ],
  (hasData, timeseries, scenarios, selectedStructure) => {
    if (!hasData) return {};

    switch (selectedStructure.id) {
      case 'LineChart-1':
        return { ...processLineData(timeseries.data, scenarios.data) };

      case 'StackChart-1':
        return {};

      case 'PieChart-1':
        return {};

      case 'LineChart-2':
        return { ...processLineData(timeseries.data, scenarios.data) };

      case 'PieChart-2':
        return { ...processPieData(timeseries.data, scenarios.data) };

      case 'StackChart-2':
        return {};

      default: return {};
    }
  }
);

export const getFormatFilters = name =>
  createSelector([dataSelector, filtersSelector], (state, spec) => {
    if (!spec || !spec.length > 0) return {};

    const filter = { ...(_find(spec, { name }) || {}) };
    const lense = get(lenses[`$${name}`], state) || {};
    filter.data = mapFilter(lense.data || []);
    filter.placeholder = `Select ${_.singularize(_.titleize(name))}`;
    filter.label = _.titleize(name);
    filter.loading = lense.loading;
    filter.disabled = lense.disabled;

    if (lense.selected) {
      filter.selected = filter.multi
        ? [...lense.selected]
        : { ...lense.selected };
    } else {
      filter.selected = filter.multi ? [] : {};
    }

    return filter;
  });
