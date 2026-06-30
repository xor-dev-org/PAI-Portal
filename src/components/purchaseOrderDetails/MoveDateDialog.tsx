import React, { useState } from 'react';
import { Close } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, Grid, IconButton, TextField, Typography } from '@mui/material';

import { poDetailsColors } from './constants';

interface MoveDateDialogProps {
  open: boolean;
  mode: 'MOVE_IN' | 'MOVE_OUT';
  poNumber?: string;
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
  poNumber,
  lineId,
  materialCode,
  quantity,
  currentDate,
  date,
  onDateChange,
  onClose,
  onSubmit,
}) => {
  const [fullscreen] = useState(false);
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
      PaperProps={{ sx: { maxWidth: fullscreen ? '100%' : 560, borderRadius: fullscreen ? 0 : 0.75, backgroundColor: '#f3f3f3' } }}
    >
      <Box sx={{ px: 2, py: 1.25, backgroundColor: poDetailsColors.darkBlue, color: '#fff', position: 'relative' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
          {title}{poNumber ? ` PO -${poNumber}` : ''}{lineId ? `-Line Item No-${lineId}` : ''}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: '#fff', position: 'absolute', right: 8, top: 8 }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 2.5, backgroundColor: '#f3f3f3' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Po Line" fullWidth size="small" disabled value={lineId} sx={{ '& .MuiInputBase-root': { backgroundColor: '#e8e8e8' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Material No." fullWidth size="small" disabled value={materialCode || ''} sx={{ '& .MuiInputBase-root': { backgroundColor: '#e8e8e8' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Quantity" fullWidth size="small" disabled value={quantity || ''} sx={{ '& .MuiInputBase-root': { backgroundColor: '#e8e8e8' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={currentLabel} fullWidth size="small" disabled value={currentDate || ''} sx={{ '& .MuiInputBase-root': { backgroundColor: '#e8e8e8' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={fieldLabel} fullWidth size="small" type="date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => onDateChange(e.target.value)} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0, backgroundColor: '#f3f3f3' }}>
        <Button size="small" variant="contained" onClick={onClose} sx={{ backgroundColor: poDetailsColors.darkBlue, borderRadius: 0.75 }}>CANCEL</Button>
        <Button
          size="small"
          variant="contained"
          onClick={onSubmit}
          disabled={!date}
          sx={{ backgroundColor: poDetailsColors.darkBlue, borderRadius: 0.75 }}
        >
          {mode === 'MOVE_IN' ? 'SUBMIT MOVE IN REQUEST' : 'SUBMIT MOVE OUT REQUEST'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveDateDialog;
