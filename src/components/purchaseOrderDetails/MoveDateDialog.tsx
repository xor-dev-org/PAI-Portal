import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { LineItem } from '@/models';
import { poDetailsColors } from './constants';
import { formatActionLabel, formatLineId } from './helpers';

interface MoveDateDialogProps {
  open: boolean;
  lineItem: LineItem | null;
  action: 'MOVE_IN' | 'MOVE_OUT' | null;
  fullscreen: boolean;
  notes: string;
  dateValue: string;
  onDateChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onClose: () => void;
  onToggleFullscreen: () => void;
  onSubmit: () => void;
}

const MoveDateDialog: React.FC<MoveDateDialogProps> = ({
  open,
  lineItem,
  action,
  fullscreen,
  notes,
  dateValue,
  onDateChange,
  onNotesChange,
  onClose,
  onToggleFullscreen,
  onSubmit,
}) => {
  const lineId = lineItem ? lineItem.id || formatLineId(lineItem.line_number) : '';
  const fieldLabel = action === 'MOVE_IN' ? 'Required In-House Date' : 'Shipment Date';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullscreen}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { maxWidth: fullscreen ? '100%' : 560, borderRadius: 1.5 } }}
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          backgroundColor: poDetailsColors.darkBlue,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
          {action ? `${formatActionLabel(action)} Date - PO Line ${lineId}` : 'Update Date'}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={onToggleFullscreen} sx={{ color: '#fff' }}>
            <OpenInFullIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          <TextField
            size="small"
            label="Line Item"
            value={lineId}
            InputProps={{ readOnly: true }}
          />
          <TextField
            size="small"
            type="date"
            label={fieldLabel}
            value={dateValue}
            onChange={(event) => onDateChange(event.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={3}
            label="Notes"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
          />
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button size="small" variant="contained" onClick={onClose} sx={{ backgroundColor: poDetailsColors.darkBlue }}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={onSubmit}
            disabled={!dateValue}
            sx={{ backgroundColor: poDetailsColors.darkBlue }}
          >
            Save Date
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default MoveDateDialog;
