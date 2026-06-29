import React, { useState } from 'react';
import { Close } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Stack, TextField, Typography } from '@mui/material';

import { poDetailsColors } from './constants';

type SimpleInfoDialogProps = {
  open: boolean;
  title: string;
  submitLabel?: string;
  poNumber?: string;
  lineId: string;
  materialCode?: string;
  quantity?: number;
  deliveryDate?: string;
  note: string;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

const SimpleInfoDialog: React.FC<SimpleInfoDialogProps> = ({
  open,
  title,
  submitLabel,
  poNumber,
  lineId,
  materialCode,
  quantity,
  deliveryDate,
  note,
  onNoteChange,
  onClose,
  onSubmit,
}) => {
  void materialCode;
  void quantity;
  void deliveryDate;

  const [fullscreen] = useState(false);
  const headerTitle = `${title}${poNumber ? ` PO -${poNumber}` : ''}${lineId ? `-Line Item No-${lineId}` : ''}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullscreen}
      PaperProps={{ sx: { borderRadius: fullscreen ? 0 : 0.75, backgroundColor: '#f3f3f3' } }}
    >
      <Box sx={{ px: 2, py: 1.25, backgroundColor: poDetailsColors.darkBlue, color: '#fff', position: 'relative' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{headerTitle}</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'common.white', position: 'absolute', right: 8, top: 8 }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 2.5, backgroundColor: '#f3f3f3' }}>
        <Stack spacing={2}>
          <TextField
            label="Add Info"
            fullWidth
            multiline
            rows={4}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            sx={{ backgroundColor: '#f3f3f3' }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0, backgroundColor: '#f3f3f3' }}>
        <Button size="small" variant="contained" onClick={onClose} sx={{ backgroundColor: poDetailsColors.darkBlue, borderRadius: 0.75 }}>
          CANCEL
        </Button>
        <Button size="small" variant="contained" onClick={onSubmit} sx={{ backgroundColor: poDetailsColors.darkBlue, borderRadius: 0.75 }}>
          {(submitLabel || 'Submit').toUpperCase()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleInfoDialog;
