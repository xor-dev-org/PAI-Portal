import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { PurchaseOrder, PurchaseOrderStatus } from '@/models';
import { format } from 'date-fns';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface POCardProps {
  po: PurchaseOrder;
  onClick: (po: PurchaseOrder) => void;
}

const statusColors: Record<
  PurchaseOrderStatus,
  'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
> = {
  CREATED: 'default',
  APPROVED: 'info',
  SENT_TO_SUPPLIER: 'primary',
  IN_TRANSIT: 'warning',
  DELIVERED: 'success',
  CANCELLED: 'error',
  IN_PROGRESS: 'secondary',
};

const POCard: React.FC<POCardProps> = ({ po, onClick }) => (
  <Card
    onClick={() => onClick(po)}
    sx={{
      cursor: 'pointer',
      p: 1,
      '&:hover': { boxShadow: 3 },
    }}
  >
    <CardContent sx={{ p: '8px !important' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" fontWeight={600}>
          {po.po_number}
        </Typography>
        <Chip
          label={po.status.replace(/_/g, ' ')}
          color={statusColors[po.status]}
          variant='outlined'
          size="small"
        />
      </Box>

      {/* Supplier */}
      <Typography variant="caption" color="text.secondary" noWrap>
        {po.supplier_name}
      </Typography>

      {/* Inline details */}
      <Box display="flex" gap={1} mt={0.5} flexWrap="wrap" alignItems="center">
        <Box display="flex" alignItems="center" gap={0.5}>
          <AttachMoneyIcon fontSize="inherit" />
          <Typography variant="caption">
            {po.currency} {po.total_value.toLocaleString()}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          <CalendarTodayIcon fontSize="inherit" />
          <Typography variant="caption">
            {format(new Date(po.delivery_date), 'MMM dd')}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          <LocalShippingIcon fontSize="inherit" />
          <Typography variant="caption">
            {po.line_items.length}
          </Typography>
        </Box>
      </Box>

      {/* MRP chip */}
      <Box mt={0.5}>
        <Chip
          label={
            po.mrp_exceptions && po.mrp_exceptions !== 'NONE'
              ? po.mrp_exceptions
              : 'No MRP'
          }
          color={
            po.mrp_exceptions && po.mrp_exceptions !== 'NONE'
              ? 'warning'
              : 'success'
          }
          size="small"
          variant='outlined'
        />
      </Box>
    </CardContent>
  </Card>
);

export default POCard;