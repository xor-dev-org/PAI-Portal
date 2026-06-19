import React from 'react';
import {
  Box,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PODetailsPanel } from '@/models';
import { poDetailsColors } from './constants';

interface DetailItemProps {
  label: string;
  value?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <Box sx={{ mb: 1 }}>
    <Typography sx={{ fontSize: 11, color: poDetailsColors.textSecondary }}>{label}</Typography>
    <Typography sx={{ fontSize: 12, color: poDetailsColors.textPrimary }}>{value || '-'}</Typography>
  </Box>
);

interface PoDetailsPanelProps {
  expanded: boolean;
  details?: PODetailsPanel;
  onToggle: () => void;
}

const PoDetailsPanelComponent: React.FC<PoDetailsPanelProps> = ({ expanded, details, onToggle }) => {
  const supplier = details?.supplier_details;
  const buyer = details?.buyer_details;
  const shipment = details?.shipment_details;
  const billing = details?.billing_details;

  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: poDetailsColors.border,
        boxShadow: '0 1px 2px rgba(15,23,42,0.08)',
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: expanded ? `1px solid ${poDetailsColors.border}` : 'none',
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>PO Details</Typography>
        <IconButton size="small" onClick={onToggle}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Grid container>
          <Grid item xs={12} md={6} lg={3} sx={{ p: 1.5, borderRight: { lg: `1px dotted ${poDetailsColors.divider}` } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1 }}>Supplier Details</Typography>
            <DetailItem label="Supplier No" value={supplier?.supplier_no} />
            <DetailItem label="Email" value={supplier?.email} />
            <DetailItem label="Address" value={supplier?.address} />
          </Grid>
          <Grid item xs={12} md={6} lg={3} sx={{ p: 1.5, borderRight: { lg: `1px dotted ${poDetailsColors.divider}` } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1 }}>Buyer Details</Typography>
            <DetailItem label="Buyer" value={buyer?.buyer} />
            <DetailItem label="Telephone" value={buyer?.telephone} />
            <DetailItem label="Email" value={buyer?.email} />
          </Grid>
          <Grid item xs={12} md={6} lg={3} sx={{ p: 1.5, borderRight: { lg: `1px dotted ${poDetailsColors.divider}` } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1 }}>Shipment Details</Typography>
            <DetailItem label="Incoterms" value={shipment?.incoterms} />
            <DetailItem label="Address" value={shipment?.address} />
          </Grid>
          <Grid item xs={12} md={6} lg={3} sx={{ p: 1.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1 }}>Billing Details</Typography>
            <DetailItem label="Terms of Payment" value={billing?.terms_of_payment} />
            <DetailItem label="Currency" value={billing?.currency} />
            <DetailItem label="Send Invoice To" value={billing?.send_invoice_to} />
            <DetailItem label="Bill To Address" value={billing?.bill_to_address} />
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
};

export default PoDetailsPanelComponent;
