import React, { useState } from 'react';
import { Close, Delete, OpenInFull } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, Divider, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';

import { poDetailsColors } from './constants';

type SplitRow = { quantity: string; delivery_date: string };

type SplitDialogProps = {
  open: boolean;
  lineId: string;
  materialCode?: string;
  rows: SplitRow[];
  note: string;
  onChangeRows: (next: SplitRow[]) => void;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

const SplitDialog: React.FC<SplitDialogProps> = ({ open, lineId, materialCode, rows, note, onChangeRows, onNoteChange, onClose, onSubmit }) => {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullscreen}
      PaperProps={{ sx: { borderRadius: fullscreen ? 0 : 1.5 } }}
    >
      <Box sx={{ px: 2, py: 1, backgroundColor: poDetailsColors.darkBlue, color: '#fff', position: 'relative' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Request Split Delivery - PO Line {lineId}</Typography>
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
          {rows.map((row, idx) => (
            <Grid container spacing={2} key={idx} alignItems="center">
              <Grid item xs={12} sm={6} md={2}><TextField label="PO Line" fullWidth size="small" disabled value={lineId} /></Grid>
              <Grid item xs={12} sm={6} md={3}><TextField label="Material No" fullWidth size="small" disabled value={materialCode || ''} /></Grid>
              <Grid item xs={12} sm={6} md={2}><TextField label="Number" type="number" fullWidth size="small" value={row.quantity} onChange={(e) => onChangeRows(rows.map((r, i) => i === idx ? { ...r, quantity: e.target.value } : r))} /></Grid>
              <Grid item xs={12} sm={6} md={3}><TextField label="Delivery Date" type="date" InputLabelProps={{ shrink: true }} fullWidth size="small" value={row.delivery_date} onChange={(e) => onChangeRows(rows.map((r, i) => i === idx ? { ...r, delivery_date: e.target.value } : r))} /></Grid>
              <Grid item xs={12} sm={6} md={2}>
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
              onClick={() => onChangeRows([...rows, { quantity: '', delivery_date: '' }])}
            >
              + DELIVERY
            </Button>
          </Box>
          <TextField
            label="Add Info"
            fullWidth
            multiline
            rows={3}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
          />
        </Stack>
          
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" variant="outlined" onClick={onClose}>Cancel</Button>
        <Button size="small" variant="contained" onClick={onSubmit} sx={{ backgroundColor: poDetailsColors.darkBlue }}>Submit Split Request</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SplitDialog;
