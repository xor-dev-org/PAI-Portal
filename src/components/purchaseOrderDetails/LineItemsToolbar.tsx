import React from 'react';
import {
  Box,
  Checkbox,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface LineItemsToolbarProps {
  selectAll: boolean;
  searchQuery: string;
  onToggleSelectAll: (checked: boolean) => void;
  onSearchChange: (value: string) => void;
}

const LineItemsToolbar: React.FC<LineItemsToolbarProps> = ({
  selectAll,
  searchQuery,
  onToggleSelectAll,
  onSearchChange,
}) => (
  <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
    <Checkbox size="small" checked={selectAll} onChange={(event) => onToggleSelectAll(event.target.checked)} />
    <Typography sx={{ fontSize: 11, fontWeight: 700 }}>SELECT ALL</Typography>
    <Box>
      <TextField
        size="small"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search"
        sx={{ width: { xs: 180, sm: 220 } }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  </Stack>
);

export default React.memo(LineItemsToolbar);
