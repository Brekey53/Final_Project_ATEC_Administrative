import { Card, CardContent, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme, useMediaQuery } from "@mui/material";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          layout={isMobile ? "vertical" : "horizontal"}
          yAxis={
            isMobile
              ? undefined
              : [
                  {
                    scaleType: "band",
                    dataKey: categoryKey as string,
                    width: 160,
                  },
                ]
          }
          xAxis={
            isMobile
              ? [
                  {
                    scaleType: "band",
                    dataKey: categoryKey as string,
                  },
                ]
              : undefined
          }
          series={[
            {
              dataKey: valueKey as string,
              label,
              valueFormatter,
            },
          ]}
          height={isMobile ? 420 : height}
          margin={
            isMobile
              ? { top: 20, right: 20, left: 20, bottom: 80 }
              : { top: 20, right: 40, left: 40, bottom: 20 }
          }
        />
      </CardContent>
    </Card>
  );
}
