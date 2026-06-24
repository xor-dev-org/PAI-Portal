import React, { useState, useRef } from 'react';
import { Box, TextField, Tooltip, Paper, InputAdornment, Button, IconButton, useTheme,Divider, Tabs, Tab} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { PushPin, PushPinOutlined } from '@mui/icons-material';
import Badge from '@mui/material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
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
  availableSites?: string[];
  selectedTab: number;
  onTabChange: (tab: number) => void;
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
  availableSites: _availableSites,
  selectedTab,
  onTabChange,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // It stays expanded if focused OR if there is text typed inside it
  const isExpanded = isFocused || searchQuery.length > 0;

  return (
    <Paper
      sx={{
        p: 1,
        mb: 0,
        width: '100%',
        border: '1.5px solid #CFCFCF',
        borderRadius: '8px 8px 0 0',
        boxShadow: 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* LEFT SIDE - TABS */}
        <Tabs
          value={selectedTab}
          onChange={(_, value) => onTabChange(value)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 40,

            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 40,
              px: 2,
            },
          }}
        >
          <Tab label="ALL PO" />
          <Tab label="OPEN PO" />
          <Tab label="PO TO REVIEW" />
          <Tab label="MRP EXCEPTIONS" />
        </Tabs>

        {/* RIGHT SIDE - ALL FILTERS */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,

            '& .MuiButton-root': {
              minWidth: 40,
              width: 40,
              padding: '6px',
              fontSize: 0,
            },

            '& .MuiButton-startIcon': {
              margin: 0,
              fontSize: '1rem',
            },
          }}
        >
          {/* SEARCH */}
          <Tooltip title="Search" disableHoverListener={isExpanded}>
            <Box
              onClick={() => {
                if (!isExpanded) {
                  inputRef.current?.focus();
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: !isExpanded ? 'pointer' : 'text',
              }}
            >
              <TextField
                inputRef={inputRef}
                size="small"
                variant="outlined"
                placeholder={isExpanded ? 'Search PO Number, Supplier...' : ''}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ ml: 0.5, mr: 1 }}>
                      <SearchIcon color={isExpanded ? 'primary' : 'action'} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSearchChange('');
                        }}
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
                  width: isExpanded ? { xs: '100%', sm: 240, md: 280 } : 40,

                  '& .MuiOutlinedInput-root': {
                    height: 40,
                    borderRadius: '4px',
                    backgroundColor: isExpanded ? '#fff' : 'transparent',

                    '& fieldset': {
                      borderWidth: isExpanded ? '1px' : '0px',
                      borderColor: 'action.disabled',
                    },

                    '&:hover fieldset': {
                      borderColor: isExpanded ? 'primary.main' : 'transparent',
                    },

                    '&.Mui-focused fieldset': {
                      borderWidth: '1px',
                      borderColor: 'primary.main',
                    },
                  },

                  '& input': {
                    pointerEvents: isExpanded ? 'auto' : 'none',
                    width: isExpanded ? '100%' : '0px',
                    padding: isExpanded ? undefined : 0,
                  },
                }}
              />
            </Box>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ height: 28, alignSelf: 'center' }} />

          {/* SITE */}
          <Tooltip title="Select Sites">
            <Button>
              <BusinessIcon />
            </Button>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ height: 28, alignSelf: 'center' }} />

          {/* DENSITY */}
          <GridToolbarDensitySelector
            slotProps={{
              button: {
                sx: { minWidth: 40, px: 1, py: 0.5 },
              },
            }}
          />

          <Divider orientation="vertical" flexItem sx={{ height: 28, alignSelf: 'center' }} />

          {/* COLUMNS */}
          <GridToolbarColumnsButton
            slotProps={{
              button: {
                sx: { minWidth: 40, px: 1, py: 0.5 },
              },
            }}
          />

          <Divider orientation="vertical" flexItem sx={{ height: 28, alignSelf: 'center' }} />

          {/* EXPORT */}
          <GridToolbarExport
            slotProps={{
              button: {
                sx: { minWidth: 40, px: 1, py: 0.5 },
              },
            }}
          />

          <Divider orientation="vertical" flexItem sx={{ height: 28, alignSelf: 'center' }} />

          {/* FILTER */}
          <Tooltip title="Advanced Filters">
            <Button onClick={onFiltersClick} color="primary">
              <FilterListIcon />
            </Button>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ height: 28, alignSelf: 'center' }} />

          {/* PIN */}
          <Tooltip title="Pinned Rows">
            <Button
              onClick={() => {
                onPinFilterChange(pinFilter === 'pinned' ? 'all' : 'pinned');
              }}
              color="primary"
            >
              <Badge badgeContent={pinnedCount || null} color="error">
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