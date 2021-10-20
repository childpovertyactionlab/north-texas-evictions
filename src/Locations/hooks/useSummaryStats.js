import { useFormatters } from "../../Dashboard/hooks/useFormatter";
import { useLang } from "../../Language";

/**
 * Gets an array of eviction summary stats from the location data
 * @param {*} location
 * @returns
 */
export default function useSummaryStats(data) {
  data = data || {};
  const metricIds = ["avg7", "avg30", "tfa", "mfa"];
  const langKeys = metricIds.map((id) => `METRIC_${id}`.toUpperCase());
  const labels = useLang(langKeys);
  const formatters = useFormatters(metricIds);
  const hintKeys = metricIds.map((id) => `HINT_${id}`.toUpperCase());
  const hints = useLang(hintKeys);

  return metricIds.map((id, i) => {
    return {
      id,
      label: labels[i],
      hint: hints[i],
      value: formatters[i](data[id]),
    };
  });
  // .filter(({ value }) => Boolean(value));
}
