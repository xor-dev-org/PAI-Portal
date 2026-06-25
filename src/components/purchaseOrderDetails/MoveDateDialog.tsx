import React, { useState } from 'react';
import { Close, OpenInFull } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, Divider, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';

import { poDetailsColors } from './constants';

interface MoveDateDialogProps {
  open: boolean;
  mode: 'MOVE_IN' | 'MOVE_OUT';
  lineId: string;
  materialCode?: string;
  quantity?: number;
  currentDate?: string;
  date: string;
  onDateChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const MoveDateDialog: React.FC<MoveDateDialogProps> = ({
  open,
  mode,
  lineId,
  materialCode,
  quantity,
  currentDate,
  date,
  onDateChange,
  onClose,
  onSubmit,
}) => {
  const [fullscreen, setFullscreen] = useState(false);
  const title = mode === 'MOVE_IN' ? 'Request Move in Delivery Date' : 'Request Move out Delivery Date';
  const fieldLabel = mode === 'MOVE_IN' ? 'New Required In House Date' : 'New Shipment Date';
  const currentLabel = mode === 'MOVE_IN' ? 'Current Required In House Date' : 'Current Shipment Date';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullscreen}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { maxWidth: fullscreen ? '100%' : 560, borderRadius: fullscreen ? 0 : 1.5 } }}
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
          position: 'relative',
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{title} - PO Line {lineId}</Typography>
        <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', right: 8, top: 8 }} alignItems="center">
          <IconButton size="small" onClick={() => setFullscreen((value) => !value)} sx={{ color: '#fff' }}>
            <OpenInFull fontSize="small" />
          </IconButton>
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.45)' }} />
          <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}><TextField label="PO Line" fullWidth size="small" disabled value={lineId} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField label="Material No" fullWidth size="small" disabled value={materialCode || ''} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField label="Quantity" fullWidth size="small" disabled value={quantity || ''} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField label={currentLabel} fullWidth size="small" disabled value={currentDate || ''} /></Grid>
          <Grid item xs={12}><TextField label={fieldLabel} fullWidth size="small" type="date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => onDateChange(e.target.value)} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" variant="outlined" onClick={onClose}>Cancel</Button>
        <Button size="small" variant="contained" onClick={onSubmit} disabled={!date} sx={{ backgroundColor: poDetailsColors.darkBlue }}>Submit Request</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveDateDialog;
