import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Tooltip,
  Paper,
  InputAdornment,
  Button,
  Typography,
  IconButton,
  useTheme,
  Divider,
  Tabs,
  Tab,
  Popover,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
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
  searchInput: string;
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
  availableSites: string[];
  selectedSites: string[];
  onSelectedSitesChange: (sites: string[]) => void;
  selectedTab: number;
  onTabChange: (tab: number) => void;
  userRole?: string;
}

const POFilters: React.FC<POFiltersProps> = ({
  searchInput,
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
  availableSites,
  selectedSites,
  onSelectedSitesChange,
  selectedTab,
  onTabChange,
  userRole,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [siteAnchorEl, setSiteAnchorEl] = useState<HTMLElement | null>(null);
  const [siteSearch, setSiteSearch] = useState('');
  const [draftSelectedSites, setDraftSelectedSites] = useState<string[]>(selectedSites);

  const isSitePopoverOpen = Boolean(siteAnchorEl);
  useEffect(() => {
    if (isSitePopoverOpen) {
      setDraftSelectedSites(selectedSites);
    }
  }, [isSitePopoverOpen, selectedSites]);

  const filteredSites = availableSites.filter((site) =>
    site.toLowerCase().includes(siteSearch.toLowerCase())
  );

  const allSitesSelected =
    availableSites.length > 0 && draftSelectedSites.length === availableSites.length;

  const someSitesSelected =
    draftSelectedSites.length > 0 && draftSelectedSites.length < availableSites.length;

  const handleSiteToggle = (site: string) => {
    setDraftSelectedSites((prev) =>
      prev.includes(site) ? prev.filter((selectedSite) => selectedSite !== site) : [...prev, site]
    );
  };

  const handleToggleAllSites = () => {
    if (allSitesSelected) {
      setDraftSelectedSites([]);
    } else {
      setDraftSelectedSites(availableSites);
    }
  };

  const handleResetSites = () => {
    setSiteSearch('');
    setDraftSelectedSites(availableSites);
  };

  const handleCloseSitePopover = () => {
    setSiteAnchorEl(null);
    setDraftSelectedSites(selectedSites);
    setSiteSearch('');
  };

  const handleApplySiteFilter = () => {
    onSelectedSitesChange(draftSelectedSites);
    setSiteAnchorEl(null);
    setSiteSearch('');
  };
  const [localSearchInput, setLocalSearchInput] = useState(searchInput);
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearchInput);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchInput, onSearchChange]);

  // It stays expanded if focused OR if there is text typed inside it
  const isExpanded = isFocused || localSearchInput.length > 0;

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
          <Tab label="OPEN PO" value={0} />

          {/* Actual old OPEN PO tab kept in code but hidden for now */}
          <Tab label="OPEN PO" value={1} sx={{ display: 'none' }} />

          {userRole !== 'SUPPLIER' && <Tab label="PO TO REVIEW" value={2} />}

          {userRole !== 'SUPPLIER' && <Tab label="MRP EXCEPTION" value={3} />}
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
                value={localSearchInput}
                onChange={(e) => setLocalSearchInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ ml: 0.5, mr: 1 }}>
                      <SearchIcon color={isExpanded ? 'primary' : 'action'} />
                    </InputAdornment>
                  ),
                  endAdornment: localSearchInput ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocalSearchInput('');
                          //onSearchChange('');
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
            <Button
              onClick={(event) => {
                setSiteAnchorEl(event.currentTarget);
              }}
              color="primary"
            >
              <BusinessIcon />
            </Button>
          </Tooltip>

          <Popover
            open={isSitePopoverOpen}
            anchorEl={siteAnchorEl}
            onClose={handleCloseSitePopover}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                width: 420,
                mt: 1,
                borderRadius: 1,
                border: '1px solid #D0D0D0',
                boxShadow: 3,
              },
            }}
          >
            {/* Search */}
            <Box sx={{ p: 1, borderBottom: '1px solid #E0E0E0' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search"
                value={siteSearch}
                onChange={(event) => setSiteSearch(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Site List */}
            <Box
              sx={{
                p: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                columnGap: 1,
                rowGap: 0,
                maxHeight: 180,
                overflowY: 'auto',
              }}
            >
              {filteredSites.length > 0 ? (
                filteredSites.map((site) => (
                  <FormControlLabel
                    key={site}
                    sx={{
                      m: 0,
                      height: 30,
                    }}
                    control={
                      <Checkbox
                        size="small"
                        checked={draftSelectedSites.includes(site)}
                        onChange={() => handleSiteToggle(site)}
                        sx={{ p: 0.5 }}
                      />
                    }
                    label={site}
                  />
                ))
              ) : (
                <Typography
                  sx={{
                    gridColumn: '1 / -1',
                    color: 'text.secondary',
                  }}
                >
                  No sites found
                </Typography>
              )}
            </Box>

            {/* Footer */}
            <Box
              sx={{
                px: 1,
                py: 0.75,
                borderTop: '1px solid #E0E0E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <FormControlLabel
                sx={{
                  m: 0,
                }}
                control={
                  <Checkbox
                    size="small"
                    checked={allSitesSelected}
                    indeterminate={someSitesSelected}
                    onChange={handleToggleAllSites}
                    sx={{ p: 0.5 }}
                  />
                }
                label="Show/Hide All"
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleApplySiteFilter}
                  sx={{
                    font: 82,
                    fontSize: '0.72rem',
                    height: 28,
                    textTransform: 'none',
                  }}
                >
                  Apply Filter
                </Button>

                <Button size="small" onClick={handleResetSites}>
                  Reset
                </Button>
              </Box>
            </Box>
          </Popover>

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

export default React.memo(POFilters);