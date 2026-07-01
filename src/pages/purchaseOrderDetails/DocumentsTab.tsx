import React, { useMemo } from 'react';
import { Badge, Box, IconButton, Stack, Tooltip } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbarColumnsButton, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton } from '@mui/x-data-grid';
import { PushPin, PushPinOutlined } from '@mui/icons-material';

import { DocsRow } from './types';
import { buildDocumentColumns } from './gridColumns';
import { useUserGridColumnVisibility } from '@/hooks/useUserGridColumnVisibility';

type DocumentsTabProps = {
  documentsRows: DocsRow[];
  role: string;
  onReviewDocument: (document: DocsRow, action: 'ACCEPT' | 'REJECT' | 'NEED_MORE_INFORMATION') => void;
  onDownloadDocument: (document: DocsRow) => void;
  onReplaceDocument: (document: DocsRow) => void;
  checkboxSelection?: boolean;
  rowSelectionModel?: string[];
  onRowSelectionModelChange?: (selectedRowIds: string[]) => void;
  pinnedCount: number;
  pinFilter: 'all' | 'pinned';
  onTogglePinFilter: () => void;
  pinnedDocumentIds: string[];
  onToggleDocumentPin: (documentId: string) => void;
  userId?: string;
};

const DocumentsToolbar: React.FC<{
  pinnedCount: number;
  pinFilter: 'all' | 'pinned';
  onTogglePinFilter: () => void;
}> = ({ pinnedCount, pinFilter, onTogglePinFilter }) => (
  <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ width: '100%', py: 0 }}>
    <Stack direction="row" alignItems="center" spacing={0.25} sx={{ pr: 0.5, marginRight: 1 }}>
      <GridToolbarColumnsButton slotProps={{ button: { sx: { minWidth: 40, px: 1, py: 0.5 } } }} />
      <GridToolbarFilterButton slotProps={{ button: { sx: { minWidth: 40, px: 1, py: 0.5 } } }} />
      <GridToolbarDensitySelector slotProps={{ button: { sx: { minWidth: 40, px: 1, py: 0.5 } } }} />
      <GridToolbarExport slotProps={{ button: { sx: { minWidth: 40, px: 1, py: 0.5 } } }} />
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
            sx={{ color: pinFilter === 'pinned' ? 'primary.main' : 'action.disabled' }}
          >
            {pinFilter === 'pinned' ? <PushPin fontSize="small" /> : <PushPinOutlined fontSize="small" />}
          </IconButton>
        </Badge>
      </Tooltip>
    </Stack>
  </Stack>
);

const DocumentsTab: React.FC<DocumentsTabProps> = ({
  documentsRows,
  role,
  onReviewDocument,
  onDownloadDocument,
  onReplaceDocument,
  checkboxSelection = true,
  rowSelectionModel = [],
  onRowSelectionModelChange,
  pinnedCount,
  pinFilter,
  onTogglePinFilter,
  pinnedDocumentIds,
  onToggleDocumentPin,
  userId
}) => {
  const baseColumns = buildDocumentColumns({ role, onReviewDocument, onDownloadDocument, onReplaceDocument });
  const columns = useMemo<GridColDef[]>(() => [
    {
      field: 'pin',
      headerName: 'Pin',
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<DocsRow>) => {
        const documentId = String(params.row.id || '');
        const isPinned = pinnedDocumentIds.includes(documentId);
        return (
          <Tooltip title={isPinned ? 'Unpin' : 'Pin'}>
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onToggleDocumentPin(documentId);
              }}
              sx={{ color: isPinned ? 'primary.main' : 'action.disabled' }}
            >
              {isPinned ? <PushPin fontSize="small" /> : <PushPinOutlined fontSize="small" />}
            </IconButton>
          </Tooltip>
        );
      },
    },
    ...baseColumns,
  ], [baseColumns, onToggleDocumentPin, pinnedDocumentIds]);

  const { columnVisibilityModel, handleColumnVisibilityModelChange } = useUserGridColumnVisibility(
    userId,
    'po_details_documents'
  );

  return (
    <Stack spacing={1.5}>
      <Box sx={{ height: 520 }}>
        <DataGrid
          rows={documentsRows}
          getRowId={(row) => row.id}
          columns={columns}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
          checkboxSelection={checkboxSelection}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={(model) => onRowSelectionModelChange?.(model as string[])}
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          localeText={{ noRowsLabel: 'No Documents' }}
          slots={{
            toolbar: () => (
              <DocumentsToolbar
                pinnedCount={pinnedCount}
                pinFilter={pinFilter}
                onTogglePinFilter={onTogglePinFilter}
              />
            ),
          }}
          sx={{
            border: '0px',
            borderRadius: 0,
            '& .MuiDataGrid-cell': {
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
            '& .MuiDataGrid-row:hover': { backgroundColor: '#f8fbff' },
            '& .MuiDataGrid-toolbarContainer': {
              justifyContent: 'flex-end',
              borderBottom: '1px solid #d6dde8',
              px: 1,
              py: 0.5,
              borderRadius: 0,
            },
          }}
        />
      </Box>
    </Stack>
  );
};

export default DocumentsTab;
