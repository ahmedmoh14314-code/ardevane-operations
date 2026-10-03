import styled from "styled-components";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import DashboardBox from "./DashboardBox";
import BoxHeader from "./BoxHeader";
import { useDarkMode } from "../../context/DarkModeContext";
import { below } from "../../styles/breakpoints";

const ChartBox = styled(DashboardBox)`
  grid-column: 3 / span 2;
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: 22rem 1fr;
  align-items: center;
  gap: 3.2rem;

  ${below.tablet} {
    grid-template-columns: 1fr;
    justify-items: center;
  }
`;

// The number in the hole of the donut
const Donut = styled.div`
  position: relative;
  width: 22rem;
  height: 22rem;
`;

const Center = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  & strong {
    font-family: var(--font-display);
    font-size: 3.2rem;
    font-weight: 600;
    line-height: 1;
    color: var(--color-grey-800);
  }

  & span {
    font-size: 1.4rem;
    color: var(--color-grey-500);
  }
`;

const Legend = styled.ul`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

const LegendItem = styled.li`
  display: grid;
  grid-template-columns: 1.4rem 1fr auto;
  align-items: center;
  gap: 1.2rem;
  font-size: 1.5rem;
  color: var(--color-grey-600);

  & strong {
    font-weight: 600;
    color: var(--color-grey-800);
  }
`;

const Dot = styled.span`
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
`;

const Empty = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

// Greens and golds from the brand, so the chart belongs to the page
const BUCKETS = [
  { duration: "1 night", color: "#e3c589", test: (n) => n === 1 },
  { duration: "2 nights", color: "#1f4d3a", test: (n) => n === 2 },
  { duration: "3 nights", color: "#c9a15a", test: (n) => n === 3 },
  { duration: "4–5 nights", color: "#4f8a63", test: (n) => n >= 4 && n <= 5 },
  { duration: "6–7 nights", color: "#7fae8c", test: (n) => n >= 6 && n <= 7 },
  { duration: "8–14 nights", color: "#a7bfb0", test: (n) => n >= 8 && n <= 14 },
  {
    duration: "15–21 nights",
    color: "#8a6a3a",
    test: (n) => n >= 15 && n <= 21,
  },
  { duration: "21+ nights", color: "#2f6b52", test: (n) => n > 21 },
];

function prepareData(stays) {
  return BUCKETS.map((bucket) => ({
    duration: bucket.duration,
    color: bucket.color,
    value: stays.filter((stay) => bucket.test(stay.numNights)).length,
  })).filter((bucket) => bucket.value > 0);
}

function DurationChart({ confirmedStays }) {
  const { isDarkMode } = useDarkMode();

  const data = prepareData(confirmedStays);
  const total = confirmedStays.length;

  return (
    <ChartBox>
      <BoxHeader
        title="Stay duration summary"
        subtitle="Distribution of guest stay lengths"
      />

      {total === 0 ? (
        <Empty>No stays in this period yet.</Empty>
      ) : (
        <Body>
          <Donut>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  nameKey="duration"
                  dataKey="value"
                  innerRadius="66%"
                  outerRadius="100%"
                  stroke={isDarkMode ? "#18212f" : "#fff"}
                  strokeWidth={3}
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((entry) => (
                    <Cell key={entry.duration} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <Center>
              <strong>{total}</strong>
              <span>{total === 1 ? "Stay" : "Stays"}</span>
            </Center>
          </Donut>

          <Legend>
            {data.map((entry) => (
              <LegendItem key={entry.duration}>
                <Dot $color={entry.color} />
                <span>{entry.duration}</span>
                <strong>{Math.round((entry.value / total) * 100)}%</strong>
              </LegendItem>
            ))}
          </Legend>
        </Body>
      )}
    </ChartBox>
  );
}

export default DurationChart;
