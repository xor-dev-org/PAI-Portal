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
import { formatLineId } from './helpers';

interface RevisionDialogProps {
  open: boolean;
  lineItem: LineItem | null;
  fullscreen: boolean;
  notes: string;
  onNotesChange: (value: string) => void;
  onClose: () => void;
  onToggleFullscreen: () => void;
  onSubmit: () => void;
}

const RevisionDialog: React.FC<RevisionDialogProps> = ({
  open,
  lineItem,
  fullscreen,
  notes,
  onNotesChange,
  onClose,
  onToggleFullscreen,
  onSubmit,
}) => {
  const lineId = lineItem ? lineItem.id || formatLineId(lineItem.line_number) : '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullscreen}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { maxWidth: fullscreen ? '100%' : 900, borderRadius: 1.5 } }}
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
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Revision-PO Line {lineId}</Typography>
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 1 }}>
          <TextField
            size="small"
            label="Material No."
            value={lineItem?.material_code || ''}
            InputProps={{ readOnly: true }}
          />
          <TextField size="small" label="Quantity" value="0" />
          <TextField size="small" label="Unit Price" value="0" />
          <TextField
            size="small"
            label="Net Price"
            value={lineItem?.net_value ?? lineItem?.quantity ?? 0}
            InputProps={{ readOnly: true }}
          />
          <TextField size="small" label="Delivery Date" placeholder="MM / YY" />
        </Box>

        <TextField
          sx={{ mt: 2 }}
          fullWidth
          size="small"
          multiline
          minRows={3}
          label="Add Info"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button size="small" variant="contained" onClick={onClose} sx={{ backgroundColor: poDetailsColors.darkBlue }}>
            Cancel
          </Button>
          <Button size="small" variant="contained" onClick={onSubmit} sx={{ backgroundColor: poDetailsColors.darkBlue }}>
            Submit Revision Request
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default RevisionDialog;
