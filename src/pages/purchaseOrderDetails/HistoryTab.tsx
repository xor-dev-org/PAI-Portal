import React from 'react';
import { Alert, Avatar, Chip, Stack, Typography } from '@mui/material';
import { HistoryOutlined, InfoRounded } from '@mui/icons-material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineItem,
  TimelineSeparator,
} from '@mui/lab';

import { HistoryRow } from './types';
import { formatActionLabel, getActionVisual } from './utils';

type HistoryTabProps = {
  historyRows: HistoryRow[];
};

const HistoryTab: React.FC<HistoryTabProps> = ({ historyRows }) => {
  return (
    <Stack spacing={1.5} p={2}>
      {historyRows.length === 0 ? <Alert severity="info">No history yet.</Alert> : null}
      <Timeline
        position="right"
        sx={{
          m: 0,
          p: 0,
          '& .MuiTimelineItem-root:before': {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {historyRows.map((row, idx) => {
          const visual = getActionVisual(row.action);
          const actionLabel = formatActionLabel(row.action);
          const roleLabel = String(row.actor_role || 'SYSTEM').toUpperCase();
          return (
            <TimelineItem key={`${row.id || idx}`}>
              <TimelineSeparator>
                <HistoryOutlined color={visual.color} />
                {idx < historyRows.length - 1 ? <TimelineConnector sx={{ bgcolor: 'grey.500' }} /> : null}
              </TimelineSeparator>

              <TimelineContent sx={{ py: 0.5 }}>
                <Stack spacing={0.6}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {actionLabel}-Line Item No-{row.line_item_id || '-'}
                    </Typography>
                    <Chip
                      size="small"
                      label={roleLabel}
                      color={visual.color}
                      sx={{ height: 18, borderRadius: 4 }}
                    />
                  </Stack>

                  <Typography variant="body2">
                    {row.notes || `${row.previous_status || '-'} -> ${row.new_status || '-'}`}
                  </Typography>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                      <Avatar sx={{ width: 16, height: 16, fontSize: 9 }}>
                        {(row.actor_id || '?').charAt(0)}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {row.actor_id || '-'}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                      >
                        {row.created_at || row.timestamp || '-'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Stack>
  );
};

export default HistoryTab;
