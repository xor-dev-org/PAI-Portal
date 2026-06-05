import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { userService } from '@/api/services/userService';
import {
  PurchaseOrder,
  POFilters as POFiltersType,
  AdvanceFilters,
  PurchaseOrderStatus,
} from '@/models';
import { useAuth } from '@/hooks/useAuth';
import POCard from '@/components/common/POCard';
import POFilters from '@/components/common/POFilters';
import LoadingSpinner from '@/components/common/LoadingSpinner';
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
  const [sortOrder, setSortOrder] = useState('delivery_date_desc');
  const [page, setPage] = useState(0); // DataGrid uses 0-based page
  const pageSize = 60;
  const [rowCount, setRowCount] = useState(0);

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advanceFilters, setAdvancefilters] = useState<AdvanceFilters>({});
  const [advanceTempFilters, setAdvanceTempfilters] = useState<AdvanceFilters>({});
  // const advanceFiltersRef = useRef<AdvanceFilters>({});

  // Pin functionality (scoped per-user)
  const [pinnedPOIds, setPinnedPOIds] = useState<string[]>([]);
  const [pinFilter, setPinFilter] = useState('all'); // 'all', 'pinned'
  const [pinnedPOsDisplayed, setPinnedPOsDisplayed] = useState<PurchaseOrder[]>([]);

  // Load per-user pinned ids when user changes
  useEffect(() => {
    let mounted = true;
    const loadPinned = async () => {
      if (!user || !user.id) {
        setPinnedPOIds([]);
        return;
      }

      try {
        // Try loading from backend first
        const serverPinned = await userService.getPinnedRows(user.id);
        if (mounted) {
          setPinnedPOIds(serverPinned || []);
          pinnedInitializedRef.current = true;
        }
      } catch (err) {
        // Fallback to localStorage
        try {
          const key = `pinnedPOs:${user.id}`;
          const stored = localStorage.getItem(key);
          if (mounted) setPinnedPOIds(stored ? JSON.parse(stored) : []);
          if (mounted) pinnedInitializedRef.current = true;
        } catch (e) {
          console.error('Error loading pinned POs from localStorage', e);
          if (mounted) setPinnedPOIds([]);
          if (mounted) pinnedInitializedRef.current = true;
        }
      }
    };

    loadPinned();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Track whether we've loaded initial pinned IDs from server/local before persisting
  const pinnedInitializedRef = useRef(false);

  // Update per-user localStorage when pinnedPOIds changes
  useEffect(() => {
    if (!user || !user.id) return;

    const key = `pinnedPOs:${user.id}`;
    try {
      localStorage.setItem(key, JSON.stringify(pinnedPOIds));
    } catch (err) {
      console.error('Error saving pinned POs to localStorage', err);
    }

    // Don't persist to backend until we've finished the initial load to avoid overwriting
    if (!pinnedInitializedRef.current) {
      return;
    }

    // Persist to backend
    (async () => {
      try {
        await userService.updatePinnedRows(user.id, pinnedPOIds);
      } catch (err) {
        console.error('Error updating pinned rows on server', err);
      }
    })();
  }, [pinnedPOIds, user]);

  const togglePin = useCallback((poId: string) => {
    setPinnedPOIds((prev) =>
      prev.includes(poId) ? prev.filter((id) => id !== poId) : [...prev, poId]
    );
  }, []);

  // When pinFilter is 'pinned', fetch full PO details for all pinned IDs so we can show them across pages
  useEffect(() => {
    let mounted = true;
    const fetchPinned = async () => {
      if (pinFilter !== 'pinned') {
        setPinnedPOsDisplayed([]);
        return;
      }

      if (!pinnedPOIds || pinnedPOIds.length === 0) {
        setPinnedPOsDisplayed([]);
        return;
      }

      try {
        const promises = pinnedPOIds.map((id) => purchaseOrderService.getPOById(id));
        const results = await Promise.allSettled(promises);
        const successful = results
          .filter((result): result is PromiseFulfilledResult<PurchaseOrder> => result.status === 'fulfilled')
          .map((result) => result.value);

        // Only display pinned POs that are assigned to the current user
        const visible = successful.filter((po) => {
          if (!user) return false;
          if (user.role === 'SUPPLIER') return po.supplier_id === user.id;
          if (user.role === 'PROCUREMENT_SPECIALIST') return po.procurement_specialist_id === user.id;
          return true;
        });

        if (mounted) {
          setPinnedPOsDisplayed(visible);
          if (successful.length !== pinnedPOIds.length) {
            setPinnedPOIds(successful.map((po) => po.id));
          }
        }
      } catch (err) {
        console.error('Error fetching pinned POs:', err);
        if (mounted) setPinnedPOsDisplayed([]);
      }
    };

    fetchPinned();

    return () => {
      mounted = false;
    };
  }, [pinFilter, pinnedPOIds, user]);

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
        ...advanceFilters,
      };

      console.log('adv: ', advanceFilters);

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
  }, [page, pageSize, statusFilter, sortOrder, searchQuery, user, advanceFilters]);

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
      // When in 'pinned' mode, the list of POs to show is fetched separately (pinnedPOsDisplayed).
      // Keep this branch for compatibility but return purchaseOrders filtered if pinnedPOsDisplayed not available.
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

  const displayRows = pinFilter === 'pinned' ? pinnedPOsDisplayed : filteredAndSortedPOs;
  const displayRowCount = pinFilter === 'pinned' ? pinnedPOsDisplayed.length : rowCount;
  const displayPage = pinFilter === 'pinned' ? 1 : page + 1;
  const displayPageCount = Math.max(1, Math.ceil(displayRowCount / pageSize));

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

  // DataGrid columns
  const columns: GridColDef[] = React.useMemo(
    () => {
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
        IN_PROGRESS: 'warning',
      };

      return [
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
        renderCell: (params) => params.value,
      },
    ];
  }, [theme, pinnedPOIds, togglePin]);

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
      {/* <POFilters
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
      {appliedFilters.length > 0 && (
        <Box height={'2vh'} sx={{ mb: 2 }}>
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
        </Box>
      )} */}
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
              <Box
                sx={{
                  height: appliedFilters.length > 0 ? '68vh' : '72vh',
                  width: '100%',
                  overflowY: 'scroll',
                }}
              >
                <Grid container spacing={3}>
                  {displayRows.map((po) => (
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
                  count={displayPageCount}
                  page={displayPage}
                  onChange={(_, value) => setPage(value - 1)}
                  color="primary"
                  size="small"
                />
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ height: appliedFilters.length > 0 ? '68vh' : '72vh', width: '100%' }}>
                <DataGrid
                  rows={displayRows}
                  columns={columns}
                  rowCount={displayRowCount}
                  rowHeight={35}
                  getRowClassName={(params) => {
                    // console.log('params: ', params);
                    return params.indexRelativeToCurrentPage % 2 === 0 ? 'light_row' : 'dark_row';
                  }}
                  // pagination
                  paginationMode="server"
                  filterMode="server"
                  // paginationModel={{ page, pageSize }}
                  // onPaginationModelChange={handlePaginationModelChange}
                  // hideFooterPagination
                  hideFooter
                  onFilterModelChange={(e) => {
                    console.log('filter model: ', e);
                    // const key = e.
                    // setAdvanceTempfilters((prev) => {
                    //   const updated = {
                    //     ...prev,
                    //     [key]: value,
                    //   };

                    //   return updated;
                    // });
                  }}
                  disableRowSelectionOnClick
                  hideFooterSelectedRowCount
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
                  // filterModel={{
                  //   items: [
                  //     { field: 'po_number', operator: 'contains', value: '' },
                  //     { field: 'supplier_name', operator: 'contains', value: '' },
                  //   ],
                  // }}
                  // slots={{
                  //   toolbar: () => <GridToolbar sx={{ fontSize: '0.8rem', height: '4.5rem' }} />,
                  // }}
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
                          pinnedCount={pinnedPOIds.length}
                        />
                        {appliedFilters.length > 0 && (
                          <Box height={'2vh'} sx={{ mb: 2 }}>
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
                          </Box>
                        )}
                      </>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ height: '2vh', display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Pagination
                  count={displayPageCount}
                  page={displayPage}
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
