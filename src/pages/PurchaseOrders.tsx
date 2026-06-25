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
import ViewListIcon from '@mui/icons-material/ViewList';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { purchaseOrderService } from '@/api/services/purchaseOrderService';
import {
  PurchaseOrder,
  POFilters as POFiltersType,
  AdvanceFilters,
  PurchaseOrderStatus,
  User,
} from '@/models';
import { useAuth } from '@/hooks/useAuth';
import POFilters from '@/components/common/POFilters';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { format } from 'date-fns';
import { logger } from '@/services/logger';
import ClearIcon from '@mui/icons-material/Clear';
import './grid.css';
import { userService } from '@/api/services/userService';

const PurchaseOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procurementSpecialists, setProcurementSpecialists] = useState<User[]>([]);

  // Filter states
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [statusFilter, setStatusFilter] = useState('');
  // const [sortBy, setSortBy] = useState('');
  // const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortModel, setSortModel] = useState<{
    sort_by: string | undefined;
    sort_order: 'asc' | 'desc';
  }>({ sort_by: '', sort_order: 'desc' });

  const { page, pageSize, setPage, setPageSize } = usePagination(0, 60);
  const [rowCount, setRowCount] = useState(0);
  const debouncedSearchQuery = useDebounce(searchQuery, 600);

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advanceFilters, setAdvancefilters] = useState<AdvanceFilters>({});
  const [advanceTempFilters, setAdvanceTempfilters] = useState<AdvanceFilters>({});
  // const advanceFiltersRef = useRef<AdvanceFilters>({});
  const [pinnedPOIds, setPinnedPOIds] = useState<string[]>([]);
  const [pinnedPOs, setPinnedPOs] = useState<PurchaseOrder[]>([]);
  const [pinnedPOsRowCount, setPinnedPOsRowCount] = useState(0);
  const [pinFilter, setPinFilter] = useState('all'); // 'all', 'pinned'

  const togglePin = (poId: string) => {
    console.log('--pids: ', pinnedPOIds, '--poId: ', poId);
    setPinnedPOIds((prev) => {
      const updated = prev.includes(poId) ? prev.filter((id) => id !== poId) : [...prev, poId];

      if (user?.id) {
        userService.updatePinnedRows(user.id, updated);
      }

      return updated;
    });
  };

  useEffect(() => {
    const loadProcurementSpecialists = async () => {
      try {
        const users = await userService.getUsersByRole('PROCUREMENT_SPECIALIST');
        setProcurementSpecialists(users);
      } catch (error) {
        console.error('Failed to load procurement specialists', error);
      }
    };

    loadProcurementSpecialists();
  }, []);

  const fetchPurchaseOrders = useCallback(async () => {
    const startTime = performance.now();
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching purchase orders with sort model:', sortModel);
      console.log('-----------pinnedOrNot:', pinFilter);
      // console.log('pinnedList:', pinnedPOIds);

      const filters: POFiltersType = {
        page: page + 1,
        page_size: pageSize,
        status: statusFilter,
        sort_by: sortModel.sort_by,
        sort_order: sortModel.sort_order,
        search: searchQuery,
        ...advanceFilters,
      };

      const pinnedPOResult = await userService.getPinnedRows(user?.id || '');

      // console.log('------------------Fetched pinned PO IDs from server:', pinnedPOResult);

      setPinnedPOIds(pinnedPOResult);

      const pinnedPOList = await purchaseOrderService.getPinnedPOList(user?.id || '');
      // const pinnedPOList = await purchaseOrderService.getPOList({
      //   page: page + 1,
      //   page_size: pageSize,
      //   pinned_po_list: pinnedPOResult,
      //   // pinned_po_list: pinFilter === 'pinned' ? pinnedPOIds : [],
      // });

      console.log('------------------Fetched pinned PO List from server :', pinnedPOList.data);

      setPinnedPOs(pinnedPOList.data);
      console.log('Current User:', user);
      console.log('Pinned POs Returned:', pinnedPOList.data);
      setPinnedPOsRowCount(pinnedPOList.total);
      console.log('Final filters:', filters);

      logger.info('Fetching purchase orders', {
        page: filters.page,
        pageSize: filters.page_size,
        status: filters.status,
        search: debouncedSearchQuery,
        advanceFilters: Object.keys(advanceFilters).length,
      });

      if (user?.role === 'PROCUREMENT_SPECIALIST') {
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
  }, [
    page,
    pageSize,
    statusFilter,
    sortModel,
    debouncedSearchQuery,
    user,
    advanceFilters,
    pinFilter,
  ]);

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

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      searchDebounceRef.current = setTimeout(() => {
        setSearchQuery(value);
        setPage(0);
      }, 1000);
    },
    [setPage]
  );

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

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

  const procurementSpecialistMap = React.useMemo(() => {
    return procurementSpecialists.reduce(
      (acc, ps) => {
        acc[ps.id] = ps;
        return acc;
      },
      {} as Record<string, User>
    );
  }, [procurementSpecialists]);

  const statusColors = React.useMemo(
    () =>
      ({
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
  console.log("role:", user?.role);
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
        width: 100,

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
      ...(user?.role !== 'SUPPLIER'
        ? [
            {
              field: 'supplier_name',
              headerName: 'Supplier',
              width: 120,
            },
          ]
        : []),
      {
        field: 'status',
        headerName: 'PO Status',
        width: 140,
        renderCell: (params) => (
          <Chip
            variant="outlined"
            label={params.value.replace(/_/g, ' ')}
            color={statusColors[params.value as PurchaseOrderStatus]}
            size="small"
          />
        ),
      },

      ...(user?.role === 'SUPPLIER'
        ? [
            {
              field: 'supplier_name',
              headerName: 'Supplier',
              width: 120,
            },
          ]
        : []),

      {
        field: 'source_system',
        headerName: 'ERP',
        width: 80,
      },
      {
        field: 'total_value',
        headerName: 'Total Value',
        width: 120,
        renderCell: (params) => (
          <Typography height={'100%'} alignContent={'center'} fontSize={'0.8rem'}>
            {params.row.currency} {params.value.toLocaleString()}
          </Typography>
        ),
      },
      {
        field: 'delivery_date',
        headerName: 'Committed Date',
        width: 130,
        renderCell: (params) => format(new Date(params.value), 'MMM, dd yyyy'),
      },
      {
        field: 'line_items',
        headerName: 'Line Items',
        width: 70,
        renderCell: (params) => params.value.length,
      },
      {
        field: 'supplier_id',
        headerName: 'Supplier Number',
        width: 100,
      },
      {
        field: 'supplier_email',
        headerName: 'Supplier Email',
        width: 150,
      },

      // {
      //   field: 'mrp_exceptions',
      //   headerName: 'MRP Exceptions',
      //   width: 150,
      //   renderCell: (params) => (
      //     <Chip
      //       variant="filled"
      //       label={params.value.replace(/_/g, ' ')}
      //       color={params.value === 'NONE' ? 'success' : 'error'}
      //       size="small"
      //     />
      //   ),
      // },
      {
        field: 'revision_changes',
        headerName: 'Revision Changes',
        width: 70,
      },
      ...(user?.role !== 'SUPPLIER'
        ? [
            {
              field: 'site',
              headerName: 'Site',
              width: 70,
            },
          ]
        : []),

      ...(user?.role === 'SUPPLIER'
        ? [
            {
              field: 'buyer_name',
              headerName: 'Buyer Name',
              width: 150,
            },
            {
              field: 'buyer_email',
              headerName: 'Buyer Email',
              width: 160,
            },
            {
              field: 'buyer_phone',
              headerName: 'Buyer Phone No',
              width: 140,
            },
          ]
        : []),
        ...(user?.role === 'SUPPLIER'
        ? [
            {
              field: 'site',
              headerName: 'Site',
              width: 70,
            },
          ]
        : []),
    ],
    [theme, pinnedPOIds, togglePin, statusColors, procurementSpecialistMap, user?.role]
  );
  
console.log(columns.map((c) => c.field));


  //saperate page view for supplier & PS
  const supplierColumns = React.useMemo(
    () =>
      columns.filter((col) =>
        [
          'pin',
          'po_number',
          'status',
          'supplier_name',
          'total_value',
          'line_items',
          'revision_changes',
          'buyer_name',
          'buyer_email',
          'buyer_phone',
          'site',
        ].includes(col.field)
      ),
    [columns]
  );

  const gridColumns = React.useMemo(
    () => (user?.role === 'SUPPLIER' ? supplierColumns : columns),
    [user?.role, supplierColumns, columns]
  );

  const displayedRows = React.useMemo(() => {
    const rows = pinFilter === 'pinned' ? pinnedPOs : purchaseOrders;

    switch (selectedTab) {
      case 1: // OPEN PO
        return rows.filter(
          (po) => po.status === 'CREATED' || po.status === 'IN_PROGRESS' || po.status === 'APPROVED'
        );

      case 2: // PASS DELIVERY DATE
        return rows;

      case 0: // ALL PO
      default:
        return rows;
    }
  }, [selectedTab, pinFilter, purchaseOrders, pinnedPOs]);

  if (loading && purchaseOrders.length === 0) {
    return <LoadingSpinner message="Loading purchase orders..." />;
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 1,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#5E7DA5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ViewListIcon
            sx={{
              color: '#fff',
              fontSize: 18,
            }}
          />
        </Box>

        <Typography
          sx={{
            color: '#0B4F88',
            fontSize: '1.50rem',
            fontWeight: 400,
            lineHeight: 1.2,
          }}
        >
          Purchase Order Listing
        </Typography>
      </Box>

      <Typography
        sx={{
          color: 'black',
          fontSize: '1rem',
          fontWeight: 400,
          mb: 4,
        }}
      >
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
              rows={displayedRows}
              columns={gridColumns}
              rowCount={
                selectedTab === 1
                  ? displayedRows.length
                  : pinFilter === 'pinned'
                    ? pinnedPOsRowCount
                    : rowCount
              }
              rowHeight={35}
              // getRowClassName={(params) => {
              //   // console.log('params: ', params);
              //   return params.indexRelativeToCurrentPage % 2 === 0 ? 'light_row' : 'dark_row';
              // }}
              pagination
              paginationMode="server"
              // rowCountMode="server"
              pageSizeOptions={[10, 25, 50, 60, 100]}
              loading={loading}
              onPaginationModelChange={handlePaginationModelChange}
              paginationModel={{ page, pageSize }}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              // hideFooterSelectedRowCount
              sortingMode={pinFilter === 'pinned' ? 'client' : 'server'}
              onSortModelChange={(model) => {
                console.log('sort model: ', model);
                console.log('sort model state: ', sortModel);
                if (pinFilter === 'all') {
                  setSortModel({
                    sort_by: model[0]?.field,
                    // sort_order: (sortModel.sort_order == 'asc' || sortModel.sort_order == 'desc') ? sortModel.sort_order : 'asc',
                    sort_order: sortModel.sort_order == 'asc' ? 'desc' : 'asc',
                  });
                  // setSortBy(model[0]?.field || '');
                  // setSortOrder(model[0]?.sort as 'asc' | 'desc' || 'asc');
                  setPage(0);
                }
              }}
              onRowClick={(params) => handlePOClick(params.row as PurchaseOrder)}
              sx={{
                '& .MuiDataGrid-row': {
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#F8EFE7',
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
                      searchQuery={searchInput}
                      onSearchChange={handleSearchChange}
                      statusFilter={statusFilter}
                      onStatusChange={(value) => {
                        setStatusFilter(value);
                        setPage(0);
                      }}
                      sortOrder={sortModel.sort_order}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      onFiltersClick={() => setShowAdvancedFilters(true)}
                      pinFilter={pinFilter}
                      onPinFilterChange={(value) => {
                        console.log('Pin filter list:', pinnedPOs);
                        setPinFilter(value);
                        console.log('Pin filter changed to:', value);
                        setPage(0);
                      }}
                      pinnedCount={pinnedPOIds.length}
                      selectedTab={selectedTab}
                      onTabChange={setSelectedTab}
                    />
                    <Box height={appliedFilters.length > 0 ? '4vh' : '0vh'} sx={{ mb: 0, pl: 1 }}>
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
            // borderRadius: 1,
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
