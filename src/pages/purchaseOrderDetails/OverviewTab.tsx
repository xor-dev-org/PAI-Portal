import React from 'react';
import { Avatar, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { PurchaseOrder } from '@/models';
import {
  formatDateForDisplay,
  formatDeliveryBadge,
  getConfirmedDate,
  getDaysDelta,
  getRequiredDeliveryDate,
} from './utils';

type OverviewTabProps = {
  po: PurchaseOrder;
};

const OverviewTab: React.FC<OverviewTabProps> = ({ po }) => {
  const requiredDeliveryDate = getRequiredDeliveryDate(po);
  const confirmedDate = getConfirmedDate(po);
  const deliveryBadge = formatDeliveryBadge(getDaysDelta(requiredDeliveryDate));

  return (
    <Stack spacing={1} p={1}>
      <Paper variant="outlined" sx={{ p: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 0 }}>Purchase Order Details</Typography>
        <Grid container rowSpacing={1} columnSpacing={1}>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">PO Number</Typography><Typography variant="body2">{po.po_number || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Order Type</Typography><Typography variant="body2">{po.source_system || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Required Delivery</Typography><Stack direction="row" spacing={1}><Typography variant="body2">{formatDateForDisplay(requiredDeliveryDate)}</Typography><Chip label={deliveryBadge.label} size="small" color={deliveryBadge.color} variant="outlined" sx={{border: 'none'}} /></Stack></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Confirmed Date</Typography><Typography variant="body2">{formatDateForDisplay(confirmedDate)}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Source Agreement</Typography><Typography variant="body2">{po.source_system || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Buyer</Typography><Typography variant="body2">{po.procurement_specialist_id || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Order Date</Typography><Typography variant="body2">{formatDateForDisplay(po.created_date)}</Typography></Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 0 }}>Supplier Details</Typography>
        <Grid container rowSpacing={1} columnSpacing={3}>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Supplier</Typography><Stack direction="row" spacing={1} alignItems="center"><Avatar sx={{ width: 24, height: 24 }}>{(po.supplier_name || '?').charAt(0)}</Avatar><Typography variant="body2">{po.supplier_name || '-'}</Typography></Stack></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Email</Typography><Typography variant="body2">{po.supplier_email || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Supplier Code</Typography><Typography variant="body2">{po.supplier_id || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Phone</Typography><Typography variant="body2">{(po as any).supplier_phone || '-'}</Typography></Grid>
          <Grid item xs={12}><Typography variant="caption" color="text.secondary">Address</Typography><Typography variant="body2">{po.po_details?.supplier_details?.address || '-'}</Typography></Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 0 }}>Shipment Details</Typography>
        <Grid container rowSpacing={1} columnSpacing={3}>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Incoterm</Typography><Typography variant="body2">{po.po_details?.shipment_details?.incoterms || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Phone</Typography><Typography variant="body2">{po.po_details?.buyer_details?.telephone || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Address</Typography><Typography variant="body2">{po.po_details?.shipment_details?.address || '-'}</Typography></Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 0 }}>Billing Details</Typography>
        <Grid container rowSpacing={1} columnSpacing={3}>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Send invoice to</Typography><Typography variant="body2">{po.po_details?.billing_details?.send_invoice_to || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Bill To Address</Typography><Typography variant="body2">{po.po_details?.billing_details?.bill_to_address || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Payment Terms</Typography><Typography variant="body2">{po.payment_terms || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Currency</Typography><Typography variant="body2">{po.currency || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Order Value</Typography><Typography variant="body2">{po.total_value || 0}</Typography></Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 0 }}>Additional Information</Typography>
        <Grid container rowSpacing={1} columnSpacing={3}>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Cost Center</Typography><Typography variant="body2">{po.po_details?.buyer_details?.buyer || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">PO Owner</Typography><Typography variant="body2">{po.procurement_specialist_id || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Notes</Typography><Typography variant="body2">{po.mrp_exceptions || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6} md={3}><Typography variant="caption" color="text.secondary">Attachments</Typography><Typography variant="body2" color="primary.main">View documents in Documents tab</Typography></Grid>
        </Grid>
      </Paper>
    </Stack>
  );
};

export default OverviewTab;
