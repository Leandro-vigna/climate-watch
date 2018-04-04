import { format } from 'd3-format';
import { assign } from 'app/utils';
import { CHART_COLORS, CHART_COLORS_EXTENDED } from 'data/constants';
import { setChartColors } from 'app/utils/graphs';
import { groupByYear, pick } from '../utils';

const makeConfig = (data, indicators, yAxisLabel, small) => {
  const keys = Object.keys(data[0]).filter(k => k !== 'year');
  const chartColors = setChartColors(
    keys.length,
    CHART_COLORS,
    CHART_COLORS_EXTENDED
  );
  const tick = { stroke: '#8f8fa1', strokeWidth: 0.5, fontSize: '13px' };
  const names = pick('name', data); // only data name key
  const unit = indicators[0] && indicators[0].unit;
  return {
    chart: {
      data: pick('value', data), // only data value key
      margin: { top: 50, right: 0, left: 0, bottom: 0 },
      yAxisLabel: small ? null : yAxisLabel,
      unit: small ? null : unit
    },
    columns: {
      x: ['year'],
      y: keys
    },
    xAxis: small
      ? false
      : {
        dataKey: 'year',
        tick: small ? false : tick,
        tickLine: !small,
        axisLine: !small,
        padding: { left: 15, right: 20 },
        tickSize: 8
      },
    yAxis: small
      ? false
      : {
        tickFormatter: t => `${format('.2s')(t)}t`,
        axisLine: false,
        tickLine: false,
        tick: small ? false : tick,
        domain: ['auto', 'auto'],
        label: yAxisLabel,
        unit
      },
    cartesianGrid: small
      ? false
      : {
        vertical: false
      },
    theme: keys.reduce(
      (th, k, i) =>
        assign(th, {
          [k]: {
            stroke: chartColors[i],
            type: 'monotone',
            dot: false
          }
        }),
      {}
    ),
    tooltip: small ? null : { unit, names },
    legend: keys.map((k, i) => ({
      color: chartColors[i],
      label: names[0][k]
    }))
  };
};

export const lineChart1Data = (
  timeSeries,
  scenarios,
  indicators,
  yAxisLabel,
  small
) =>
  makeConfig(
    groupByYear(timeSeries, 'scenario', scenarios),
    indicators,
    yAxisLabel,
    small
  );

export const lineChart2Data = (
  timeSeries,
  locations,
  indicators,
  yAxisLabel,
  small
) =>
  makeConfig(
    groupByYear(timeSeries, 'location', locations),
    indicators,
    yAxisLabel,
    small
  );
