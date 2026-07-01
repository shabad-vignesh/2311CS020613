import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";

export function NotificationCard({ notification }) {
  const priorityLabel = notification.priorityLabel || "low";

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h3">
            {notification.title}
          </Typography>
          <Chip
            size="small"
            label={priorityLabel.toUpperCase()}
            color={
              priorityLabel === "high"
                ? "error"
                : priorityLabel === "medium"
                ? "warning"
                : "default"
            }
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {notification.message}
        </Typography>
      </CardContent>
    </Card>
  );
}