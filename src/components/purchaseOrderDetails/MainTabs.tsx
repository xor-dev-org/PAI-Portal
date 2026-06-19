import React from 'react';
import { Tabs, Tab } from '@mui/material';
import { poDetailsColors } from './constants';

interface MainTabsProps {
  tabs: string[];
  activeTab: number;
  onChange: (value: number) => void;
}

const MainTabs: React.FC<MainTabsProps> = ({ tabs, activeTab, onChange }) => (
  <Tabs
    value={activeTab}
    onChange={(_, value) => onChange(value)}
    variant="scrollable"
    scrollButtons="auto"
    sx={{
      minHeight: 38,
      borderBottom: `1px solid ${poDetailsColors.border}`,
      '& .MuiTab-root': {
        minHeight: 38,
        py: 0.8,
        px: 1.5,
        textTransform: 'uppercase',
        fontSize: 12,
        fontWeight: 600,
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

export default MainTabs;
