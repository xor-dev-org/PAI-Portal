import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Stack,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import { PurchaseOrderStatus } from '@/models';

interface POFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sortOrder: string;
  onSortChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onFiltersClick: () => void;
}

const POFilters: React.FC<POFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  onFiltersClick,
}) => {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: PurchaseOrderStatus.CREATED, label: 'Created' },
    { value: PurchaseOrderStatus.IN_PROGRESS, label: 'In Progress' },
    { value: PurchaseOrderStatus.APPROVED, label: 'Approved' },
    { value: PurchaseOrderStatus.SENT_TO_SUPPLIER, label: 'Sent to Supplier' },
    { value: PurchaseOrderStatus.IN_TRANSIT, label: 'In Transit' },
    { value: PurchaseOrderStatus.DELIVERED, label: 'Delivered' },
    { value: PurchaseOrderStatus.CANCELLED, label: 'Cancelled' },
  ];

  const sortOptions = [
    { value: 'delivery_date_desc', label: 'Latest First' },
    { value: 'delivery_date_asc', label: 'Oldest First' },
  ];

  return (
    <Paper sx={{ p: 1, mb: 2, borderRadius: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'right', alignItems: 'right', gap: 2, flexWrap: 'wrap' }}
      >
        {/* <TextField
          
          size="small"
          placeholder="Search PO Number, Supplier..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
          sx={{ flex: 1 }}
        /> */}

        <TextField
          select
          size="small"
        //   label="Status"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          sx={{ minWidth: 180 }}
          SelectProps={{
            displayEmpty: true,
          }}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
          InputProps={{
            startAdornment: <SortIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
          sx={{ minWidth: 180 }}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Advanced Filters">
            <IconButton onClick={onFiltersClick} color="primary">
              <FilterListIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}>
            <IconButton onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

export default POFilters;