import { createSelector } from 'reselect';
import remove from 'lodash/remove';
import pick from 'lodash/pick';
import { DATA_EXPLORER_BLACKLIST } from 'data/constants';

export const getData = createSelector(
  [state => state.data, state => state.section],
  (data, section) => {
    if (!data || !section) return null;
    return (data && data[section] && data[section].data) || null;
  }
);

export const parseData = createSelector([getData], data => {
  if (!data || !data.length) return null;
  const updatedData = data;
  const expandedEmissionsData = updatedData.map(d => {
    const yearEmissions = {};
    d.emissions.forEach(e => {
      yearEmissions[e.year] = e.value;
    });
    return { ...d, ...yearEmissions };
  });
  const whiteList = remove(
    Object.keys(expandedEmissionsData[0]),
    n => DATA_EXPLORER_BLACKLIST.indexOf(n) === -1
  );
  return expandedEmissionsData.map(d => pick(d, whiteList));
});
