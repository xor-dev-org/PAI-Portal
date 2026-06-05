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
  useTheme,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { purchaseOrderService } from '@/api/services/purchaseOrderService';
import {
  PurchaseOrder,
  POFilters as POFiltersType,
  AdvanceFilters,
  PurchaseOrderStatus,
} from '@/models';
import { useAuth } from '@/hooks/useAuth';
import POFilters from '@/components/common/POFilters';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { format } from 'date-fns';
import { logger } from '@/services/logger';
// import StarIcon from '@mui/icons-material/Star';
// import StarBorderIcon from '@mui/icons-material/StarBorder';

import ClearIcon from '@mui/icons-material/Clear';
import './grid.css';
//import { userService } from '@/api/services/userService';

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
  // const [sortBy, setSortBy] = useState('');
  // const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortModel, setSortModel] = useState<{sort_by: string | undefined, sort_order: 'asc' | 'desc'}>({sort_by: '', sort_order: 'desc'});

  const { page, pageSize, setPage, setPageSize } = usePagination(0, 60);
  const [rowCount, setRowCount] = useState(0);
  const debouncedSearchQuery = useDebounce(searchQuery, 600);

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advanceFilters, setAdvancefilters] = useState<AdvanceFilters>({});
  const [advanceTempFilters, setAdvanceTempfilters] = useState<AdvanceFilters>({});
  // const advanceFiltersRef = useRef<AdvanceFilters>({});

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
    const startTime = performance.now();
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching purchase orders with sort model:', sortModel);

      const filters: POFiltersType = {
        page: page + 1,
        page_size: pageSize,
        status: statusFilter,
        sort_by: sortModel.sort_by,
        sort_order: sortModel.sort_order,
        search: debouncedSearchQuery,
        ...advanceFilters,
      };

      logger.info('Fetching purchase orders', {
        page: filters.page,
        pageSize: filters.page_size,
        status: filters.status,
        search: debouncedSearchQuery,
        advanceFilters: Object.keys(advanceFilters).length,
      });

      if (user?.role === 'SUPPLIER') {
        filters.supplier_id = user.id;
      } else if (user?.role === 'PROCUREMENT_SPECIALIST') {
        filters.procurement_specialist_id = user.id;
      }

      const response = await purchaseOrderService.getPOList(filters);
      setPurchaseOrders(response.data);
      setRowCount(response.total);

      logger.info('Purchase orders fetched', {
        durationMs: Math.round(performance.now() - startTime),
        rowCount: response.total,
      });
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      console.error('Error fetching purchase orders:', error);
      setError(error.response?.data?.detail || 'Failed to load purchase orders');
      logger.error('Failed to fetch purchase orders', {
        durationMs: Math.round(performance.now() - startTime),
        error: error.response?.data?.detail || error,
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, sortModel, debouncedSearchQuery, user, advanceFilters]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const handlePOClick = (po: PurchaseOrder) => {
    navigate(`/purchase-orders/${po.id}`);
  };

  const appliedFilters = [
    advanceFilters.po_number && {
      key: 'po_number',
      label: `PO: ${advanceFilters.po_number}`,
    },

    advanceFilters.supplier_name && {
      key: 'supplier_name',
      label: `Supplier: ${advanceFilters.supplier_name}`,
    },

    advanceFilters.source_system && {
      key: 'source_system',
      label: `Source: ${advanceFilters.source_system}`,
    },

    advanceFilters.total_value_from !== undefined && {
      key: 'total_value_from',
      label: `Value ≥ ${advanceFilters.total_value_from}`,
    },

    advanceFilters.total_value_to !== undefined && {
      key: 'total_value_to',
      label: `Value ≤ ${advanceFilters.total_value_to}`,
    },

    advanceFilters.delivery_date_from && {
      key: 'delivery_date_from',
      label: `Delivery From ${advanceFilters.delivery_date_from}`,
    },

    advanceFilters.delivery_date_to && {
      key: 'delivery_date_to',
      label: `Delivery To ${advanceFilters.delivery_date_to}`,
    },

    advanceFilters.items_from !== undefined && {
      key: 'items_from',
      label: `Items ≥ ${advanceFilters.items_from}`,
    },

    advanceFilters.items_to !== undefined && {
      key: 'items_to',
      label: `Items ≤ ${advanceFilters.items_to}`,
    },

    advanceFilters.mrp_exceptions && {
      key: 'mrp_exceptions',
      label: `MRP: ${advanceFilters.mrp_exceptions}`,
    },
  ].filter(Boolean) as {
    key: keyof AdvanceFilters;
    label: string;
  }[];

  // For DataGrid pagination
  const handlePaginationModelChange = (model: { page: number; pageSize: number }) => {
    if (model.pageSize !== pageSize) {
      setPageSize(model.pageSize);
      setPage(0);
    } else {
      setPage(model.page);
    }
  };

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
  const handleAdvanceFilterChange = <K extends keyof AdvanceFilters>(
    key: K,
    value: AdvanceFilters[K]
  ) => {
    setAdvanceTempfilters((prev) => {
      const updated = {
        ...prev,
        [key]: value,
      };

      return updated;
    });
  };

  const handleClearAdvanceFilters = () => {
    setAdvanceTempfilters({});
    setAdvancefilters({});
    // advanceFiltersRef.current = {};
  };

  const handleApplyAdvanceFilters = () => {
    // TODO: Apply filters to the purchase orders list
    console.log('Applying filters:', advanceTempFilters);
    setPage(0);
    setAdvancefilters({ ...advanceTempFilters });
    setShowAdvancedFilters(false);
  };

  const statusColors = React.useMemo(
    () => ({
      CREATED: 'default',
      APPROVED: 'info',
      SENT_TO_SUPPLIER: 'primary',
      IN_TRANSIT: 'warning',
      DELIVERED: 'success',
      CANCELLED: 'error',
      IN_PROGRESS: 'warning',
    }) as Record<
      PurchaseOrderStatus,
      'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
    >,
    []
  );

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
                color: pinnedPOIds.includes(params.row.id) ? 'primary.main' : 'action.disabled',
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
            fontSize={'0.8rem'}
            color={theme.palette.primary.light}
          >
            {params.value}
          </Typography>
        ),
        sx: {
          '&:hover': {
            color: theme.palette.primary.main,
          },
        },
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
          <Chip
            variant="outlined"
            label={params.value.replace(/_/g, ' ')}
            color={statusColors[params.value as PurchaseOrderStatus]}
            size="small"
          />
        ),
        
      },
      {
        field: 'total_value',
        headerName: 'Total Value',
        width: 150,
        renderCell: (params) => (
          <Typography height={'100%'} alignContent={'center'} fontSize={'0.8rem'}>
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
        renderCell: (params) =>  <Chip
            variant="filled"
            label={params.value.replace(/_/g, ' ')}
            color={params.value === 'NONE' ? 'success' : 'error'}
            size="small"
          />,
      },
    ],
    [theme, pinnedPOIds, togglePin, statusColors]
  );

  if (loading && purchaseOrders.length === 0) {
    return <LoadingSpinner message="Loading purchase orders..." />;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Purchase Order Listing
      </Typography>
      <Typography variant="body2" gutterBottom fontWeight="bold">
        Updated on {new Date().toLocaleString()}
      </Typography>
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
          <Box sx={{ height: appliedFilters.length > 0 ? '80vh' : '80vh', width: '100%' }}>
            <DataGrid
              rows={filteredAndSortedPOs}
              columns={columns}
              rowCount={rowCount}
              rowHeight={35}
              getRowClassName={(params) => {
                // console.log('params: ', params);
                return params.indexRelativeToCurrentPage % 2 === 0 ? 'light_row' : 'dark_row';
              }}
              pagination
              paginationMode="server"
              // rowCountMode="server"
              pageSizeOptions={[10, 25, 50, 60, 100]}
              loading={loading}
              onPaginationModelChange={handlePaginationModelChange}
              paginationModel={{ page, pageSize }}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              hideFooterSelectedRowCount
              sortingMode="server"
              onSortModelChange={(model) => {
                console.log('sort model: ', model);
                console.log('sort model state: ', sortModel);
                setSortModel({
                  sort_by: model[0]?.field,
                  // sort_order: (sortModel.sort_order == 'asc' || sortModel.sort_order == 'desc') ? sortModel.sort_order : 'asc',
                  sort_order: (sortModel.sort_order == 'asc') ? 'desc': 'asc',
                });
                // setSortBy(model[0]?.field || '');
                // setSortOrder(model[0]?.sort as 'asc' | 'desc' || 'asc');
                setPage(0);
              }}
              onRowClick={(params) => handlePOClick(params.row as PurchaseOrder)}
              sx={{
                '& .MuiDataGrid-row': {
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  fontSize: '0.8rem',
                },

                '& .MuiDataGrid-toolbarContainer': {
                  justifyContent: 'flex-end',
                  width: '100%',
                },
              }}
              slots={{
                toolbar: () => (
                  <>
                    <POFilters
                      searchQuery={searchQuery}
                      onSearchChange={handleSearchChange}
                      statusFilter={statusFilter}
                      onStatusChange={(value) => {
                        setStatusFilter(value);
                        setPage(0);
                      }}
                      sortOrder={sortModel.sort_order}
                      // onSortChange={(value) => {                       
                      //   setSortOrder(value);
                      //   setPage(0);
                      // }}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      onFiltersClick={() => setShowAdvancedFilters(true)}
                      pinFilter={pinFilter}
                      onPinFilterChange={(value) => {
                        setPinFilter(value);
                        setPage(0);
                      }}
                    />
                    <Box height={appliedFilters.length > 0 ? '4vh' : '0vh'} sx={{ mb: 0, pl: 1 }}>
                      {/* <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 1 }}>
                        {rowCount} purchase orders.
                      </Typography> */}
                      {appliedFilters.length > 0 && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {appliedFilters.map((filter) => (
                            <Chip
                              key={filter.key}
                              label={filter.label}
                              size="small"
                              color="primary"
                              variant="outlined"
                              onDelete={() => {
                                const updated = { ...advanceFilters };
                                delete updated[filter.key];
                                setAdvancefilters(updated);
                                setAdvanceTempfilters(updated);
                              }}
                            />
                          ))}

                          <Chip
                            size="small"
                            label="Clear All"
                            color="error"
                            onClick={() => {
                              setAdvancefilters({});
                              setAdvanceTempfilters({});
                            }}
                          />
                        </Stack>
                      )}
                    </Box>
                  </>
                ),
              }}
            />
          </Box>
        </>
      )}
      {/* Advanced Filters Dialog */}
      <Dialog
        open={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            // position: 'absolute',
            // top: '25%',
            // left: '68%',
            // transform: 'translate(-50%, -20%)',
            // borderRadius: 2,
            // boxShadow: 24,
          },
        }}
      >
        <DialogTitle>Advanced Filters</DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* PO Number */}
            <Grid item xs={12} md={6}>
              <TextField
                label="PO Number"
                fullWidth
                size="small"
                value={advanceTempFilters.po_number || ''}
                onChange={(e) => handleAdvanceFilterChange('po_number', e.target.value)}
                InputProps={{
                  endAdornment: advanceTempFilters.po_number ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => handleAdvanceFilterChange('po_number', undefined)}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                }}
              />
            </Grid>

            {/* Supplier */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Supplier Name"
                fullWidth
                size="small"
                value={advanceTempFilters.supplier_name || ''}
                onChange={(e) => handleAdvanceFilterChange('supplier_name', e.target.value)}
              />
            </Grid>

            {/* Source */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Source System</InputLabel>

                <Select
                  label="Source System"
                  value={advanceTempFilters.source_system || ''}
                  onChange={(e) =>
                    handleAdvanceFilterChange('source_system', e.target.value || undefined)
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="SAP">SAP</MenuItem>
                  <MenuItem value="Oracle">Oracle</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* MRP */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>MRP Exceptions</InputLabel>

                <Select
                  label="MRP Exceptions"
                  value={advanceTempFilters.mrp_exceptions || ''}
                  onChange={(e) =>
                    handleAdvanceFilterChange('mrp_exceptions', e.target.value || undefined)
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Value Range */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Total Value From"
                type="number"
                fullWidth
                size="small"
                value={advanceTempFilters.total_value_from || ''}
                onChange={(e) =>
                  handleAdvanceFilterChange(
                    'total_value_from',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Total Value To"
                type="number"
                fullWidth
                size="small"
                value={advanceTempFilters.total_value_to || ''}
                onChange={(e) =>
                  handleAdvanceFilterChange(
                    'total_value_to',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </Grid>

            {/* Delivery Date Range */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Delivery From"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={advanceTempFilters.delivery_date_from || ''}
                onChange={(e) => handleAdvanceFilterChange('delivery_date_from', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Delivery To"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={advanceTempFilters.delivery_date_to || ''}
                onChange={(e) => handleAdvanceFilterChange('delivery_date_to', e.target.value)}
              />
            </Grid>

            {/* Items Range */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Items From"
                type="number"
                fullWidth
                size="small"
                value={advanceTempFilters.items_from || ''}
                onChange={(e) =>
                  handleAdvanceFilterChange(
                    'items_from',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Items To"
                type="number"
                fullWidth
                size="small"
                value={advanceTempFilters.items_to || ''}
                onChange={(e) =>
                  handleAdvanceFilterChange(
                    'items_to',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'space-between',
            px: 3,
            py: 2,
          }}
        >
          <Button color="error" variant="outlined" onClick={handleClearAdvanceFilters}>
            Clear All
          </Button>

          <Box>
            <Button sx={{ mr: 1 }} onClick={() => setShowAdvancedFilters(false)}>
              Cancel
            </Button>

            <Button variant="contained" onClick={handleApplyAdvanceFilters}>
              Apply Filters
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrders;
