import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BackHandIcon from '@mui/icons-material/BackHand';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SyncIcon from '@mui/icons-material/Sync';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { poDetailsColors } from './constants';
import { formatActionLabel } from './helpers';

interface LineItemActionsMenuProps {
  anchorEl: HTMLElement | null;
  actions: string[];
  onClose: () => void;
  onActionClick: (action: string) => void;
}

const actionIcons: Record<string, React.ReactNode> = {
  MOVE_IN: <BackHandIcon fontSize="small" />,
  MOVE_OUT: <SwapHorizIcon fontSize="small" />,
  SPLIT: <CallSplitIcon fontSize="small" />,
  HOLD: <WarningAmberIcon fontSize="small" />,
  REJECT: <CancelOutlinedIcon fontSize="small" />,
  ACCEPT: <CheckCircleOutlineIcon fontSize="small" />,
  NEED_MORE_INFORMATION: <InfoOutlinedIcon fontSize="small" />,
  MAKE_REVISION: <SyncIcon fontSize="small" />,
  RAISE_CONCESSION: <TrendingUpIcon fontSize="small" />,
  UPLOAD_DOCUMENT: <UploadFileIcon fontSize="small" />,
};

const LineItemActionsMenu: React.FC<LineItemActionsMenuProps> = ({
  anchorEl,
  actions,
  onClose,
  onActionClick,
}) => {
  const open = Boolean(anchorEl);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 220,
          border: `1px solid ${poDetailsColors.border}`,
          boxShadow: '0 8px 18px rgba(2,6,23,0.12)',
        },
      }}
    >
      {actions.map((action, index) => {
        const showDivider =
          action === 'UPLOAD_DOCUMENT' && actions.includes('ACCEPT') && index < actions.length - 1;

        return (
          <React.Fragment key={action}>
            <MenuItem dense onClick={() => onActionClick(action)}>
              <ListItemIcon sx={{ minWidth: 28 }}>{actionIcons[action] || <InfoOutlinedIcon fontSize="small" />}</ListItemIcon>
              <ListItemText primary={formatActionLabel(action)} primaryTypographyProps={{ fontSize: 12 }} />
            </MenuItem>
            {showDivider ? <Divider /> : null}
          </React.Fragment>
        );
      })}
    </Menu>
  );
};

export default LineItemActionsMenu;
