import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PurchaseOrderDetails from '@/pages/PurchaseOrderDetails';
import { purchaseOrderService } from '@/api/services/purchaseOrderService';
import { PurchaseOrder, PurchaseOrderStatus } from '@/models';

vi.mock('@/components/common/ChatWidget', () => ({
  default: () => null,
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'PS-001', role: 'PROCUREMENT_SPECIALIST' },
  }),
}));

vi.mock('@/api/services/purchaseOrderService', () => ({
  purchaseOrderService: {
    getPOById: vi.fn(),
    performPOAction: vi.fn(),
  },
}));

const basePO: PurchaseOrder = {
  id: 'po-1',
  po_number: 'PO-10001',
  source_system: 'SAP',
  status: PurchaseOrderStatus.IN_PROGRESS,
  supplier_id: 'SUP-001',
  supplier_name: 'Supplier 1',
  procurement_specialist_id: 'PS-001',
  delegated_user_id: '',
  currency: 'INR',
  total_value: 12000,
  delivery_date: '2026-06-25',
  payment_terms: 'Net 30',
  mrp_exceptions: 'NONE',
  created_date: '2026-05-28',
  line_items: [
    {
      id: '00001',
      line_number: 1,
      material_code: 'MAT-AAA',
      description: 'Cancelled Line',
      quantity: 2,
      unit_price: 100,
      line_status: 'CANCELLED',
      required_in_house_date: '2026-06-18',
      shipment_date: '2026-06-14',
    },
    {
      id: '00002',
      line_number: 2,
      material_code: 'MAT-BBB',
      description: 'Approved Line',
      quantity: 3,
      unit_price: 200,
      line_status: 'APPROVED',
      required_in_house_date: '2026-06-20',
      shipment_date: '2026-06-16',
    },
  ],
  ui_config: {
    main_tabs: ['PO DETAILS'],
    header_actions: ['EXPORT'],
    line_status_tabs: ['ALL', 'REJECTED', 'ACCEPTED'],
    line_actions: ['MOVE_IN', 'MOVE_OUT', 'ACCEPT'],
    layout: {
      show_mrp_tab: false,
      show_supplier_total_row: false,
      show_bottom_page_action_bar: false,
      show_ps_bottom_summary: false,
    },
  },
  available_actions: ['MOVE_IN', 'MOVE_OUT', 'ACCEPT'],
};

describe('PurchaseOrderDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(purchaseOrderService.getPOById).mockResolvedValue(basePO);
    vi.mocked(purchaseOrderService.performPOAction).mockResolvedValue(basePO);
  });

  it('filters line items by status tabs using status aliases', async () => {
    render(
      <MemoryRouter initialEntries={['/purchase-orders/po-1']}>
        <Routes>
          <Route path="/purchase-orders/:id" element={<PurchaseOrderDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('MAT-AAA')).toBeInTheDocument();
    expect(screen.getByText('MAT-BBB')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'REJECTED' }));

    await waitFor(() => {
      expect(screen.getByText('MAT-AAA')).toBeInTheDocument();
      expect(screen.queryByText('MAT-BBB')).not.toBeInTheDocument();
    });
  });

  it('submits MOVE_IN date updates through action payload', async () => {
    render(
      <MemoryRouter initialEntries={['/purchase-orders/po-1']}>
        <Routes>
          <Route path="/purchase-orders/:id" element={<PurchaseOrderDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('MAT-AAA')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('line-item-actions-00001'));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Move In' }));
    expect(await screen.findByText('Move In Date - PO Line 00001')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('2026-06-18'), {
      target: { value: '2026-07-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Date' }));

    await waitFor(() => {
      expect(purchaseOrderService.performPOAction).toHaveBeenCalledWith('po-1', {
        action: 'MOVE_IN',
        line_item_id: '00001',
        notes: '',
        move_in_date: '2026-07-01',
        move_out_date: undefined,
      });
    });
  });
});
