import { Card, CardContent, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

export interface HorizontalBarChartProps<T> {
  title?: string;
  dataset: T[];
  categoryKey: keyof T;  
  valueKey: keyof T; 
  label?: string;
  height?: number;
  width?: number;
  valueFormatter?: (value: number | null) => string;
}


export default function HorizontalBarChart<T extends Record<string, any>>({
  title,
  dataset,
  categoryKey,
  valueKey,
  label,
  height = 320,
  width = 500,
  valueFormatter,
}: HorizontalBarChartProps<T>) {
  return (
    <Card>
      <CardContent>
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
          height={height}
          width={width}
        />
      </CardContent>
    </Card>
  );
}
