import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Stack } from '@mui/material';
import { PurchaseOrder, PurchaseOrderStatus } from '@/models';
import { format } from 'date-fns';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface POCardProps {
  po: PurchaseOrder;
  onClick: (po: PurchaseOrder) => void;
}

const statusColors: Record<PurchaseOrderStatus, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
  CREATED: 'default',
  APPROVED: 'info',
  SENT_TO_SUPPLIER: 'primary',
  IN_TRANSIT: 'warning',
  DELIVERED: 'success',
  CANCELLED: 'error',
  IN_PROGRESS: 'secondary',
};

const POCard: React.FC<POCardProps> = ({ po, onClick }) => {
  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={() => onClick(po)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {po.po_number}
          </Typography>
          <Chip 
            label={po.status.replace(/_/g, ' ')} 
            color={statusColors[po.status]}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {po.supplier_name}
        </Typography>

        <Stack spacing={1} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoneyIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {po.currency} {po.total_value.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon fontSize="small" color="action" />
            <Typography variant="body2">
              Delivery: {format(new Date(po.delivery_date), 'MMM dd, yyyy')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShippingIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {po.line_items.length} item(s)
            </Typography>
          </Box>
        </Stack>

        {po.mrp_exceptions && po.mrp_exceptions !== 'NONE' && (
          <Chip
            label={po.mrp_exceptions}
            color="warning"
            size="small"
            sx={{ mt: 2 }}
          />
        )}
        {po.mrp_exceptions && po.mrp_exceptions === 'NONE' && (
          <Chip
            label={'No MRP Exceptions'}
            color="success"
            size="small"
            sx={{ mt: 2 }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default POCard;