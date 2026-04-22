import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../../frontend/src/contexts/AuthContext';
import Register from '../../frontend/src/pages/Register';
import { MemoryRouter } from 'react-router-dom';

describe('Register Component', () => {
  it('renders the registration form', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('shows validation error for empty form submission', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/required/i)).toBeInTheDocument();
  });
});