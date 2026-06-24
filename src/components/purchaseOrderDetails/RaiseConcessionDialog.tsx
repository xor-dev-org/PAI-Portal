import React from 'react';
import { Close, Upload } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, Grid, IconButton, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';

import { poDetailsColors } from './constants';
import { DocsRow } from '@/pages/purchaseOrderDetails/types';

type RaiseConcessionDialogProps = {
  open: boolean;
  lineId: string;
  materialCode?: string;
  description?: string;
  documentsRows: DocsRow[];
  selectedDocumentId: string;
  uploadFile: File | null;
  reason: string;
  concessionDescription: string;
  onReasonChange: (value: string) => void;
  onDocumentIdChange: (value: string) => void;
  onUploadFileChange: (file: File | null) => void;
  onConcessionDescriptionChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

const RaiseConcessionDialog: React.FC<RaiseConcessionDialogProps> = ({
  open,
  lineId,
  materialCode,
  description,
  documentsRows,
  selectedDocumentId,
  uploadFile,
  reason,
  concessionDescription,
  onReasonChange,
  onDocumentIdChange,
  onUploadFileChange,
  onConcessionDescriptionChange,
  onClose,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 1 } }}>
      <Box sx={{ px: 2, py: 1, backgroundColor: poDetailsColors.darkBlue, color: '#fff', position: 'relative' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Concession Request - PO Line {lineId}</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'common.white', position: 'absolute', right: 8, top: 8 }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ border: '1px dashed #cbd5e1', borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Current Specification</Typography>
              <Stack spacing={1.5}>
                <TextField label="Material No" fullWidth size="small" disabled value={materialCode || ''} />
                <TextField label="Short Description" fullWidth size="small" disabled multiline rows={2} value={description || ''} />
                <TextField label="Long Description" fullWidth size="small" disabled multiline rows={2} value={description || ''} />
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ border: '1px dashed #cbd5e1', borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>New Specification</Typography>
              <Stack spacing={1.5}>
                <TextField label="Reason" select fullWidth size="small" value={reason} onChange={(e) => onReasonChange(e.target.value)}>
                  <MenuItem value="">Select reason</MenuItem>
                  <MenuItem value="Dimensional deviation">Dimensional deviation</MenuItem>
                  <MenuItem value="Material substitution">Material substitution</MenuItem>
                  <MenuItem value="Surface finish deviation">Surface finish deviation</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
                {/* <TextField
                  label="Document"
                  select
                  fullWidth
                  size="small"
                  value={selectedDocumentId}
                  onChange={(e) => onDocumentIdChange(e.target.value)}
                >
                  <MenuItem value="">Select document</MenuItem>
                  {documentsRows.map((document) => (
                    <MenuItem key={document.id} value={document.id}>
                      {document.file_name || document.file_path || document.id}
                    </MenuItem>
                  ))}
                </TextField> */}
                <TextField label="Description" fullWidth size="small" multiline rows={4} value={concessionDescription} onChange={(e) => onConcessionDescriptionChange(e.target.value)} />
              </Stack>
            </Box>
          </Grid>
        </Grid>

        <Paper variant="outlined" sx={{ mt: 2, p: 3 }}>
          <Stack spacing={1.5} alignItems="center" sx={{ py: 1 }}>
            <Upload color="action" />
            <Typography variant="body2">
              <Typography component="span" color="primary">Link</Typography> or drag and drop
            </Typography>
            <Typography variant="caption" color="text.secondary">SVG, PNG, JPG or GIF (max. 3MB)</Typography>
            <Button component="label" variant="outlined" size="small">
              Choose File
              <input hidden type="file" onChange={(e) => onUploadFileChange(e.target.files?.[0] || null)} />
            </Button>
            {uploadFile ? <Typography variant="caption">Selected: {uploadFile.name}</Typography> : null}
            {uploadFile ? (
              <Button size="small" variant="text" onClick={() => onUploadFileChange(null)}>
                Clear
              </Button>
            ) : null}
          </Stack>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" variant="outlined" onClick={onClose}>Cancel</Button>
        <Button size="small" variant="contained" onClick={onSubmit} sx={{ backgroundColor: poDetailsColors.darkBlue }}>Submit Concession Request</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RaiseConcessionDialog;
