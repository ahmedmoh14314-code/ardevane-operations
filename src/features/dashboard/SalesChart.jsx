import styled from "styled-components";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { eachDayOfInterval, format, isSameDay, subDays } from "date-fns";

import DashboardBox from "./DashboardBox";
import BoxHeader from "./BoxHeader";
import { useDarkMode } from "../../context/DarkModeContext";
import { formatCurrency } from "../../utils/helpers";

const StyledSalesChart = styled(DashboardBox)`
  grid-column: 1 / -1;
`;

const Period = styled.span`
  flex-shrink: 0;
  font-size: 1.3rem;
  font-weight: 500;
  padding: 0.6rem 1.2rem;

  color: var(--color-grey-600);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
`;

const TooltipBox = styled.div`
  padding: 0.8rem 1.2rem;
  font-size: 1.3rem;

  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-md);

  & strong {
    display: block;
    font-size: 1.5rem;
    color: var(--color-grey-800);
  }

  & span {
    color: var(--color-grey-500);
  }
`;

// recharts draws SVG attributes, which cannot read CSS variables, so the
// brand colours are spelled out here for each theme
const COLORS = {
  light: { line: "#185740", fill: "#2d8663", text: "#6b7280", grid: "#ece7de" },
  dark: { line: "#5fb48c", fill: "#2d8663", text: "#9ca3af", grid: "#2b3443" },
};

function SalesTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const { label, totalSales } = payload[0].payload;

  return (
    <TooltipBox>
      <strong>{formatCurrency(totalSales)}</strong>
      <span>{label}</span>
    </TooltipBox>
  );
}

// The best day gets a label above it, the way it reads in the design
function PeakLabel({ viewBox, value }) {
  if (!viewBox) return null;

  const { x, y } = viewBox;
  const text = formatCurrency(value).replace(".00", "");
  const width = text.length * 8 + 20;

  return (
    <g>
      <rect
        x={x - width / 2}
        y={y - 42}
        width={width}
        height={26}
        rx={6}
        fill="#fff"
        stroke="#ece7de"
      />
      <text
        x={x}
        y={y - 24}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill="#1f2937"
      >
        {text}
      </text>
    </g>
  );
}

function SalesChart({ bookings, numDays }) {
  const { isDarkMode } = useDarkMode();
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const allDates = eachDayOfInterval({
    start: subDays(new Date(), numDays - 1),
    end: new Date(),
  });

  const data = allDates.map((date) => ({
    label: format(date, "MMM d"),
    totalSales: bookings
      .filter((booking) => isSameDay(date, new Date(booking.created_at)))
      .reduce((acc, cur) => acc + cur.totalPrice, 0),
  }));

  const peak = data.reduce(
    (best, day) => (day.totalSales > best.totalSales ? day : best),
    data[0]
  );

  return (
    <StyledSalesChart>
      <BoxHeader
        title="Sales trend"
        subtitle="Total sales over the selected period"
      >
        <Period>Last {numDays} days</Period>
      </BoxHeader>

      <ResponsiveContainer height={260} width="100%">
        <AreaChart data={data} margin={{ top: 48, right: 16, left: 0 }}>
          <defs>
            <linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.fill} stopOpacity={0.35} />
              <stop offset="100%" stopColor={colors.fill} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke={colors.grid}
            strokeDasharray="4 4"
          />

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.text, fontSize: 12 }}
            dy={8}
            minTickGap={24}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.text, fontSize: 12 }}
            tickFormatter={(value) =>
              value >= 1000 ? `$${value / 1000}K` : `$${value}`
            }
            width={56}
          />

          <Tooltip content={<SalesTooltip />} cursor={{ stroke: colors.grid }} />

          {peak.totalSales > 0 && (
            <ReferenceLine
              x={peak.label}
              stroke={colors.line}
              strokeOpacity={0.25}
              strokeDasharray="4 4"
            />
          )}

          <Area
            dataKey="totalSales"
            type="monotone"
            stroke={colors.line}
            strokeWidth={2.5}
            fill="url(#sales-fill)"
            dot={{ r: 4, fill: colors.line, stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: colors.line, stroke: "#fff", strokeWidth: 2 }}
            name="Total sales"
          />

          {peak.totalSales > 0 && (
            <ReferenceDot
              x={peak.label}
              y={peak.totalSales}
              r={6}
              fill={colors.line}
              stroke="#fff"
              strokeWidth={2}
              label={<PeakLabel value={peak.totalSales} />}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </StyledSalesChart>
  );
}

export default SalesChart;
