import React from 'react';
import { Box, TextField, Tooltip, Paper, InputAdornment, Button, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { PushPin, PushPinOutlined } from '@mui/icons-material';
import Badge from '@mui/material/Badge';
import {
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';

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
  pinnedCount?: number;
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
  pinnedCount = 0,
}) => {
  // const pinOptions = [
  //   { value: 'all', label: 'All POs' },
  //   { value: 'pinned', label: 'Pinned Only' },
  // ];

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
          }}
        >
        
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '& .MuiButton-root': { minWidth: 40, px: 1, py: 0.5 },
              '& .MuiButton-startIcon + span': { display: 'none' },
            }}
          >
            
            <GridToolbarDensitySelector
              slotProps={{ button: { sx: { minWidth: 40, px: 1, py: 0.5 } } }}
            />
            <GridToolbarColumnsButton
              slotProps={{ button: { sx: { minWidth: 40, px: 1, py: 0.5 } } }}
            />
            <GridToolbarExport slotProps={{ button: { sx: { minWidth: 40, px: 1, py: 0.5 } } }} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, fontSize: '0.8125rem' }}>
          <Tooltip title="Advanced Filters">
            <Button onClick={onFiltersClick} color="primary">
              <FilterListIcon />
              <Typography marginLeft={1} variant="body2" fontWeight="medium" fontSize="0.8125rem">
                Filters
              </Typography>
            </Button>
          </Tooltip>
          <Tooltip title="Pinned Rows">
            <Button
              onClick={() => {
                onPinFilterChange(pinFilter === 'pinned' ? 'all' : 'pinned');
              }}
              color="primary"
              sx={{ fontSize: '0.8125rem' }}
            >
              <Badge badgeContent={pinnedCount || null} color="primary">
                {pinFilter === 'pinned' ? <PushPin /> : <PushPinOutlined />}
              </Badge>
              {/* <Typography marginLeft={1} variant="body2" fontWeight="medium" fontSize="0.8125rem">
                {pinFilter === 'pinned' ? 'Pinned Only' : 'All POs'}
              </Typography> */}
            </Button>
          </Tooltip>
          {/* 
          <Tooltip title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}>
            <IconButton onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
            </IconButton>
          </Tooltip> */}
        </Box>
      </Box>
    </Paper>
  );
};

export default POFilters;
