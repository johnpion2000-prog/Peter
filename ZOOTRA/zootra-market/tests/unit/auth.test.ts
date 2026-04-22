import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../../frontend/src/contexts/AuthContext';
import Login from '../../frontend/src/pages/Login';
import { MemoryRouter } from 'react-router-dom';

describe('Login Component', () => {
    test('renders login form', () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('displays error message on invalid login', async () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    });

    test('navigates to register page', () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('link', { name: /register/i }));
        expect(window.location.pathname).toBe('/register');
    });
});

describe('Login Component', () => {
    test('renders login form', () => {
        render(
            <MemoryRouter>
                <AuthContextProvider>
                    <Login />
                </AuthContextProvider>
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('displays error message on invalid login', async () => {
        render(
            <MemoryRouter>
                <AuthContextProvider>
                    <Login />
                </AuthContextProvider>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    });

    test('navigates to register page', () => {
        render(
            <MemoryRouter>
                <AuthContextProvider>
                    <Login />
                </AuthContextProvider>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('link', { name: /register/i }));
        expect(window.location.pathname).toBe('/register');
    });
});