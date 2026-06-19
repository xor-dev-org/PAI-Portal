import React from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { poDetailsColors } from './constants';
import { toCurrency } from './helpers';

interface PSBottomSummaryBarProps {
  totalValue: number;
  currency: string;
  onCancel: () => void;
}

export const PSBottomSummaryBar: React.FC<PSBottomSummaryBarProps> = ({ totalValue, currency, onCancel }) => (
  <Paper
    variant="outlined"
    sx={{
      mt: 1,
      px: 1.5,
      py: 1,
      borderColor: poDetailsColors.border,
      backgroundColor: poDetailsColors.lightBlueBg,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 1,
    }}
  >
    <Stack direction="row" spacing={1.2} alignItems="center">
      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Total Net Value</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{toCurrency(totalValue, currency)}</Typography>
    </Stack>

    <Stack direction="row" spacing={1}>
      <Button
        size="small"
        variant="outlined"
        onClick={onCancel}
        sx={{ borderColor: poDetailsColors.primaryBlue, color: poDetailsColors.primaryBlue }}
      >
        Cancel
      </Button>
      <Button
        size="small"
        variant="contained"
        sx={{ backgroundColor: poDetailsColors.darkBlue }}
      >
        Send Response
      </Button>
    </Stack>
  </Paper>
);

interface SupplierTotalRowProps {
  totalValue: number;
  currency: string;
}

export const SupplierTotalRow: React.FC<SupplierTotalRowProps> = ({ totalValue, currency }) => (
  <Box
    sx={{
      mt: 1,
      ml: 'auto',
      width: { xs: '100%', md: 420 },
      backgroundColor: poDetailsColors.lightBlueBg,
      border: `1px solid ${poDetailsColors.border}`,
      display: 'grid',
      gridTemplateColumns: '1.2fr 0.8fr',
    }}
  >
    <Box sx={{ px: 1.5, py: 1, borderRight: `1px solid ${poDetailsColors.border}` }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Total Net Value</Typography>
    </Box>
    <Box sx={{ px: 1.5, py: 1 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>{toCurrency(totalValue, currency)}</Typography>
    </Box>
  </Box>
);

interface SupplierBottomActionBarProps {
  onBack: () => void;
  onAccept: () => void;
}

export const SupplierBottomActionBar: React.FC<SupplierBottomActionBarProps> = ({ onBack, onAccept }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 1.5,
      mt: 2,
      borderColor: poDetailsColors.border,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 1,
    }}
  >
    <Button
      size="small"
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      onClick={onBack}
      sx={{ borderColor: poDetailsColors.primaryBlue, color: poDetailsColors.primaryBlue }}
    >
      Back
    </Button>

    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Button
        size="small"
        variant="outlined"
        startIcon={<UploadFileIcon />}
        sx={{ borderColor: poDetailsColors.primaryBlue, color: poDetailsColors.primaryBlue }}
      >
        Upload Doc
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<WorkOutlineIcon />}
        sx={{ borderColor: poDetailsColors.primaryBlue, color: poDetailsColors.primaryBlue }}
      >
        Concession Request
      </Button>
      <Button size="small" variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={onAccept} sx={{ backgroundColor: poDetailsColors.darkBlue }}>
        Accept
      </Button>
    </Stack>
  </Paper>
);
