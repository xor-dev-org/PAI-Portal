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
  
  const isPOToReviewTab = selectedTab === 2;
  const isMRPExceptionTab = selectedTab === 3;
  const isLineItemTab = isPOToReviewTab || isMRPExceptionTab;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procurementSpecialists, setProcurementSpecialists] = useState<User[]>([]);

  const { page, pageSize, setPage, setPageSize } = usePagination(0, 60);
  const [rowCount, setRowCount] = useState(0);

  // Filter states
  const [searchInput, setSearchInput] = useState('');
  const [availableSites, setAvailableSites] = useState<string[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [sitesLoaded, setSitesLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  // const [sortBy, setSortBy] = useState('');
  // const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortModel, setSortModel] = useState<{
    sort_by: string | undefined;
    sort_order: 'asc' | 'desc';
  }>({ sort_by: '', sort_order: 'desc' });

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advanceFilters, setAdvancefilters] = useState<AdvanceFilters>({});
  const [advanceTempFilters, setAdvanceTempfilters] = useState<AdvanceFilters>({});
  // const advanceFiltersRef = useRef<AdvanceFilters>({});
  const [pinnedPOIds, setPinnedPOIds] = useState<string[]>([]);
  const [pinnedPOs, setPinnedPOs] = useState<PurchaseOrder[]>([]);
  const [pinnedPOsRowCount, setPinnedPOsRowCount] = useState(0);
  const [pinFilter, setPinFilter] = useState('all'); // 'all', 'pinned'
  const [poToReviewPinFilter, setPOToReviewPinFilter] = useState('all');
  const [mrpPinFilter, setMrpPinFilter] = useState('all');
  //line item level pinning for potoreview & MRP tab
  const [pinnedPOToReviewLineItemIds, setPinnedPOToReviewLineItemIds] = useState<string[]>([]);
  const [pinnedMRPLineItemIds, setPinnedMRPLineItemIds] = useState<string[]>([]);

  const currentPinFilter = React.useMemo(() => {
    switch (selectedTab) {
      case 2: // PO TO REVIEW
        return poToReviewPinFilter;

      case 3: // MRP EXCEPTION
        return mrpPinFilter;

      case 0: // OPEN PO / normal PO list
      default:
        return pinFilter;
    }
  }, [selectedTab, pinFilter, poToReviewPinFilter, mrpPinFilter]);

  const handleCurrentPinFilterChange = useCallback(
    (value: string) => {
      switch (selectedTab) {
        case 2: // PO TO REVIEW
          setPOToReviewPinFilter(value);
          break;

        case 3: // MRP EXCEPTION
          setMrpPinFilter(value);
          break;

        case 0: // OPEN PO / normal PO list
        default:
          setPinFilter(value);
          break;
      }

      setPage(0);
    },
    [selectedTab, setPage]
  );

  const togglePin = (poId: string) => {
    setPinnedPOIds((prev) => {
      const updated = prev.includes(poId) ? prev.filter((id) => id !== poId) : [...prev, poId];

      if (user?.id) {
        userService.updatePinnedRows(user.id, updated, 'po');
      }

      return updated;
    });
  };

  const togglePOToReviewLinePin = (lineItemRowId: string) => {
    setPinnedPOToReviewLineItemIds((prev) => {
      const updated = prev.includes(lineItemRowId)
        ? prev.filter((id) => id !== lineItemRowId)
        : [...prev, lineItemRowId];

      if (user?.id) {
        userService.updatePinnedRows(user.id, updated, 'po_to_review');
      }

      return updated;
    });
  };

  const toggleMRPLinePin = (lineItemRowId: string) => {
    setPinnedMRPLineItemIds((prev) => {
      const updated = prev.includes(lineItemRowId)
        ? prev.filter((id) => id !== lineItemRowId)
        : [...prev, lineItemRowId];

      if (user?.id) {
        userService.updatePinnedRows(user.id, updated, 'mrp_exception');
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

  useEffect(() => {
    const loadAvailableSites = async () => {
      try {
        const sites = await purchaseOrderService.getAvailableSites();

        setAvailableSites(sites);
        setSelectedSites(sites);
      } catch (error) {
        console.error('Failed to load available sites', error);
        setAvailableSites([]);
        setSelectedSites([]);
      } finally {
        setSitesLoaded(true);
      }
    };

    loadAvailableSites();
  }, []);

  const fetchPurchaseOrders = useCallback(async () => {
    if (!sitesLoaded) {
      return;
    }
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
        search: searchInput,
        sites: selectedSites,
        ...advanceFilters,
      };

      if (user?.id) {
        const pinnedPOResult = await userService.getPinnedRows(user.id, 'po');
        const pinnedPOToReviewResult = await userService.getPinnedRows(user.id, 'po_to_review');
        const pinnedMRPResult = await userService.getPinnedRows(user.id, 'mrp_exception');

        setPinnedPOIds(pinnedPOResult);
        setPinnedPOToReviewLineItemIds(pinnedPOToReviewResult);
        setPinnedMRPLineItemIds(pinnedMRPResult);

        const pinnedPOList = await purchaseOrderService.getPinnedPOList(user.id);

        setPinnedPOs(pinnedPOList.data);
        setPinnedPOsRowCount(pinnedPOList.total);
      }
      console.log('Final filters:', filters);

      logger.info('Fetching purchase orders', {
        page: filters.page,
        pageSize: filters.page_size,
        status: filters.status,
        search: searchInput,
        advanceFilters: Object.keys(advanceFilters).length,
      });

      if (user?.role === 'PROCUREMENT_SPECIALIST') {
        filters.procurement_specialist_id = user.id;
      }
      //console.log("Filters Sent:", filters);
      console.log('Selected Sites Sent:', selectedSites);
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
    searchInput,
    user,
    advanceFilters,
    pinFilter,
    selectedSites,
    sitesLoaded,
  ]);

  useEffect(() => {
     fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  // const handlePOClick = (po: PurchaseOrder) => {
  //   navigate(`/purchase-orders/${po.id}`);
  // };

  const handleGridRowClick = (row: any) => {
    const poId = row.po_id || row.id;

    navigate(`/purchase-orders/${poId}`);
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
    setPage(0);
  },
  [setPage]
);

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
    // console.log('Applying filters:', advanceTempFilters);
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
  // console.log('role:', user?.role);

  //format currency
  const formatCurrency = (value: unknown) => {
    if (value === null || value === undefined || value === '') return '--';

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) return '--';

    return `$${numericValue.toLocaleString()}`;
  };

  const hasCellValue = (value: unknown) =>
  value !== null && value !== undefined && value !== '';

  // DataGrid columns
  const columns: GridColDef[] = React.useMemo(
    () => [
      {
        field: 'pin',
        headerName: 'Pin',
        width: 40,
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
              width: 100,
            },
          ]
        : []),
      {
        field: 'status',
        headerName: 'PO Status',
        width: 130,
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
        width: 180,
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
    [theme, pinnedPOIds, togglePin, statusColors, user?.role]
  );

  // console.log(columns.map((c) => c.field));

  const poToReviewColumns: GridColDef[] = React.useMemo(
    () => [
      {
        field: 'pin',
        headerName: 'Pin',
        width: 30,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const lineItemRowId = params.row.id;
          const isPinned = pinnedPOToReviewLineItemIds.includes(lineItemRowId);

          return (
            <Tooltip title={isPinned ? 'Unpin' : 'Pin'}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePOToReviewLinePin(lineItemRowId);
                }}
                sx={{
                  color: isPinned ? 'primary.main' : 'action.disabled',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {isPinned ? (
                  <PushPinIcon sx={{ fontSize: '1.25rem' }} />
                ) : (
                  <PushPinOutlinedIcon sx={{ fontSize: '1.25rem' }} />
                )}
              </IconButton>
            </Tooltip>
          );
        },
      },
      {
        field: 'po_number',
        headerName: 'PO Number',
        width: 100,
        renderCell: (params) => (
          <Typography
            fontWeight="bold"
            height="100%"
            alignContent="center"
            fontSize="0.8rem"
            color={theme.palette.primary.light}
          >
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'line_number',
        headerName: 'PO Line',
        width: 50,
      },
      {
        field: 'material_code',
        headerName: 'Material No',
        width: 110,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => (
          <Chip
            variant="outlined"
            label={params.value ? params.value.replace(/_/g, ' ') : '--'}
            color={statusColors[params.value as PurchaseOrderStatus] || 'default'}
            size="small"
          />
        ),
      },
      {
        field: 'description',
        headerName: 'Short Description',
        width: 150,
        renderCell: (params) => params.value || '--',
      },
      {
        field: 'quantity',
        headerName: 'Qty',
        width: 60,
        renderCell: (params) => params.value ?? '--',
      },
      {
        field: 'updated_quantity',
        headerName: 'Supplier confirmed Qty',
        width: 60,
        renderCell: (params) => params.value ?? '--',
      },
      {
        field: 'unit_price',
        headerName: 'Unit Price',
        width: 70,
        renderCell: (params) => formatCurrency(params.value),
      },
      {
        field: 'updated_unit_price',
        headerName: 'Updated Unit Price',
        width: 70,
        renderCell: (params) => formatCurrency(params.value),
        cellClassName: (params) => (hasCellValue(params.value) ? 'changed-cell' : ''),
      },
      {
        field: 'net_value',
        headerName: 'Total Value',
        width: 80,
        renderCell: (params) => formatCurrency(params.value),
      },
      {
        field: 'updated_net_value',
        headerName: 'Updated Total Value',
        width: 80,
        renderCell: (params) => formatCurrency(params.value),
        cellClassName: (params) => (hasCellValue(params.value) ? 'changed-cell' : ''),
      },
      {
        field: 'required_in_house_date',
        headerName: 'Need By Date',
        width: 100,
        renderCell: (params) => params.value || '--',
      },
      {
        field: 'updated_delivery_date',
        headerName: 'Revised Date',
        width: 100,
        renderCell: (params) => params.value || '--',
        cellClassName: (params) => (hasCellValue(params.value) ? 'changed-cell' : ''),
      },
      {
        field: 'supplier_confirmation_date',
        headerName: 'Supplier Confirmation Date',
        width: 100,
        renderCell: (params) => params.value || '--',
        cellClassName: (params) => (hasCellValue(params.value) ? 'changed-cell' : ''),
      },
      {
        field: 'concession',
        headerName: 'Concession',
        width: 100,
        renderCell: (params) => params.value || '--',
        cellClassName: (params) => (hasCellValue(params.value) ? 'changed-cell' : ''),
      },
    ],
    [pinnedPOToReviewLineItemIds, togglePOToReviewLinePin, theme, statusColors]
  );

  //MRP exception coulumns
  const mrpExceptionColumns: GridColDef[] = React.useMemo(
    () => [
      {
        field: 'pin',
        headerName: 'Pin',
        width: 40,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const lineItemRowId = params.row.id;
          const isPinned = pinnedMRPLineItemIds.includes(lineItemRowId);

          return (
            <Tooltip title={isPinned ? 'Unpin' : 'Pin'}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMRPLinePin(lineItemRowId);
                }}
                sx={{
                  color: isPinned ? 'primary.main' : 'action.disabled',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {isPinned ? (
                  <PushPinIcon sx={{ fontSize: '1.25rem' }} />
                ) : (
                  <PushPinOutlinedIcon sx={{ fontSize: '1.25rem' }} />
                )}
              </IconButton>
            </Tooltip>
          );
        },
      },
      {
        field: 'po_number',
        headerName: 'PO Number',
        width: 100,
        renderCell: (params) => (
          <Typography
            fontWeight="bold"
            height="100%"
            alignContent="center"
            fontSize="0.8rem"
            color={theme.palette.primary.light}
          >
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'line_number',
        headerName: 'Line Item',
        width: 50,
      },
      {
        field: 'description',
        headerName: 'Short Description',
        width: 150,
        renderCell: (params) => params.value || '--',
      },
      {
        field: 'supplier_name',
        headerName: 'Supplier',
        width: 90,
        renderCell: (params) => params.value || '--',
      },
      {
        field: 'status',
        headerName: 'PO Status',
        width: 120,
        renderCell: (params) => (
          <Chip
            variant="outlined"
            label={params.value ? params.value.replace(/_/g, ' ') : '--'}
            color={statusColors[params.value as PurchaseOrderStatus] || 'default'}
            size="small"
          />
        ),
      },
      {
        field: 'source_system',
        headerName: 'ERP',
        width: 70,
        renderCell: (params) => params.value || '--',
      },
      {
        field: 'net_value',
        headerName: 'Line Item Value',
        width: 80,
        renderCell: (params) => formatCurrency(params.value),
      },
      {
        field: 'recommendation',
        headerName: 'Recommendations',
        width: 160,
        renderCell: (params) => (
          <Typography
            fontWeight="bold"
            height="100%"
            alignContent="center"
            fontSize="0.8rem"
            color={theme.palette.primary.light}
          >
            {params.value || '--'}
          </Typography>
        ),
      },
      {
        field: 'quantity',
        headerName: 'Qty',
        width: 50,
        renderCell: (params) => params.value ?? '--',
      },
      {
        field: 'updated_quantity',
        headerName: 'Updated Qty',
        width: 60,
        renderCell: (params) =>
          params.value !== null && params.value !== undefined ? (
            <Typography
              fontWeight="bold"
              height="100%"
              alignContent="center"
              fontSize="0.8rem"
              color={theme.palette.primary.light}
            >
              {params.value}
            </Typography>
          ) : (
            '--'
          ),
      },
      {
        field: 'required_in_house_date',
        headerName: 'Need By Date',
        width: 100,
        renderCell: (params) => params.value || '--',
      },
      {
        field: 'updated_delivery_date',
        headerName: 'Revised Date',
        width: 100,
        renderCell: (params) =>
          params.value ? (
            <Typography
              fontWeight="bold"
              height="100%"
              alignContent="center"
              fontSize="0.8rem"
              color={theme.palette.primary.light}
            >
              {params.value}
            </Typography>
          ) : (
            '--'
          ),
      },
      {
        field: 'revision_changes',
        headerName: 'Rev.',
        width: 50,
        renderCell: (params) => params.value ?? '--',
      },
      {
        field: 'site',
        headerName: 'Site',
        width: 60,
        renderCell: (params) => params.value || '--',
      },
      // {
      //   field: 'action',
      //   headerName: 'Action',
      //   width: 90,
      //   sortable: false,
      //   filterable: false,
      //   renderCell: () => (
      //     <Typography height="100%" alignContent="center" fontSize="0.8rem" color="text.secondary">
      //       ⋮
      //     </Typography>
      //   ),
      // },
    ],
    [theme, statusColors,pinnedMRPLineItemIds,toggleMRPLinePin]
  );

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

  const currentColumns = React.useMemo(() => {
    switch (selectedTab) {
      case 2: // PO TO REVIEW
        return poToReviewColumns;

      case 3: // MRP EXCEPTION
        return mrpExceptionColumns;

      default:
        return gridColumns;
    }
  }, [selectedTab, poToReviewColumns, mrpExceptionColumns, gridColumns]);

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

  //Show POtoreview tabs data
  const flattenedLineItems = React.useMemo(() => {
    return purchaseOrders.flatMap((po) =>
      po.line_items.map((item) => ({
        id: `${po.id}-${item.id}`,

        // PO fields
        po_id: po.id,
        po_number: po.po_number,
        supplier_name: po.supplier_name,
        supplier_id: po.supplier_id,
        supplier_email: po.supplier_email,
        site: po.site,
        status: po.status,
        source_system: po.source_system,
        revision_changes: po.revision_changes,
        mrp_exceptions: po.mrp_exceptions,
        delivery_date: po.delivery_date,
        currency: po.currency,

        // Line Item fields
        line_id: item.id,
        line_number: item.line_number,
        material_code: item.material_code,
        description: item.description,

        quantity: item.quantity,
        unit_price: item.unit_price,
        net_value: item.net_value,

        updated_quantity: item.updated_quantity,
        updated_unit_price: item.updated_unit_price,
        updated_net_value: item.updated_net_value,

        required_in_house_date: item.required_in_house_date,
        updated_delivery_date: item.updated_delivery_date,

        supplier_confirmation_date: item.supplier_confirmation_date,
        recommendation: item.recommendation,
        exception_type: item.exception_type,
        mrp_action_required: item.mrp_action_required,
        concession: item.concession,

        // For now we are using PO status in PO review tab
        line_status: po.status,
      }))
    );
  }, [purchaseOrders]);

  //MRP exception rows
  const mrpExceptionRows = React.useMemo(() => {
    return flattenedLineItems.filter((row) => {
      const hasRecommendation =
        row.recommendation !== null &&
        row.recommendation !== undefined &&
        row.recommendation !== '';

      const hasMrpAction = row.mrp_action_required === true;

      return hasRecommendation || hasMrpAction;
    });
  }, [flattenedLineItems]);

  // console.log('MRP Exception Rows:', mrpExceptionRows.length);
  // console.log('MRP Exception Sample:', mrpExceptionRows[0]);

  const currentRows = React.useMemo(() => {
    switch (selectedTab) {
      case 2: {
        // PO TO REVIEW
        const inProgressRows = flattenedLineItems.filter((row) => row.status === 'IN_PROGRESS');

        return currentPinFilter === 'pinned'
          ? inProgressRows.filter((row) => pinnedPOToReviewLineItemIds.includes(row.id))
          : inProgressRows;
      }

      case 3: {
        // MRP EXCEPTION
        return currentPinFilter === 'pinned'
          ? mrpExceptionRows.filter((row) => pinnedMRPLineItemIds.includes(row.id))
          : mrpExceptionRows;
      }

      default:
        return displayedRows;
    }
  }, [
    selectedTab,
    flattenedLineItems,
    mrpExceptionRows,
    displayedRows,
    currentPinFilter,
    pinnedPOToReviewLineItemIds,
    pinnedMRPLineItemIds,
  ]);

  const currentPinnedCount = React.useMemo(() => {
    switch (selectedTab) {
      case 2: // PO TO REVIEW
        return pinnedPOToReviewLineItemIds.length;

      case 3: // MRP EXCEPTION
        return pinnedMRPLineItemIds.length;

      case 0: // OPEN PO / normal PO list
      default:
        return pinnedPOIds.length;
    }
  }, [
    selectedTab,
    pinnedPOIds.length,
    pinnedPOToReviewLineItemIds.length,
    pinnedMRPLineItemIds.length,
  ]);

  const handleSelectedSitesChange = useCallback(
    (sites: string[]) => {
      setSelectedSites(sites);
      setPage(0);
    },
    [setPage]
  );

  const ToolbarComponent = React.useCallback(
    () => (
      <>
        <POFilters
          searchInput={searchInput}
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
          pinFilter={currentPinFilter}
          onPinFilterChange={handleCurrentPinFilterChange}
          pinnedCount={currentPinnedCount}
          availableSites={availableSites}
          selectedSites={selectedSites}
          onSelectedSitesChange={handleSelectedSitesChange}
          userRole={user?.role}
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
    [
      searchInput,
      handleSearchChange,
      statusFilter,
      sortModel.sort_order,
      viewMode,
      handleCurrentPinFilterChange,
      availableSites,
      selectedSites,
      handleSelectedSitesChange,
      currentPinFilter,
      currentPinnedCount,
      user?.role,
      selectedTab,
      appliedFilters,
      advanceFilters,
      setPage,
    ]
  );
  
console.log(columns.map((c) => c.field));


  //saperate page view for supplier & PS
  // const supplierColumns = React.useMemo(
  //   () =>
  //     columns.filter((col) =>
  //       [
  //         'pin',
  //         'po_number',
  //         'status',
  //         'supplier_name',
  //         'total_value',
  //         'line_items',
  //         'revision_changes',
  //         'buyer_name',
  //         'buyer_email',
  //         'buyer_phone',
  //         'site',
  //       ].includes(col.field)
  //     ),
  //   [columns]
  // );

  // const gridColumns = React.useMemo(
  //   () => (user?.role === 'SUPPLIER' ? supplierColumns : columns),
  //   [user?.role, supplierColumns, columns]
  // );

  // const displayedRows = React.useMemo(() => {
  //   const rows = pinFilter === 'pinned' ? pinnedPOs : purchaseOrders;

  //   switch (selectedTab) {
  //     case 1: // OPEN PO
  //       return rows.filter(
  //         (po) => po.status === 'CREATED' || po.status === 'IN_PROGRESS' || po.status === 'APPROVED'
  //       );

  //     case 2: // PASS DELIVERY DATE
  //       return rows;

  //     case 0: // ALL PO
  //     default:
  //       return rows;
  //   }
  // }, [selectedTab, pinFilter, purchaseOrders, pinnedPOs]);

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
      <Box sx={{ height: appliedFilters.length > 0 ? '80vh' : '80vh', width: '100%' }}>
        <DataGrid
          rows={currentRows}
          columns={currentColumns}
          rowCount={
            isLineItemTab
              ? currentRows.length
              : selectedTab === 1
                ? displayedRows.length
                : currentPinFilter === 'pinned'
                  ? pinnedPOsRowCount
                  : rowCount
          }
          rowHeight={35}
          pagination
          paginationMode="server"
          pageSizeOptions={[10, 25, 50, 60, 100]}
          loading={loading}
          onPaginationModelChange={handlePaginationModelChange}
          paginationModel={{ page, pageSize }}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          sortingMode={isLineItemTab || currentPinFilter === 'pinned' ? 'client' : 'server'}
          onSortModelChange={(model) => {
            console.log('sort model: ', model);

            if (isLineItemTab) {
              return;
            }

            if (currentPinFilter === 'pinned') {
              return;
            }

            setSortModel({
              sort_by: model[0]?.field,
              sort_order: (model[0]?.sort as 'asc' | 'desc') || 'asc',
            });

            setPage(0);
          }}
          onRowClick={(params) => handleGridRowClick(params.row)}
          localeText={{
            noRowsLabel:
              selectedSites.length === 0 ? 'No sites selected' : 'No purchase orders found',
          }}
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

            '& .changed-cell': {
              color: theme.palette.primary.light,
              fontWeight: 700,
            },
          }}
          slots={{
            toolbar: ToolbarComponent,
          }}
        />
      </Box>
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
