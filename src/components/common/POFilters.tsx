import React, { useState, useRef } from 'react';
import { Box, TextField, Tooltip, Paper, InputAdornment, Button, Typography, IconButton, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
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
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // It stays expanded if focused OR if there is text typed inside it
  const isExpanded = isFocused || searchQuery.length > 0;

  return (
    <Paper sx={{ p: 1, mb: 0, borderRadius: 0, boxShadow: 0, width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box 
          onClick={() => {
            if (!isExpanded) {
              inputRef.current?.focus();
            }
          }}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: !isExpanded ? 'pointer' : 'text'
          }}
        >
          <TextField
            inputRef={inputRef}
            size="small"
            variant="outlined"
            // Only show placeholder text when expanded
            placeholder={isExpanded ? "Search PO Number, Supplier..." : ""}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ margin: 0, cursor: 'pointer' }}>
                  <SearchIcon color={isExpanded ? "primary" : "action"} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent re-focusing the container
                      onSearchChange('');
                    }}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              transition: theme.transitions.create(['width', 'background-color'], {
                duration: theme.transitions.duration.standard,
              }),
              // Collapsed: just wide enough for the icon (~40px). Expanded: Grows to 350px.
              width: isExpanded ? { xs: '100%', sm: 300, md: 350 } : 40,
              
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: isExpanded ? 'action.hover' : 'transparent',
                paddingLeft: isExpanded ? '14px' : '8px', // Center the icon when collapsed
                
                // Completely hide the border line when it is collapsed/idle
                '& fieldset': {
                  borderWidth: isExpanded ? '1px' : '0px',
                  borderColor: 'action.disabled',
                  transition: theme.transitions.create(['border-color', 'border-width']),
                },
                '&:hover fieldset': {
                  borderColor: isExpanded ? 'primary.main' : 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderWidth: '1px',
                  borderColor: 'primary.main',
                },
              },
              // Hide HTML input pointer-events when collapsed so the outer click handler catches it
              '& input': {
                pointerEvents: isExpanded ? 'auto' : 'none',
                width: isExpanded ? 'auto' : '0px',
                padding: isExpanded ? undefined : 0,
              }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            </Button>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

export default POFilters;