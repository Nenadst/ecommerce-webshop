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

    // Sidebar heading
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();

    // Sidebar links
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Users/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Products/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Categories/i })).toBeInTheDocument();

    // Child content
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});
