import { useMapStore } from "@hyperobjekt/mapbox";
import { useEffect } from "react";
import shallow from "zustand/shallow";
import { useLocationStore } from "../../Locations";
import useTimeSeriesStore from "../../TimeSeries/hooks/useTimeSeriesStore";
import { EVICTION_DATA_ENDPOINT } from "../constants";
import useDashboardStore from "./useDashboardStore";

/**
 * Populates the dashboard store with initial values.
 */
export default function useDashboardDefaults({
  activeView,
  activeBubble,
  activeChoropleth,
  activeRegion,
  activeDateRange,
  regions,
  metrics,
  zoom,
  latitude,
  longitude,
  defaultViewport,
  group,
  locations,
  pinned,
}) {
  // dashboard state setters
  const [
    setActiveView,
    setMetrics,
    setRegions,
    setActiveBubble,
    setActiveChoropleth,
    setActiveRegion,
    setDateRange,
    setActiveDateRange,
    setReady,
    setDefaultViewport,
  ] = useDashboardStore(
    (state) => [
      state.setActiveView,
      state.setMetrics,
      state.setRegions,
      state.setActiveBubble,
      state.setActiveChoropleth,
      state.setActiveRegion,
      state.setDateRange,
      state.setActiveDateRange,
      state.setReady,
      state.setDefaultViewport,
    ],
    shallow
  );
  // map state setters
  const setViewport = useMapStore((state) => state.setViewport);
  // time series state setters
  const setGroup = useTimeSeriesStore((state) => state.setGroup);
  // location setters
  const addToLoadQueue = useLocationStore((state) => state.addToLoadQueue);
  // const setPinnedLocations =

  // set ready to true when all defaults are set
  useEffect(() => {
    console.debug("setting defaults:", {
      activeView,
      activeBubble,
      activeChoropleth,
      activeRegion,
      activeDateRange,
      regions,
      metrics,
      zoom,
      latitude,
      longitude,
      group,
      locations,
    });
    setActiveView(activeView || "map");
    setViewport({
      zoom,
      latitude,
      longitude,
    });
    setViewport({ zoom, latitude, longitude }); // update the map store viewport (changes)
    setDefaultViewport(defaultViewport); // update the dashboard store so we can retrieve this later (does not change)
    setActiveBubble(activeBubble);
    setActiveChoropleth(activeChoropleth);
    setActiveRegion(activeRegion);
    setActiveDateRange(activeDateRange);
    setMetrics(metrics);
    setRegions(regions);
    group && setGroup(group);
    locations && addToLoadQueue(locations);
    fetch(`${EVICTION_DATA_ENDPOINT}/meta`)
      .then((response) => response.json())
      .then(([meta]) => {
        const dateRange = [meta.first_filing, meta.last_filing];
        setDateRange(dateRange);
        setTimeout(() => setReady(true), 0);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
