import React from "react";
import {
  AnimatedAxis,
  AnimatedGrid,
  AnimatedLineSeries,
  buildChartTheme,
  XYChart,
  Tooltip,
} from "@visx/xychart";

import { withParentSize } from "@visx/responsive";
import { curveMonotoneX } from "d3-shape";
import { parseDate, Stat } from "../../Dashboard";
import { Box, Paper, Typography } from "@material-ui/core";
import { Stack } from "@hyperobjekt/material-ui-website";
import useTimeSeriesEventsInRange from "../hooks/useTimeSeriesEventsInRange";
import TimeSeriesEvent from "./TimeSeriesEvent";
import { isEventInRange } from "../utils";

const TimeSeriesChart = ({
  lines,
  tooltipRenderer,
  glyphRenderer,
  xAccessor,
  yAccessor,
  yFormatter,
  xTickFormatter,
  yTickFormatter,
  xTooltipFormatter,
  children,
  ...props
}) => {
  const eventData = useTimeSeriesEventsInRange();
  const customTheme = buildChartTheme({
    colors: lines.map((line) => line.color).reverse(),
  });
  const renderTooltip = tooltipRenderer
    ? tooltipRenderer
    : ({ tooltipData }) => {
        const entries = Object.values(tooltipData?.datumByKey ?? {}).sort(
          (a, b) => {
            return yAccessor(b.datum) - yAccessor(a.datum);
          }
        );
        const nearest = tooltipData?.nearestDatum?.datum;
        const eventsInRange = eventData.reduce((eventsInRange, event) => {
          if (
            isEventInRange(
              { start: new Date(nearest.date), end: new Date(nearest.date) },
              event
            )
          ) {
            eventsInRange.push(event);
          }
          return eventsInRange;
        }, []);
        return (
          <Paper elevation={2}>
            <Box clone p={2} pb={0} bt={"none"}>
              <Typography variant="h2">
                {xTooltipFormatter(parseDate(nearest.date))}
              </Typography>
            </Box>
            <Stack between="sm" direction="vertical" around="md">
              {entries.map(({ key, datum }) => (
                <Stat
                  key={key}
                  label={datum.name}
                  value={yFormatter(yAccessor(datum))}
                  minWidth={200}
                >
                  <svg
                    width="8"
                    height="8"
                    style={{ marginLeft: "auto", marginRight: 8 }}
                  >
                    <circle r="4" cx="4" cy="4" fill={datum.color} />
                  </svg>
                </Stat>
              ))}
            </Stack>
            {eventsInRange.length > 0 && (
              <Stack between="sm" direction="vertical" around="md">
                {eventsInRange?.map((event, i) => (
                  <TimeSeriesEvent
                    key={event.name}
                    radius={9}
                    mt={i === 0 ? 0 : 2}
                    {...event}
                  />
                ))}
              </Stack>
            )}
          </Paper>
        );
      };
  return (
    <>
      <XYChart
        xScale={{ type: "time" }}
        yScale={{ type: "" }}
        theme={customTheme}
        {...props}
      >
        <AnimatedAxis
          orientation="bottom"
          numTicks={5}
          tickFormat={xTickFormatter}
          strokeWidth={4}
          hideAxisLine
        />
        <AnimatedAxis
          orientation="left"
          left={48}
          numTicks={5}
          tickFormat={yTickFormatter}
          labelOffset={16}
          hideAxisLine
          hideTicks
        />
        <AnimatedGrid columns={false} numTicks={5} stroke="rgba(0,0,0,0.08)" />
        {lines.map(({ id, color, data, visible, dashArray, opacity }) => {
          if (!visible) return null;
          return (
            <AnimatedLineSeries
              key={id}
              dataKey={id}
              data={data
                .filter((d) => Number.isFinite(yAccessor(d)))
                .map((d) => ({
                  ...d,
                  color: color,
                }))}
              curve={curveMonotoneX}
              xAccessor={xAccessor}
              yAccessor={yAccessor}
              stroke={color}
              opacity={opacity}
              strokeDasharray={dashArray}
            />
          );
        })}
        {children}
        <Tooltip
          showVerticalCrosshair
          showSeriesGlyphs
          renderTooltip={renderTooltip}
          renderGlyph={
            glyphRenderer
              ? glyphRenderer
              : ({ datum }) => <circle r={4} fill={datum.color} />
          }
          unstyled
          verticalCrosshairStyle={{ stroke: "#ccc" }}
        />
      </XYChart>
    </>
  );
};

TimeSeriesChart.defaultProps = {
  xAccessor: (d) => d.x,
  yAccessor: (d) => d.y,
};

export default withParentSize(TimeSeriesChart);
