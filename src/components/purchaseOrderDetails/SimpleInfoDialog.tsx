import React, { useState } from 'react';
import { Close, OpenInFull } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, Divider, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';

import { poDetailsColors } from './constants';

type SimpleInfoDialogProps = {
  open: boolean;
  title: string;
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
  lineId,
  materialCode,
  quantity,
  deliveryDate,
  note,
  onNoteChange,
  onClose,
  onSubmit,
}) => {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullscreen}
      PaperProps={{ sx: { borderRadius: fullscreen ? 0 : 1.5 } }}
    >
      <Box sx={{ px: 2, py: 1, backgroundColor: poDetailsColors.darkBlue, color: '#fff', position: 'relative' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{title} - PO Line {lineId}</Typography>
        <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', right: 8, top: 8 }} alignItems="center">
          <IconButton size="small" onClick={() => setFullscreen((v) => !v)} sx={{ color: 'common.white' }}>
            <OpenInFull fontSize="small" />
          </IconButton>
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.45)' }} />
          <IconButton size="small" onClick={onClose} sx={{ color: 'common.white' }}>
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
      <DialogContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          <TextField label="Add Info" fullWidth multiline rows={4} value={note} onChange={(e) => onNoteChange(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" variant="outlined" onClick={onClose}>Cancel</Button>
        <Button size="small" variant="contained" onClick={onSubmit} sx={{ backgroundColor: poDetailsColors.darkBlue }}>Submit Info Request</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleInfoDialog;
