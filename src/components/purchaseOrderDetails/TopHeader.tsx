import React from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadIcon from '@mui/icons-material/Upload';
import { poDetailsColors } from './constants';

interface TopHeaderProps {
  poNumber: string;
  status: string;
  headerActions: string[];
  viewMode: 'GRID' | 'CARD';
  onViewModeChange: (nextMode: 'GRID' | 'CARD') => void;
  onBack: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({
  poNumber,
  status,
  headerActions,
  viewMode,
  onViewModeChange,
  onBack,
}) => {
  const hasToggle = headerActions.includes('GRID') || headerActions.includes('CARD');
  const actionButtons = headerActions.filter((action) => action !== 'GRID' && action !== 'CARD');

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton size="small" onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: poDetailsColors.textPrimary }}>
          {poNumber}
        </Typography>
        <Chip
          label={status.replace(/_/g, ' ')}
          variant="outlined"
          size="small"
          sx={{
            borderColor: poDetailsColors.warningOrange,
            color: poDetailsColors.warningOrange,
            backgroundColor: 'rgba(255,112,67,0.08)',
            textTransform: 'capitalize',
          }}
        />
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        {actionButtons.map((action) => (
          <Button
            key={action}
            size="small"
            variant="outlined"
            startIcon={action === 'EXPORT' ? <UploadIcon /> : undefined}
            sx={{
              borderColor: poDetailsColors.primaryBlue,
              color: poDetailsColors.primaryBlue,
              fontWeight: 600,
            }}
          >
            {action}
          </Button>
        ))}

        {hasToggle && (
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, nextMode) => {
              if (nextMode) {
                onViewModeChange(nextMode);
              }
            }}
            sx={{
              '& .MuiToggleButton-root': {
                borderColor: poDetailsColors.primaryBlue,
                color: poDetailsColors.primaryBlue,
                px: 1.8,
                py: 0.4,
                fontSize: 12,
                fontWeight: 700,
              },
              '& .Mui-selected': {
                backgroundColor: `${poDetailsColors.darkBlue} !important`,
                color: '#fff !important',
              },
            }}
          >
            <ToggleButton value="GRID">GRID</ToggleButton>
            <ToggleButton value="CARD">CARD</ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>
    </Box>
  );
};

export default React.memo(TopHeader);
