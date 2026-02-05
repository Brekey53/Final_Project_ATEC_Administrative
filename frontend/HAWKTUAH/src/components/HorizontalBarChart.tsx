import { Card, CardContent, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

export interface HorizontalBarChartProps<T> {
  title?: string;
  dataset: T[];
  categoryKey: keyof T;  
  valueKey: keyof T; 
  label?: string;
  height?: number;
  valueFormatter?: (value: number | null) => string;
}

export default function HorizontalBarChart<T extends Record<string, any>>({
  title,
  dataset,
  categoryKey,
  valueKey,
  label,
  height = 360,
  valueFormatter,
}: HorizontalBarChartProps<T>) {
  return (
    <Card sx={{ width: "100%" }}>
      <CardContent sx={{ width: "100%" }}>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}

        <BarChart
          dataset={dataset}
          yAxis={[
            {
              scaleType: "band",
              dataKey: categoryKey as string,
              width: 200,
            },
          ]}
          series={[
            {
              dataKey: valueKey as string,
              label,
              valueFormatter,
            },
          ]}
          layout="horizontal"
          margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
          height={height}
        />
      </CardContent>
    </Card>
  );
}
