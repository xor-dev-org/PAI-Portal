import React from 'react';
import { Tabs, Tab } from '@mui/material';
import { poDetailsColors } from './constants';

interface LineStatusTabsProps {
  tabs: string[];
  activeTab: number;
  onChange: (value: number) => void;
}

const LineStatusTabs: React.FC<LineStatusTabsProps> = ({ tabs, activeTab, onChange }) => (
  <Tabs
    value={activeTab}
    onChange={(_, value) => onChange(value)}
    variant="scrollable"
    scrollButtons="auto"
    sx={{
      minHeight: 34,
      '& .MuiTab-root': {
        minHeight: 34,
        py: 0.4,
        px: 1.2,
        textTransform: 'uppercase',
        fontSize: 11,
        color: poDetailsColors.textSecondary,
      },
      '& .Mui-selected': {
        color: `${poDetailsColors.primaryBlue} !important`,
      },
      '& .MuiTabs-indicator': {
        backgroundColor: poDetailsColors.primaryBlue,
      },
    }}
  >
    {tabs.map((tab) => (
      <Tab key={tab} label={tab} />
    ))}
  </Tabs>
);

export default React.memo(LineStatusTabs);
