import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminLayout from './layout';

describe('AdminLayout', () => {
  it('renders sidebar links and children', () => {
    render(
      <AdminLayout>
        <p>Test content</p>
      </AdminLayout>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Users/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Products/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Categories/i })).toBeInTheDocument();

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});
