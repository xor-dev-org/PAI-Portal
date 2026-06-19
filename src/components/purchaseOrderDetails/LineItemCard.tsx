import React from 'react';
import {
  Box,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { LineItem } from '@/models';
import { poDetailsColors } from './constants';
import { formatLineId } from './helpers';

interface LineItemCardProps {
  lineItem: LineItem;
  expanded: boolean;
  selected: boolean;
  role: string;
  onToggleExpanded: (lineId: string) => void;
  onToggleSelected: (lineId: string, checked: boolean) => void;
  onOpenMenu: (target: HTMLElement, lineId: string) => void;
}

const summaryLabelSx = {
  fontSize: 10,
  color: poDetailsColors.textSecondary,
  textTransform: 'uppercase',
};

const summaryValueSx = {
  fontSize: 12,
  color: poDetailsColors.textPrimary,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const FieldBlock: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ minWidth: 76 }}>
    <Typography sx={summaryLabelSx}>{label}</Typography>
    <Box sx={summaryValueSx}>{value}</Box>
  </Box>
);

const LineItemCard: React.FC<LineItemCardProps> = ({
  lineItem,
  expanded,
  selected,
  role,
  onToggleExpanded,
  onToggleSelected,
  onOpenMenu,
}) => {
  const lineId = lineItem.id || formatLineId(lineItem.line_number);

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 1,
        borderColor: poDetailsColors.border,
        boxShadow: '0 1px 2px rgba(15,23,42,0.08)',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1.5, py: 1 }}>
        <Checkbox
          size="small"
          checked={selected}
          onChange={(event) => onToggleSelected(lineId, event.target.checked)}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(90px, 1fr))',
              md: 'repeat(6, minmax(86px, 1fr))',
              xl: 'repeat(12, minmax(72px, 1fr))',
            },
            gap: 1,
            flex: 1,
            minWidth: 0,
          }}
        >
          <FieldBlock label="Line No" value={<Typography sx={{ ...summaryValueSx, color: poDetailsColors.primaryBlue }}>{lineId}</Typography>} />
          <FieldBlock label="Material No" value={<Typography sx={{ ...summaryValueSx, fontWeight: 700 }}>{lineItem.material_code}</Typography>} />
          <FieldBlock label="Unit" value={lineItem.unit || 'EA'} />
          <FieldBlock label="Per" value={lineItem.per || 1} />
          <FieldBlock label="Unit Price" value={lineItem.unit_price} />
          <FieldBlock label="Quantity" value={lineItem.quantity} />
          <FieldBlock label="Supplier Mat" value={lineItem.supplier_mat_code || '-'} />
          <FieldBlock
            label="Transportation"
            value={<Typography sx={{ ...summaryValueSx, fontWeight: 700 }}>{lineItem.transportation || '-'}</Typography>}
          />
          <FieldBlock
            label="Shipment Date"
            value={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarTodayIcon sx={{ fontSize: 13, color: poDetailsColors.textSecondary }} />
                <Typography sx={summaryValueSx}>{lineItem.shipment_date || '-'}</Typography>
              </Stack>
            }
          />
          <FieldBlock
            label="Required Date"
            value={
              <Chip
                size="small"
                icon={<CalendarTodayIcon sx={{ color: `${poDetailsColors.dateRed} !important` }} />}
                label={lineItem.required_in_house_date || '-'}
                sx={{
                  height: 22,
                  backgroundColor: poDetailsColors.datePill,
                  color: poDetailsColors.dateRed,
                  '.MuiChip-label': { fontSize: 11, px: 0.8 },
                }}
              />
            }
          />
          <FieldBlock
            label="Net Value"
            value={
              <Chip
                size="small"
                label={lineItem.net_value ?? lineItem.quantity * lineItem.unit_price}
                sx={{
                  height: 22,
                  backgroundColor: poDetailsColors.netValuePill,
                  color: poDetailsColors.primaryBlue,
                  '.MuiChip-label': { fontSize: 11, px: 0.8, fontWeight: 700 },
                }}
              />
            }
          />
        </Box>

        <IconButton
          size="small"
          aria-label={`line-item-actions-${lineId}`}
          onClick={(event) => onOpenMenu(event.currentTarget, lineId)}
          sx={{
            border: `1px solid ${poDetailsColors.primaryBlue}`,
            borderRadius: 1,
            ml: 0.5,
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>

        <IconButton size="small" aria-label={`line-item-expand-${lineId}`} onClick={() => onToggleExpanded(lineId)}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Stack>

      <Collapse in={expanded}>
        <Divider sx={{ borderStyle: 'dotted' }} />
        <Box sx={{ p: 1.5 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FieldBlock label="Description" value={lineItem.description || '-'} />
            {role !== 'SUPPLIER' && (
              <>
                <FieldBlock label="Updated Quantity" value={lineItem.updated_quantity ?? '-'} />
                <FieldBlock label="Updated Unit Price" value={lineItem.updated_unit_price ?? '-'} />
                <FieldBlock label="Updated Delivery Date" value={lineItem.updated_delivery_date || '-'} />
                <FieldBlock label="Updated Material No" value={lineItem.updated_material_no || '-'} />
                <FieldBlock label="Updated Description" value={lineItem.updated_description || '-'} />
                <FieldBlock
                  label="Updated Net Value"
                  value={
                    lineItem.updated_net_value ? (
                      <Chip
                        size="small"
                        label={lineItem.updated_net_value}
                        sx={{
                          height: 22,
                          backgroundColor: poDetailsColors.netValuePill,
                          color: poDetailsColors.primaryBlue,
                          '.MuiChip-label': { fontSize: 11, px: 0.8, fontWeight: 700 },
                        }}
                      />
                    ) : (
                      '-'
                    )
                  }
                />
              </>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default React.memo(LineItemCard);
