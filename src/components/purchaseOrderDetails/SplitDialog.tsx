import React, { useState } from 'react';
import { Close, Delete } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';

import { poDetailsColors } from './constants';

type SplitRow = { quantity: string; delivery_date: string };

type SplitDialogProps = {
  open: boolean;
  poNumber?: string;
  lineId: string;
  materialCode?: string;
  rows: SplitRow[];
  note: string;
  onChangeRows: (next: SplitRow[]) => void;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

const SplitDialog: React.FC<SplitDialogProps> = ({ open, poNumber, lineId, materialCode, rows, note, onChangeRows, onNoteChange, onClose, onSubmit }) => {
  void note;
  void onNoteChange;
  const [fullscreen] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullscreen}
      PaperProps={{ sx: { borderRadius: fullscreen ? 0 : 0.75, backgroundColor: '#f3f3f3' } }}
    >
      <Box sx={{ px: 2, py: 1.25, backgroundColor: poDetailsColors.darkBlue, color: '#fff', position: 'relative' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
          Request Split Delivery{poNumber ? `-PO -${poNumber}` : ''}{lineId ? `-Line Item-${lineId}` : ''}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'common.white', position: 'absolute', right: 8, top: 8 }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 2.5, backgroundColor: '#f3f3f3' }}>
        <Stack spacing={2}>
          {rows.map((row, idx) => (
            <Grid container spacing={2} key={idx} alignItems="center">
              <Grid item xs={12} sm={6} md={3}><TextField label="Po Line" fullWidth size="small" disabled value={lineId} sx={{ '& .MuiInputBase-root': { backgroundColor: '#e8e8e8' } }} /></Grid>
              <Grid item xs={12} sm={6} md={3}><TextField label="Material No." fullWidth size="small" disabled value={materialCode || ''} sx={{ '& .MuiInputBase-root': { backgroundColor: '#e8e8e8' } }} /></Grid>
              <Grid item xs={12} sm={6} md={2.5}><TextField label="Number" type="number" fullWidth size="small" value={row.quantity} onChange={(e) => onChangeRows(rows.map((r, i) => i === idx ? { ...r, quantity: e.target.value } : r))} /></Grid>
              <Grid item xs={12} sm={6} md={2.5}><TextField label="Delivery date" type="date" InputLabelProps={{ shrink: true }} fullWidth size="small" value={row.delivery_date} onChange={(e) => onChangeRows(rows.map((r, i) => i === idx ? { ...r, delivery_date: e.target.value } : r))} /></Grid>
              <Grid item xs={12} sm={6} md={1}>
                <IconButton
                  onClick={() => {
                    if (rows.length <= 1) {
                      return;
                    }
                    onChangeRows(rows.filter((_, i) => i !== idx));
                  }}
                  disabled={rows.length <= 1}
                >
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Box>
            <Button
              size="medium"
              variant="outlined"
              sx={{ borderRadius: 0.75 }}
              onClick={() => onChangeRows([...rows, { quantity: '', delivery_date: '' }])}
            >
              + DELIVERY
            </Button>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0, backgroundColor: '#f3f3f3' }}>
        <Button size="small" variant="contained" onClick={onClose} sx={{ backgroundColor: poDetailsColors.darkBlue, borderRadius: 0.75 }}>CANCEL</Button>
        <Button size="small" variant="contained" onClick={onSubmit} sx={{ backgroundColor: poDetailsColors.darkBlue, borderRadius: 0.75 }}>SUBMIT SPLIT REQUEST</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SplitDialog;
