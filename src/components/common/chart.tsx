import { useEffect, useState } from "react";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
} from "recharts";

import type { ChartData } from "src/utils/type";

interface ChartProps {
  chartData: ChartData[];
}

const Chart = ({ chartData }: ChartProps) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth - 50);
  }, []);

  return (
    <BarChart
      height={300}
      width={width}
      data={chartData}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="volume" fill="#ffc658" />
    </BarChart>
  );
};

export default Chart;
