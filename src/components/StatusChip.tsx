import { Chip } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface StatusChipProps {
  label: string;
  color: string;
  sx?: SxProps<Theme>;
}

export default function StatusChip({ label, color, sx }: StatusChipProps) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: `${color}1A`,
        color,
        fontWeight: 600,
        fontSize: 11,
        height: 22,
        ...sx,
      }}
    />
  );
}
