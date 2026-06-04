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
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { purchaseOrderService } from '@/api/services/purchaseOrderService';
import { PurchaseOrder, POFilters as POFiltersType } from '@/models';
import { useAuth } from '@/hooks/useAuth';
import POCard from '@/components/common/POCard';
import POFilters from '@/components/common/POFilters';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';
import { logger } from '@/services/logger';
// import StarIcon from '@mui/icons-material/Star';
// import StarBorderIcon from '@mui/icons-material/StarBorder';
 

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
  const pageSize = 60;
  const [rowCount, setRowCount] = useState(0);

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pin functionality
  const [pinnedPOIds, setPinnedPOIds] = useState<string[]>(() => {
    const stored = localStorage.getItem('pinnedPOs');
    return stored ? JSON.parse(stored) : [];
  });
  const [pinFilter, setPinFilter] = useState('all'); // 'all', 'pinned'

  // Update localStorage when pinnedPOIds changes
  useEffect(() => {
    localStorage.setItem('pinnedPOs', JSON.stringify(pinnedPOIds));
  }, [pinnedPOIds]);

  const togglePin = useCallback((poId: string) => {
    setPinnedPOIds((prev) =>
      prev.includes(poId) ? prev.filter((id) => id !== poId) : [...prev, poId]
    );
  }, []);

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: POFiltersType = {
        page: page + 1,
        page_size: pageSize,
        status: statusFilter,
        sort_by: (sortOrder as 'delivery_date_asc' | 'delivery_date_desc'),
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
      console.log('PO: ', response.data);
      // const pinned_columns = await userService.getPinnedColumns(user!.id);
      // console.log('PC: ', pinned_columns);
      setRowCount(response.total);
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      console.error('Error fetching purchase orders:', error);
      setError(error.response?.data?.detail || 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, sortOrder, searchQuery, user]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const handlePOClick = (po: PurchaseOrder) => {
    navigate(`/purchase-orders/${po.id}`);
  };

  // For DataGrid pagination
  // const handlePaginationModelChange = (model: { page: number; pageSize: number }) => {
  //   setPage(model.page);
  //   setPageSize(model.pageSize);
  // };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  // Filter and sort purchase orders
  const filteredAndSortedPOs = React.useMemo(() => {
    let filtered = [...purchaseOrders];

    // Apply pin filter
    if (pinFilter === 'pinned') {
      filtered = filtered.filter((po) => pinnedPOIds.includes(po.id));
    } else if (pinFilter === 'unpinned') {
      filtered = filtered.filter((po) => !pinnedPOIds.includes(po.id));
    }

    // Sort: pinned items first
    return filtered.sort((a, b) => {
      const aPinned = pinnedPOIds.includes(a.id);
      const bPinned = pinnedPOIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [purchaseOrders, pinnedPOIds, pinFilter]);

  // DataGrid columns
  const columns: GridColDef[] = React.useMemo(
    () => [
      {
        field: 'pin',
        headerName: 'Pin',
        width: 60,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Tooltip title={pinnedPOIds.includes(params.row.id) ? 'Unpin' : 'Pin'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                togglePin(params.row.id);
              }}
              sx={{
                color: pinnedPOIds.includes(params.row.id)
                  ? 'primary.main'
                  : 'action.disabled',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              {pinnedPOIds.includes(params.row.id) ? (
                <PushPinIcon sx={{ fontSize: '1.25rem' }} />
              ) : (
                <PushPinOutlinedIcon sx={{ fontSize: '1.25rem' }} />
              )}
            </IconButton>
          </Tooltip>
        ),
      },
      {
        field: 'po_number',
        headerName: 'PO Number',
        width: 150,
        renderCell: (params) => (
          <Typography
            fontWeight="bold"
            height={'100%'}
            alignContent={'center'}
            color={theme.palette.primary.light}
          >
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'supplier_name',
        headerName: 'Supplier Name',
        width: 150,
      },
      {
        field: 'supplier_id',
        headerName: 'Supplier ID',
        width: 100,
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
          <Typography height={'100%'} alignContent={'center'}>
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
        width: 70,
        renderCell: (params) => params.value.length,
      },
      {
        field: 'mrp_exceptions',
        headerName: 'MRP Exceptions',
        width: 150,
        renderCell: (params) => params.value,
      },
    ],
    [theme, pinnedPOIds, togglePin]
  );

  if (loading && purchaseOrders.length === 0) {
    return <LoadingSpinner message="Loading purchase orders..." />;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
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
        pinFilter={pinFilter}
        onPinFilterChange={(value) => {
          setPinFilter(value);
          setPage(0);
        }}
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {/* TODO: Optimise this block if selected */} 
      {purchaseOrders.length === 0 && !loading ? (
        <Alert severity="info">No purchase orders found</Alert>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <>
              <Box sx={{ height: '72vh', width: '100%', overflowY: 'scroll' }}>
                <Grid container spacing={3}>
                  {filteredAndSortedPOs.map((po) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={po.id}>
                      <Box sx={{ position: 'relative' }}>
                        <POCard po={po} onClick={handlePOClick} />
                        <Tooltip title={pinnedPOIds.includes(po.id) ? 'Unpin' : 'Pin'}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(po.id);
                            }}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              color: pinnedPOIds.includes(po.id)
                                ? 'primary.main'
                                : 'action.disabled',
                              backgroundColor: 'background.paper',
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              },
                              boxShadow: 1,
                            }}
                          >
                            {pinnedPOIds.includes(po.id) ? (
                              <PushPinIcon sx={{ fontSize: '1.25rem' }} />
                            ) : (
                              <PushPinOutlinedIcon sx={{ fontSize: '1.25rem' }} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              <Box sx={{ height: '2vh', display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Pagination
                  count={Math.ceil(rowCount / pageSize)}
                  page={page + 1}
                  onChange={(_, value) => setPage(value - 1)}
                  color="primary"
                  size="small"
                />
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ height: '72vh', width: '100%' }}>
                <DataGrid
                  rows={filteredAndSortedPOs}
                  columns={columns}
                  rowCount={rowCount}
                  rowHeight={40}
                  paginationMode="server"
                  hideFooter
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
              <Box sx={{ height: '2vh', display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Pagination
                  count={Math.ceil(rowCount / pageSize)}
                  page={page + 1}
                  onChange={(_, value) => setPage(value - 1)}
                  color="primary"
                  size="small"
                />
              </Box>
            </>
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
