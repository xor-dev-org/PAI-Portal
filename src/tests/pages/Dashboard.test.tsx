import { describe, it, expect } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import Dashboard from '@/pages/Dashboard';

describe('Dashboard', () => {
  it('should render dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render welcome message', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Welcome to PAI Portal/i)).toBeInTheDocument();
  });

  it('should render all stat cards', () => {
    render(<Dashboard />);
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
    expect(screen.getByText('Total Spend')).toBeInTheDocument();
    expect(screen.getByText('Active Suppliers')).toBeInTheDocument();
  });

  it('should render recent activity section', () => {
    render(<Dashboard />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('should render quick actions section', () => {
    render(<Dashboard />);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });
});
