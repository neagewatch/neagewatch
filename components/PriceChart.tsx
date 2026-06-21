"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Props = {
  data: {
    company: string;
    oldPrice: number;
    newPrice: number;
  }[];
};

export default function PriceChart({ data }: Props) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="company" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="oldPrice" name="旧価格" fill="#8884d8" />
          <Bar dataKey="newPrice" name="新価格" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}