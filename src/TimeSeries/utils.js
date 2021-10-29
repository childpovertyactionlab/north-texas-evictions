import { timeDay, timeSunday } from "d3-time";
import { timeFormat } from "d3-time-format";
import { formatDate, parseDate } from "../Dashboard";

// returns the year for a given date
const yearFormat = timeFormat("%Y");

// Short format day formatter for ticks (e.g. "Mar 1")
const dayTickFormat = timeFormat("%b %d");

// Long format day formatter for tooltips (e.g. "March 1, 2017")
const dayTooltipFormat = timeFormat("%B %d, %Y");

// Short format week for ticks (e.g. "Mar 1 - 7")
const weekTickFormat = (date) => {
  const sunday1 = timeSunday.floor(date);
  const sunday2 = timeSunday.offset(sunday1, 1);
  return dayTickFormat(sunday1) + " - " + dayTickFormat(sunday2);
};

// Long format week formatter
const weekTooltipFormat = (date) => {
  const sunday1 = timeSunday.floor(date);
  const sunday2 = timeSunday.offset(sunday1, 1);
  const year1 = yearFormat(sunday1);
  const year2 = yearFormat(sunday2);
  const isDifferentYear = year1 !== year2;
  return isDifferentYear
    ? `${dayTickFormat(sunday1)}, ${year1} - ${dayTickFormat(
        sunday2
      )}, ${year2}`
    : `${dayTickFormat(sunday1)} - ${dayTickFormat(sunday2)}, ${year1}`;
};

// month tick formatter
const monthTickFormat = timeFormat("%B");

// month tooltip formatter
const monthTooltipFormat = timeFormat("%B %Y");

/**
 * Returns a x tick formatter function for the provided group type
 * @param {*} group
 * @returns
 */
export const getXTickFormatter = (group) => {
  switch (group) {
    case "weekly":
      return weekTickFormat;
    case "monthly":
      return monthTickFormat;
    default:
      return dayTickFormat;
  }
};

/**
 * Returns a x value tooltip formatter function for the provided group type
 * @param {*} group
 * @returns
 */
export const getXTooltipFormatter = (group) => {
  switch (group) {
    case "weekly":
      return weekTooltipFormat;
    case "monthly":
      return monthTooltipFormat;
    default:
      return dayTooltipFormat;
  }
};

/**
 * Accepts data by day and aggregates it by week
 */
export function groupByWeek(data, metric = "ef") {
  const grouped = {};
  data.forEach((d) => {
    const date = timeSunday.floor(parseDate(d.date));
    const week = formatDate(date);
    if (!grouped[week]) {
      grouped[week] = {
        ...d,
        date: week,
        [metric]: 0,
      };
    }
    if (d[metric]) grouped[week][metric] += d[metric];
  });
  return Object.values(grouped).sort((a, b) => (a.date > b.date ? -1 : 1));
}

/**
 * Accepts data by day and aggregates it by month
 */
export function groupByMonth(data, metric = "ef") {
  const grouped = {};
  data.forEach((d) => {
    const date = new Date(d.date);
    const month = date.getMonth();
    if (!grouped[month]) {
      grouped[month] = {
        ...d,
        date: formatDate(new Date(date.getFullYear(), date.getMonth(), 1)),
        [metric]: 0,
      };
    }
    if (d[metric]) grouped[month][metric] += d[metric];
  });
  return Object.values(grouped).sort((a, b) => (a.date > b.date ? -1 : 1));
}

/**
 * Calulates the moving average given the array of values,
 * date range, and number of days (N)
 * https://observablehq.com/@d3/moving-average
 * @param {*} values
 * @param {*} N
 * @returns
 */
export function movingAverage(series, metric = "ef", dateRange, N = 7) {
  // create an array of all days in the date range
  const allDays = series.map((d) => parseDate(d.date));
  // map a value for each day in the date range
  const values = series.map((entry) => entry[metric]);
  console.log({ allDays, values });
  let i = 0;
  let sum = 0;
  const means = new Float64Array(values.length).fill(NaN);
  for (let n = Math.min(N - 1, values.length); i < n; ++i) {
    sum += values[i];
  }
  for (let n = values.length; i < n; ++i) {
    sum += values[i];
    means[i] = sum / N;
    sum -= values[i - N + 1];
  }

  // create a dictionary of date to value
  const avgDict = allDays.reduce((dict, day, i) => {
    dict[formatDate(day)] = means[i];
    return dict;
  }, {});

  // add the moving average to the original series
  const result = series.map((d, i) => {
    return {
      ...d,
      [metric]: avgDict[d.date],
    };
  });
  return result;
}

/**
 * Takes the average of the last `n` values in the provided array.
 * Assumes that the provided array is in chronological order.
 * @param {*} data
 * @param {*} n
 * @returns
 */
export const getDailyAverage = (metric, data, n = 7, offset = 0) => {
  if (!data || data.length < n + offset) return null;
  const start = offset;
  const end = offset + n;
  const avg =
    [...data]
      .sort((a, b) => parseDate(b.date) - parseDate(a.date))
      .slice(start, end)
      .reduce((acc, curr) => {
        return acc + curr[metric];
      }, 0) / n;
  return avg;
};

export const getDaysBetween = (dateRange) =>
  timeDay.count(...dateRange.map(parseDate));