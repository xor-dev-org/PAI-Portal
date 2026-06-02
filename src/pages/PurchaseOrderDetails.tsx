import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Grid,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { purchaseOrderService } from '@/api/services/purchaseOrderService';
import { PurchaseOrder, PurchaseOrderStatus } from '@/models';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DescriptionIcon from '@mui/icons-material/Description';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`po-tabpanel-${index}`}
      aria-labelledby={`po-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const statusColors: Record<PurchaseOrderStatus, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
  CREATED: 'default',
  APPROVED: 'info',
  SENT_TO_SUPPLIER: 'primary',
  IN_TRANSIT: 'warning',
  DELIVERED: 'success',
  CANCELLED: 'error',
  IN_PROGRESS: 'default'
};

const PurchaseOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [po, setPO] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (id) {
      fetchPODetails();
    }
  }, [id]);

  const fetchPODetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchaseOrderService.getPOById(id!);
      setPO(data);
    } catch (err: any) {
      console.error('Error fetching PO details:', err);
      setError(err.response?.data?.detail || 'Failed to load purchase order details');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <LoadingSpinner message="Loading purchase order details..." />;
  }

  if (error || !po) {
    return (
      <Box>
        <Alert severity="error">{error || 'Purchase order not found'}</Alert>
        <Box sx={{ mt: 2 }}>
          <IconButton onClick={() => navigate('/purchase-orders')}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/purchase-orders')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
          Purchase Order: {po.po_number}
        </Typography>
        <Chip 
          label={po.status.replace(/_/g, ' ')} 
          color={statusColors[po.status]}
          size="medium"
        />
      </Box>

      {/* Tabs */}
      <Paper>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="PO details tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="PO Details" />
          <Tab label="MRP Exceptions" />
          <Tab label="Shipment & Tracking" />
          <Tab label="Documents" />
          <Tab label="Revision History" />
        </Tabs>

        {/* Tab: PO Details */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: 3 }}>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <BusinessIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Supplier
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {po.supplier_name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Total Value
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {po.currency} {po.total_value.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Delivery Date
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {format(new Date(po.delivery_date), 'MMM dd, yyyy')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Line Items
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {po.line_items.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Detailed Information */}
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Order Information
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  PO Number
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {po.po_number}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Source System
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {po.source_system}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Created Date
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {format(new Date(po.created_date), 'MMM dd, yyyy')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Payment Terms
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {po.payment_terms}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Currency
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {po.currency}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Line Items */}
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Line Items
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Line #</strong></TableCell>
                    <TableCell><strong>Material Code</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell align="right"><strong>Quantity</strong></TableCell>
                    <TableCell align="right"><strong>Unit Price</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {po.line_items.map((item) => (
                    <TableRow key={item.line_number}>
                      <TableCell>{item.line_number}</TableCell>
                      <TableCell>{item.material_code}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {po.currency} {item.unit_price.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {po.currency} {(item.quantity * item.unit_price).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={5} align="right">
                      <strong>Total Value:</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{po.currency} {po.total_value.toLocaleString()}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Tab: MRP Exceptions */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              MRP Exception Messages
            </Typography>
            {po.mrp_exceptions && po.mrp_exceptions !== 'NONE' ? (
              <Alert severity="warning" icon={<DescriptionIcon />}>
                <Typography variant="body1" fontWeight="bold">
                  {po.mrp_exceptions}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Please review the exception and take necessary action.
                </Typography>
              </Alert>
            ) : (
              <Alert severity="success">
                No MRP exceptions for this purchase order.
              </Alert>
            )}
          </Box>
        </TabPanel>

        {/* Tab: Shipment & Tracking */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Shipment & Tracking Information
            </Typography>
            <Alert severity="info">
              Shipment tracking functionality will be available soon.
            </Alert>
          </Box>
        </TabPanel>

        {/* Tab: Documents */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Documents
            </Typography>
            <Alert severity="info">
              Document management functionality will be available soon.
            </Alert>
          </Box>
        </TabPanel>

        {/* Tab: Revision History */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Revision History
            </Typography>
            <Alert severity="info">
              Revision history functionality will be available soon.
            </Alert>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PurchaseOrderDetails;