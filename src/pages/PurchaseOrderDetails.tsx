import React, { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { purchaseOrderService } from '@/api/services/purchaseOrderService';
import { LineItem, POActionRequest, PurchaseOrder } from '@/models';
import ChatWidget from '@/components/common/ChatWidget';
import teamChatData from '../data/poChatData.json';
import { Conversation } from '@/components/common/ChatWidget';
import {
  LineItemActionsMenu,
  LineItemCard,
  LineItemsToolbar,
  LineStatusTabs,
  MainTabs,
  MoveDateDialog,
  PoDetailsPanel,
  PSBottomSummaryBar,
  RevisionDialog,
  SupplierBottomActionBar,
  SupplierTotalRow,
  TopHeader,
} from '@/components/purchaseOrderDetails';
import { poDetailsColors } from '@/components/purchaseOrderDetails/constants';
import { doesLineStatusMatchTab, formatActionLabel, formatLineId } from '@/components/purchaseOrderDetails/helpers';
import { useAuth } from '@/hooks/useAuth';

const PurchaseOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [po, setPO] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMainTab, setActiveMainTab] = useState(0);
  const [activeLineStatusTab, setActiveLineStatusTab] = useState(0);
  const [viewMode, setViewMode] = useState<'GRID' | 'CARD'>('CARD');
  const [poPanelExpanded, setPoPanelExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [activeActionLineId, setActiveActionLineId] = useState<string | null>(null);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [revisionFullscreen, setRevisionFullscreen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [moveDateDialogOpen, setMoveDateDialogOpen] = useState(false);
  const [moveDateAction, setMoveDateAction] = useState<'MOVE_IN' | 'MOVE_OUT' | null>(null);
  const [moveDateValue, setMoveDateValue] = useState('');
  const [moveDateNotes, setMoveDateNotes] = useState('');
  const [moveDateFullscreen, setMoveDateFullscreen] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const fetchPODetails = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await purchaseOrderService.getPOById(id);
      setPO(data);

      const expandedDefaults: Record<string, boolean> = {};
      const selectedDefaults: Record<string, boolean> = {};
      data.line_items.forEach((lineItem) => {
        const lineId = lineItem.id || formatLineId(lineItem.line_number);
        expandedDefaults[lineId] = Boolean(lineItem.default_expanded);
        selectedDefaults[lineId] = false;
      });

      setExpandedRows(expandedDefaults);
      setSelectedRows(selectedDefaults);

      if (data.ui_config?.header_actions?.includes('GRID')) {
        setViewMode('CARD');
      }
    } catch (err: any) {
      console.error('Error fetching PO details:', err);
      setError(err.response?.data?.detail || 'Failed to load purchase order details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchPODetails();
  }, [fetchPODetails]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('hide-global-chat'));

    return () => {
      window.dispatchEvent(new CustomEvent('show-global-chat'));
    };
  }, []);

  const uiConfig = po?.ui_config;
  const mainTabs = uiConfig?.main_tabs || ['PO DETAILS'];
  const lineStatusTabs = uiConfig?.line_status_tabs || ['ALL'];
  const lineActions = uiConfig?.line_actions || po?.available_actions || [];
  const role = user?.role || '';
  const selectedLineStatus = lineStatusTabs[activeLineStatusTab] || 'ALL';

  const filteredChatData = useMemo(
    () =>
      (teamChatData as Conversation[]).filter(
        (conversation) => conversation.poNumber === (po?.po_number || '')
      ),
    [po?.po_number]
  );

  const visibleLineItems = useMemo(() => {
    const lineItems = po?.line_items || [];
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

    return lineItems.filter((lineItem) => {
      const lineId = lineItem.id || formatLineId(lineItem.line_number);
      const searchable = `${lineId} ${lineItem.material_code} ${lineItem.description}`.toLowerCase();
      const matchesSearch = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesStatus = doesLineStatusMatchTab(selectedLineStatus, lineItem.line_status || 'ALL');

      return matchesSearch && matchesStatus;
    });
  }, [deferredSearchQuery, po?.line_items, selectedLineStatus]);

  const selectedActionLine: LineItem | undefined = useMemo(
    () =>
      (po?.line_items || []).find((lineItem) => {
        const lineId = lineItem.id || formatLineId(lineItem.line_number);
        return lineId === activeActionLineId;
      }),
    [activeActionLineId, po?.line_items]
  );

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  const closeMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleSearchChange = useCallback((value: string) => {
    startTransition(() => {
      setSearchQuery(value);
    });
  }, []);

  const handleToggleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedRows((prev) => {
        const nextState = { ...prev };
        visibleLineItems.forEach((lineItem) => {
          const lineId = lineItem.id || formatLineId(lineItem.line_number);
          nextState[lineId] = checked;
        });
        return nextState;
      });
    },
    [visibleLineItems]
  );

  const handleToggleExpanded = useCallback((lineId: string) => {
    setExpandedRows((prev) => ({ ...prev, [lineId]: !prev[lineId] }));
  }, []);

  const handleToggleSelected = useCallback((lineId: string, checked: boolean) => {
    setSelectedRows((prev) => ({
      ...prev,
      [lineId]: checked,
    }));
  }, []);

  const handleOpenLineItemMenu = useCallback((target: HTMLElement, lineId: string) => {
    setMenuAnchorEl(target);
    setActiveActionLineId(lineId);
  }, []);

  const applyAction = async (action: string, lineItem: LineItem, payloadOverrides?: Partial<POActionRequest>) => {
    if (!id) {
      return;
    }

    const lineItemId = lineItem.id || formatLineId(lineItem.line_number);
    const updated = await purchaseOrderService.performPOAction(id, {
      action,
      line_item_id: lineItemId,
      notes: payloadOverrides?.notes,
      move_in_date: payloadOverrides?.move_in_date,
      move_out_date: payloadOverrides?.move_out_date,
    });
    setPO(updated);
  };

  const handleMenuAction = async (action: string) => {
    if (!selectedActionLine) {
      closeMenu();
      return;
    }

    if (action === 'MAKE_REVISION') {
      setRevisionDialogOpen(true);
      closeMenu();
      return;
    }

    if (action === 'MOVE_IN' || action === 'MOVE_OUT') {
      setMoveDateAction(action);
      setMoveDateValue(
        action === 'MOVE_IN'
          ? selectedActionLine.required_in_house_date || ''
          : selectedActionLine.shipment_date || ''
      );
      setMoveDateNotes('');
      setMoveDateDialogOpen(true);
      closeMenu();
      return;
    }

    try {
      await applyAction(action, selectedActionLine);
      setActiveActionLineId(null);
      closeMenu();
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to run ${formatActionLabel(action)} action`);
      closeMenu();
    }
  };

  const handleSubmitRevision = async () => {
    if (!selectedActionLine) {
      setRevisionDialogOpen(false);
      return;
    }

    try {
      await applyAction('MAKE_REVISION', selectedActionLine, { notes: revisionNotes });
      setRevisionDialogOpen(false);
      setRevisionNotes('');
      setActiveActionLineId(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit revision request');
    }
  };

  const handleSubmitMoveDate = async () => {
    if (!selectedActionLine || !moveDateAction || !moveDateValue) {
      setMoveDateDialogOpen(false);
      return;
    }

    try {
      const payloadOverrides: Partial<POActionRequest> = {
        notes: moveDateNotes,
      };

      if (moveDateAction === 'MOVE_IN') {
        payloadOverrides.move_in_date = moveDateValue;
      } else {
        payloadOverrides.move_out_date = moveDateValue;
      }

      await applyAction(moveDateAction, selectedActionLine, payloadOverrides);
      setMoveDateDialogOpen(false);
      setMoveDateAction(null);
      setMoveDateValue('');
      setMoveDateNotes('');
      setActiveActionLineId(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to update ${formatActionLabel(moveDateAction)} date`);
    }
  };

  const handleSupplierAccept = async () => {
    if (!po) {
      return;
    }

    const selectedLine = po.line_items.find((lineItem) => {
      const lineId = lineItem.id || formatLineId(lineItem.line_number);
      return selectedRows[lineId];
    }) || po.line_items[0];

    if (!selectedLine) {
      return;
    }

    try {
      await applyAction('ACCEPT', selectedLine);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to accept line item');
    }
  };

  if (loading) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <CircularProgress size={20} />
        <Typography variant="body2">Loading purchase order details...</Typography>
      </Stack>
    );
  }

  if (error || !po) {
    return (
      <Box>
        <Alert severity="error">{error || 'Purchase order not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: poDetailsColors.pageBg, p: { xs: 1.5, md: 2 }, minHeight: '100%' }}>
      <Stack spacing={1.5}>
        <TopHeader
          poNumber={po.po_number}
          status={po.status}
          headerActions={uiConfig?.header_actions || ['EXPORT']}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onBack={() => navigate('/purchase-orders')}
        />

        {error && <Alert severity="error">{error}</Alert>}

        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderColor: poDetailsColors.border,
            boxShadow: '0 2px 8px rgba(15,23,42,0.08)',
            backgroundColor: poDetailsColors.paperBg,
          }}
        >
          <MainTabs tabs={mainTabs} activeTab={activeMainTab} onChange={setActiveMainTab} />

          {activeMainTab === 0 ? (
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              <PoDetailsPanel
                expanded={poPanelExpanded}
                details={po.po_details}
                onToggle={() => setPoPanelExpanded((prev) => !prev)}
              />

              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', lg: 'center' }}
                spacing={1}
              >
                <LineStatusTabs
                  tabs={lineStatusTabs}
                  activeTab={activeLineStatusTab}
                  onChange={setActiveLineStatusTab}
                />
                <LineItemsToolbar
                  selectAll={visibleLineItems.length > 0 && selectedCount === visibleLineItems.length}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  onToggleSelectAll={handleToggleSelectAll}
                />
              </Stack>

              <Box sx={{ overflowX: 'auto' }}>
                {visibleLineItems.map((lineItem) => {
                  const lineId = lineItem.id || formatLineId(lineItem.line_number);
                  return (
                    <LineItemCard
                      key={lineId}
                      role={role}
                      lineItem={lineItem}
                      expanded={Boolean(expandedRows[lineId])}
                      selected={Boolean(selectedRows[lineId])}
                      onToggleExpanded={handleToggleExpanded}
                      onToggleSelected={handleToggleSelected}
                      onOpenMenu={handleOpenLineItemMenu}
                    />
                  );
                })}
                {visibleLineItems.length === 0 ? (
                  <Alert severity="info">No line items match the selected status and search filters.</Alert>
                ) : null}
              </Box>

              {uiConfig?.layout?.show_supplier_total_row ? (
                <SupplierTotalRow totalValue={po.total_value} currency={po.currency} />
              ) : null}

              {uiConfig?.layout?.show_ps_bottom_summary ? (
                <PSBottomSummaryBar
                  totalValue={po.total_value}
                  currency={po.currency}
                  onCancel={() => navigate('/purchase-orders')}
                />
              ) : null}
            </Stack>
          ) : (
            <Box sx={{ pt: 2 }}>
              <Alert severity="info">{mainTabs[activeMainTab]} view layout is ready for API content integration.</Alert>
            </Box>
          )}
        </Paper>

        {uiConfig?.layout?.show_bottom_page_action_bar ? (
          <SupplierBottomActionBar onBack={() => navigate('/purchase-orders')} onAccept={handleSupplierAccept} />
        ) : null}
      </Stack>

      <LineItemActionsMenu
        anchorEl={menuAnchorEl}
        actions={lineActions}
        onClose={closeMenu}
        onActionClick={(action) => {
          void handleMenuAction(action);
        }}
      />

      <RevisionDialog
        open={revisionDialogOpen}
        lineItem={selectedActionLine || null}
        fullscreen={revisionFullscreen}
        notes={revisionNotes}
        onNotesChange={setRevisionNotes}
        onClose={() => {
          setRevisionDialogOpen(false);
          setActiveActionLineId(null);
        }}
        onToggleFullscreen={() => setRevisionFullscreen((prev) => !prev)}
        onSubmit={() => {
          void handleSubmitRevision();
        }}
      />

      <MoveDateDialog
        open={moveDateDialogOpen}
        lineItem={selectedActionLine || null}
        action={moveDateAction}
        fullscreen={moveDateFullscreen}
        dateValue={moveDateValue}
        notes={moveDateNotes}
        onDateChange={setMoveDateValue}
        onNotesChange={setMoveDateNotes}
        onClose={() => {
          setMoveDateDialogOpen(false);
          setMoveDateAction(null);
          setMoveDateValue('');
          setMoveDateNotes('');
          setActiveActionLineId(null);
        }}
        onToggleFullscreen={() => setMoveDateFullscreen((prev) => !prev)}
        onSubmit={() => {
          void handleSubmitMoveDate();
        }}
      />

      <ChatWidget
        initialConversations={filteredChatData as Conversation[]}
        title={`Team Messages - ${po.po_number}`}
        subtitle="Internal corporate communications"
      />
    </Box>
  );
};

export default PurchaseOrderDetails;