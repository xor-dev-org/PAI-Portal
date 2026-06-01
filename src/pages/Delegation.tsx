import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Delegation, DelegationStatus, PurchaseOrder, User, UserRole, POFilters } from '@/models';
import { delegationService } from '@/api/services/delegationService';
import { purchaseOrderService } from '@/api/services/purchaseOrderService';
import { userService } from '@/api/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/services/logger';

const DelegationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form states
  const [selectedPO, setSelectedPO] = useState<string>('');
  const [delegateTo, setDelegateTo] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [role] = useState<string>('PROCUREMENT_SPECIALIST');

  // Data states
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [procurementSpecialists, setProcurementSpecialists] = useState<User[]>([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [delegationToDelete, setDelegationToDelete] = useState<Delegation | null>(null);

  // Fetch delegations when filters change
  useEffect(() => {
    fetchDelegations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, sortOrder, searchQuery]);

  // Fetch delegations when filters change
  useEffect(() => {
    fetchDelegations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, sortOrder, searchQuery]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // If current user is a procurement specialist, fetch only POs assigned to them
      const poFilters: POFilters = { page_size: 100 };
      if (user?.role === UserRole.PROCUREMENT_SPECIALIST) {
        poFilters.procurement_specialist_id = user.id;
      }

      const [delegationsRes, posRes, psRes] = await Promise.all([
        delegationService.getDelegationList({ page: 1, page_size: pageSize }),
        purchaseOrderService.getPOList(poFilters),
        userService.getUsersByRole(UserRole.PROCUREMENT_SPECIALIST),
      ]);

      // Save raw delegation list; visible filtering will be applied in fetchDelegations
      setDelegations(delegationsRes.data);
      setPurchaseOrders(posRes.data);
      setProcurementSpecialists(psRes);
      setError(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      logger.error('Error fetching data', { error: String(err) });
      setError(error.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [pageSize, user]);

  // Fetch initial data when component mounts or user changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  const fetchDelegations = useCallback(async () => {
    try {
      const response = await delegationService.getDelegationList({
        page,
        page_size: pageSize,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        sort_by: sortOrder as 'date_asc' | 'date_desc',
      });

      let data = response.data;

      // If procurement specialist, limit to delegations they created or that were delegated to them
      if (user?.role === UserRole.PROCUREMENT_SPECIALIST) {
        data = data.filter(
          (d) => d.delegated_from_id === user.id || d.delegated_to_id === user.id
        );
      }

      setDelegations(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      logger.error('Error fetching delegations', { error: String(err) });
      setError(error.response?.data?.detail || 'Failed to load delegations');
    }
  }, [page, pageSize, statusFilter, searchQuery, sortOrder, user]);

  const handleAddDelegation = async () => {
    if (!selectedPO || !delegateTo || !startDate || !endDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const selectedPOData = purchaseOrders.find(po => po.id === selectedPO);
      const delegateToUser = procurementSpecialists.find(ps => ps.id === delegateTo);

      if (!selectedPOData || !delegateToUser) {
        setError('Invalid PO or user selected');
        return;
      }

      const delegationData = {
        po_id: selectedPOData.id,
        po_number: selectedPOData.po_number,
        supplier_name: selectedPOData.supplier_name,
        delegated_from_id: user?.id || '',
        delegated_from_name: user?.name || '',
        delegated_to_id: delegateToUser.id,
        delegated_to_name: delegateToUser.name,
        role: role,
        start_date: startDate,
        end_date: endDate,
        total_value: selectedPOData.total_value,
      };

      await delegationService.createDelegation(delegationData);

      setSuccessMessage('Delegation added successfully');
      setTimeout(() => setSuccessMessage(null), 3000);

      // Reset form
      setSelectedPO('');
      setDelegateTo('');
      setStartDate('');
      setEndDate('');

      // Refresh delegations
      await fetchDelegations();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      logger.error('Error creating delegation', { error: String(err) });
      setError(error.response?.data?.detail || 'Failed to create delegation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDelegation = async () => {
    if (!delegationToDelete) return;

    try {
      setSubmitting(true);
      await delegationService.deleteDelegation(delegationToDelete.id);
      setSuccessMessage('Delegation removed successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      setDeleteDialogOpen(false);
      setDelegationToDelete(null);
      await fetchDelegations();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      logger.error('Error deleting delegation', { error: String(err) });
      setError(error.response?.data?.detail || 'Failed to remove delegation');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (delegation: Delegation) => {
    setDelegationToDelete(delegation);
    setDeleteDialogOpen(true);
  };

  const getStatusColor = (status: DelegationStatus) => {
    const statusColors: Record<DelegationStatus, 'error' | 'warning' | 'success' | 'info'> = {
      [DelegationStatus.DRAFT]: 'info',
      [DelegationStatus.APPROVED]: 'success',
      [DelegationStatus.ACKNOWLEDGED]: 'info',
      [DelegationStatus.IN_PROGRESS]: 'warning',
      [DelegationStatus.COMPLETED]: 'success',
      [DelegationStatus.CANCELLED]: 'error',
    };
    return statusColors[status] || 'default';
  };

  const getDelegatedToName = (delegation: Delegation) => {
    if (delegation.delegated_to_name && !delegation.delegated_to_name.startsWith('PS-')) {
      return delegation.delegated_to_name;
    }

    const psUser = procurementSpecialists.find((ps) => ps.id === delegation.delegated_to_id);
    return psUser?.name || delegation.delegated_to_name || delegation.delegated_to_id;
  };

  const handlePONumberClick = (poId: string) => {
    navigate(`/purchase-orders/${poId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <SwapHorizIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">
          Delegate Responsibilities
        </Typography>
      </Box>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Create New Delegation Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Create New Delegation
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6} lg={2.4}>
            <TextField
              select
              fullWidth
              label="Select PO"
              value={selectedPO}
              onChange={(e) => setSelectedPO(e.target.value)}
              required
              size="small"
            >
              <MenuItem value="">
                <em>Select PO</em>
              </MenuItem>
              {purchaseOrders.map((po) => (
                <MenuItem key={po.id} value={po.id}>
                  {po.po_number}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6} lg={2.4}>
            <TextField
              select
              fullWidth
              label="Delegate To"
              value={delegateTo}
              onChange={(e) => setDelegateTo(e.target.value)}
              required
              size="small"
            >
              <MenuItem value="">
                <em>Select PS</em>
              </MenuItem>
              {procurementSpecialists.map((ps) => (
                <MenuItem key={ps.id} value={ps.id}>
                  {ps.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6} lg={2.4}>
            <TextField
              fullWidth
              label="Select Role"
              value={role}
              disabled
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={2.4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={2.4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddDelegation}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Add Delegation'}
          </Button>
        </Box>
      </Paper>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by PS Name, PO Number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
            sx={{ flex: 1 }}
          />

          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value={DelegationStatus.DRAFT}>Draft</MenuItem>
            <MenuItem value={DelegationStatus.APPROVED}>Approved</MenuItem>
            <MenuItem value={DelegationStatus.ACKNOWLEDGED}>Acknowledged</MenuItem>
            <MenuItem value={DelegationStatus.IN_PROGRESS}>In Progress</MenuItem>
            <MenuItem value={DelegationStatus.COMPLETED}>Completed</MenuItem>
            <MenuItem value={DelegationStatus.CANCELLED}>Cancelled</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="date_desc">Latest First</MenuItem>
            <MenuItem value="date_asc">Oldest First</MenuItem>
          </TextField>

          <Tooltip title="Advanced filters coming soon">
            <IconButton size="small" disabled>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Active Delegations Table */}
      <Paper>
        <Typography variant="h6" fontWeight="bold" sx={{ p: 2 }}>
          Active Delegation
        </Typography>

        {delegations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">No delegations found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    PO Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>PS Name (Assigned To)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {delegations.map((delegation) => (
                  <TableRow key={delegation.id} hover>
                    <TableCell>
                      <Typography
                        component="button"
                        onClick={() => handlePONumberClick(delegation.po_id)}
                        sx={{
                          color: 'primary.main',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontWeight: '500',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {delegation.po_number}
                      </Typography>
                    </TableCell>
                    <TableCell>{getDelegatedToName(delegation)}</TableCell>
                    <TableCell>{format(new Date(delegation.start_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(new Date(delegation.end_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Chip
                        label={delegation.status}
                        size="small"
                        color={getStatusColor(delegation.status as DelegationStatus)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Remove delegation">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openDeleteDialog(delegation)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Remove Delegation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove the delegation for PO {delegationToDelete?.po_number}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteDelegation} color="error" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DelegationPage;
