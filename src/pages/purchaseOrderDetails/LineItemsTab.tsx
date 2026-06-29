import React, { useState } from 'react';
import { Badge, Box, IconButton, Stack, TextField, Tooltip } from '@mui/material';
import {
  DataGrid,
  GridFilterModel,
  GridColDef,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { PushPin, PushPinOutlined, Search } from '@mui/icons-material';

import { LineItem } from '@/models';
import { formatLineId } from './utils';

type LineItemsTabProps = {
  displayedLineItems: LineItem[];
  columns: GridColDef[];
  pinnedCount: number;
  linePinFilter: 'all' | 'pinned';
  onTogglePinFilter: () => void;
  checkboxSelection?: boolean;
  rowSelectionModel?: string[];
  onRowSelectionModelChange?: (selectedRowIds: string[]) => void;
  onRowClick?: (row: LineItem) => void;
};

type LineItemsToolbarProps = {
  pinnedCount: number;
  linePinFilter: 'all' | 'pinned';
  onTogglePinFilter: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

const LineItemsToolbar: React.FC<LineItemsToolbarProps> = ({
  pinnedCount,
  linePinFilter,
  onTogglePinFilter,
  searchValue,
  onSearchChange,
}) => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      alignItems="center"
      sx={{ width: '100%', py: 0 }}
    >
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
        <Stack direction="row" alignItems="center" spacing={0.25} sx={{ pr: 0.5, marginRight: 1 }}>
          <Tooltip title={showSearch ? 'Hide search' : 'Search'}>
            <IconButton size="small" onClick={() => setShowSearch((prev) => !prev)}>
              <Search fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              width: showSearch ? 220 : 0,
              opacity: showSearch ? 1 : 0,
              overflow: 'hidden',
              transition: 'width 180ms ease, opacity 120ms ease',
            }}
          >
            <TextField
              size="small"
              value={searchValue}
              placeholder="Search"
              onChange={(event) => onSearchChange(event.target.value)}
              sx={{ width: '100%' }}
            />
          </Box>

          <GridToolbarColumnsButton
            slotProps={{
              button: {
                sx: { minWidth: 40, px: 1, py: 0.5 },
              },
            }}
          />
          <GridToolbarFilterButton
            slotProps={{
              button: {
                sx: { minWidth: 40, px: 1, py: 0.5 },
              },
            }}
          />
          <GridToolbarDensitySelector
            slotProps={{
              button: {
                sx: { minWidth: 40, px: 1, py: 0.5 },
              },
            }}
          />
          <GridToolbarExport
            slotProps={{
              button: {
                sx: { minWidth: 40, px: 1, py: 0.5 },
              },
            }}
          />
          <Tooltip title="Pin filter" sx={{ mr: 0.5 }}>
            <Badge
              badgeContent={pinnedCount || null}
              color="primary"
              sx={{
                '& .MuiBadge-badge': {
                  right: -1,
                  top: 7,
                },
              }}
            >
              <IconButton
                size="small"
                onClick={onTogglePinFilter}
                sx={{ color: linePinFilter === 'pinned' ? 'primary.main' : 'action.disabled' }}
              >
                {linePinFilter === 'pinned' ? (
                  <PushPin fontSize="small" />
                ) : (
                  <PushPinOutlined fontSize="small" />
                )}
              </IconButton>
            </Badge>
          </Tooltip>
        </Stack>
      </Box>
    </Stack>
  );
};

const LineItemsTab: React.FC<LineItemsTabProps> = ({
  displayedLineItems,
  columns,
  pinnedCount,
  linePinFilter,
  onTogglePinFilter,
  checkboxSelection = true,
  rowSelectionModel = [],
  onRowSelectionModelChange,
  onRowClick,
}) => {
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });
  const quickFilterValue = (filterModel.quickFilterValues || []).join(' ');

  return (
    <Stack spacing={1.5}>
      <Box sx={{ height: 520 }}>
        <DataGrid
          rows={displayedLineItems}
          rowHeight={35}
          getRowId={(row) => formatLineId(row)}
          columns={columns}
          checkboxSelection={checkboxSelection}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={(model) => onRowSelectionModelChange?.(model as string[])}
          onRowClick={(params) => onRowClick?.(params.row as LineItem)}
          getRowClassName={(params) => (String(params.row.line_status || '').toUpperCase().includes('HOLD') ? 'line-row--disabled' : '')}
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          slots={{
            toolbar: () => (
              <LineItemsToolbar
                pinnedCount={pinnedCount}
                linePinFilter={linePinFilter}
                onTogglePinFilter={onTogglePinFilter}
                searchValue={quickFilterValue}
                onSearchChange={(value) =>
                  setFilterModel((prev) => ({
                    ...prev,
                    quickFilterValues: value
                      .split(' ')
                      .map((token) => token.trim())
                      .filter((token) => token.length > 0),
                  }))
                }
              />
            ),
          }}
          sx={{
            border: '0px',
            borderRadius: 0,
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #eef2f7',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 0,
            },
            '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid #d6dde8' },
            '& .MuiDataGrid-columnHeader': {
              display: 'flex',
              alignItems: 'center',
              borderRadius: 0,
            },
            '& .MuiDataGrid-row:hover': { backgroundColor: '#F8EFE7' },
            '& .MuiDataGrid-row.line-row--disabled': {
              opacity: 0.55,
              backgroundColor: '#f7f8fa',
            },
            '& .MuiDataGrid-row.line-row--disabled:hover': {
              backgroundColor: '#f7f8fa',
            },
            '& .MuiDataGrid-row.line-row--disabled .MuiDataGrid-cell': {
              cursor: 'not-allowed',
            },
            '& .MuiDataGrid-toolbarContainer': {
              justifyContent: 'flex-end',
              borderBottom: '1px solid #d6dde8',
              px: 1,
              py: 0.5,
              overflow: 'visible',
              borderRadius: 0,
            },
          }}
        />
      </Box>
    </Stack>
  );
};

export default LineItemsTab;
