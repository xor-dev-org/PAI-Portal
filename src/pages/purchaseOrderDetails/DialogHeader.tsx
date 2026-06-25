import React from 'react';
import { Box, Typography } from '@mui/material';

type DialogHeaderProps = {
  title: string;
};

const DialogHeader: React.FC<DialogHeaderProps> = ({ title }) => (
  <Box sx={{ bgcolor: 'primary.dark', color: 'white', px: 2, py: 1.5 }}>
    <Typography variant="h6">{title}</Typography>
  </Box>
);

export default DialogHeader;
