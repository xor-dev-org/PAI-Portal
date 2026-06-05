import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Paper,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { PushPin, PushPinOutlined } from '@mui/icons-material';

interface POFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortChange?: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onFiltersClick: () => void;
  pinFilter: string;
  onPinFilterChange: (value: string) => void;
}

const POFilters: React.FC<POFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter: _statusFilter,
  onStatusChange: _onStatusChange,
  sortOrder: _sortOrder,
  onSortChange: _onSortChange,
  viewMode: _viewMode,
  onViewModeChange: _onViewModeChange,
  onFiltersClick,
  pinFilter,
  onPinFilterChange,
}) => {
  return (
    <Paper sx={{ p: 1, mb: 0, borderRadius: 0, boxShadow: 0 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          shadow: 0,
        }}
      >
        {/* <TextField
          
          size="small"
          placeholder="Search PO Number, Supplier..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
          sx={{ flex: 1, maxWidth: '25%', fontSize: '0.8125rem' }}
        /> */}

        {/* <TextField
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
        </TextField> */}

        <TextField
          size="small"
          variant="outlined"
          placeholder="Search PO Number, Supplier..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 240, flex: 1 }}
        />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '& .MuiButton-root': { minWidth: 40, px: 1, py: 0.5 },
            '& .MuiButton-startIcon + span': { display: 'none' },
          }}
        >
          <GridToolbarDensitySelector slotProps={{ button: { sx: { minWidth: 40, px: 1, py: 0.5 } } }} />
          <GridToolbarColumnsButton slotProps={{ button: { sx: { minWidth: 40, px: 1, py: 0.5 } } }} />
          <GridToolbarExport slotProps={{ button: { sx: { minWidth: 40, px: 1, py: 0.5 } } }} />
          <GridToolbarFilterButton />
          <Tooltip title="Advanced Filters">
            <IconButton onClick={onFiltersClick} color="primary" size="small">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={pinFilter === 'pinned' ? 'Show All POs' : 'Show Pinned Only'}>
            <IconButton
              onClick={() => onPinFilterChange(pinFilter === 'pinned' ? 'all' : 'pinned')}
              color="primary"
              size="small"
            >
              {pinFilter === 'pinned' ? <PushPin /> : <PushPinOutlined />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* <TextField
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

        <TextField
          select
          size="small"
          value={pinFilter}
          onChange={(e) => onPinFilterChange(e.target.value)}
          sx={{ minWidth: 150 }}
          SelectProps={{
            displayEmpty: true,
          }}
        >
          {pinOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField> */}

      </Box>
    </Paper>
  );
};

export default POFilters;
