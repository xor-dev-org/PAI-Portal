import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Pagination,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { purchaseOrderService } from '@/api/services/purchaseOrderService';
import { PurchaseOrder, POFilters as POFiltersType } from '@/models';
import { useAuth } from '@/hooks/useAuth';
import POCard from '@/components/common/POCard';
import POFilters from '@/components/common/POFilters';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';
import { logger } from '@/services/logger';

const PurchaseOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('delivery_date_desc');
  const [page, setPage] = useState(0); // DataGrid uses 0-based page
  const [pageSize, setPageSize] = useState(12);
  const [rowCount, setRowCount] = useState(0);

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);



  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: POFiltersType = {
        page: page + 1,
        page_size: pageSize,
        status: statusFilter,
        sort_by: sortOrder as any,
        search: searchQuery,
      };

      logger.info(
        'Fetching purchase orders with filters',
        filters.status ? { status: filters.status } : {}
      );

      if (user?.role === 'SUPPLIER') {
        filters.supplier_id = user.id;
      } else if (user?.role === 'PROCUREMENT_SPECIALIST') {
        filters.procurement_specialist_id = user.id;
      }

      const response = await purchaseOrderService.getPOList(filters);
      setPurchaseOrders(response.data);
      setRowCount(response.total);
    } catch (err: any) {
      console.error('Error fetching purchase orders:', err);
      setError(err.response?.data?.detail || 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, sortOrder, searchQuery, user]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const handlePOClick = (po: PurchaseOrder) => {
    navigate(`/purchase-orders/${po.id}`);
  };

  // For DataGrid pagination
  const handlePaginationModelChange = (model: { page: number; pageSize: number }) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'po_number',
      headerName: 'PO Number',
      width: 150,
      renderCell: (params) => (
        <Typography fontWeight="bold" height={'100%'} alignContent={'center'} color={theme.palette.primary.light}>{params.value}</Typography>
      ),
    },
    {
      field: 'supplier_name',
      headerName: 'Supplier',
      width: 200,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" height={'100%'} alignContent={'center'}>
          {params.value.replace(/_/g, ' ')}
        </Typography>
      ),
    },
    {
      field: 'total_value',
      headerName: 'Total Value',
      width: 150,
      renderCell: (params) => (
        <Typography  height={'100%'} alignContent={'center'}>
          {params.row.currency} {params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'delivery_date',
      headerName: 'Delivery Date',
      width: 150,
      renderCell: (params) => format(new Date(params.value), 'MMM dd, yyyy'),
    },
    {
      field: 'source_system',
      headerName: 'Source',
      width: 120,
    },
    {
      field: 'line_items',
      headerName: 'Items',
      width: 100,
      renderCell: (params) => params.value.length,
    },
  ];

  if (loading && purchaseOrders.length === 0) {
    return <LoadingSpinner message="Loading purchase orders..." />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Purchase Order Listing
      </Typography>

      <POFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(0);
        }}
        sortOrder={sortOrder}
        onSortChange={(value) => {
          setSortOrder(value);
          setPage(0);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFiltersClick={() => setShowAdvancedFilters(true)}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {purchaseOrders.length === 0 && !loading ? (
        <Alert severity="info">No purchase orders found</Alert>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <>
              <Grid container spacing={3}>
                {purchaseOrders.map((po) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={po.id}>
                    <POCard po={po} onClick={handlePOClick} />
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={Math.ceil(rowCount / pageSize)}
                  page={page + 1}
                  onChange={(_, value) => setPage(value - 1)}
                  color="primary"
                  size="large"
                />
              </Box>
            </>
          ) : (
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={purchaseOrders}
                columns={columns}
                rowCount={rowCount}
                pagination
                paginationMode="server"
                paginationModel={{ page, pageSize }}
                onPaginationModelChange={handlePaginationModelChange}
                disableRowSelectionOnClick
                hideFooterSelectedRowCount
                onRowClick={(params) => handlePOClick(params.row as PurchaseOrder)}
                sx={{
                  '& .MuiDataGrid-row': {
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Advanced Filters Dialog */}
      <Dialog
        open={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Advanced Filters</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Additional filters will be available here
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAdvancedFilters(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrders;