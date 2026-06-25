import React from 'react';
import { Box, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { DocsRow } from './types';
import { buildDocumentColumns } from './gridColumns';

type DocumentsTabProps = {
  documentsRows: DocsRow[];
  role: string;
  onReviewDocument: (document: DocsRow, action: 'ACCEPT' | 'REJECT' | 'NEED_MORE_INFORMATION') => void;
  onDownloadDocument: (document: DocsRow) => void;
  onReplaceDocument: (document: DocsRow) => void;
  checkboxSelection?: boolean;
  rowSelectionModel?: string[];
  onRowSelectionModelChange?: (selectedRowIds: string[]) => void;
};

const DocumentsTab: React.FC<DocumentsTabProps> = ({
  documentsRows,
  role,
  onReviewDocument,
  onDownloadDocument,
  onReplaceDocument,
  checkboxSelection = false,
  rowSelectionModel = [],
  onRowSelectionModelChange,
}) => {
  const columns = buildDocumentColumns({ role, onReviewDocument, onDownloadDocument, onReplaceDocument });

  return (
    <Stack spacing={1.5}>
      <Box sx={{ height: 520 }}>
        <DataGrid
          rows={documentsRows}
          getRowId={(row) => row.id}
          columns={columns}
          checkboxSelection={checkboxSelection}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={(model) => onRowSelectionModelChange?.(model as string[])}
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          localeText={{ noRowsLabel: 'No Documents' }}
          
          sx={{
            border: '0px',
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid #d6dde8' },
            '& .MuiDataGrid-columnHeader': {
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-row:hover': { backgroundColor: '#f8fbff' },
          }}
        />
      </Box>
    </Stack>
  );
};

export default DocumentsTab;
