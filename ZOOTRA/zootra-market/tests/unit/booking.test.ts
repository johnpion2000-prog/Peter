import { render, screen } from '@testing-library/react';
import { BookingProvider } from '../../frontend/src/contexts/BookingContext';
import Login from '../../frontend/src/pages/Login';
import { MemoryRouter } from 'react-router-dom';

describe('BookingContext', () => {
    test('renders children without crashing', () => {
        render(
            <MemoryRouter>
                <BookingProvider>
                    <Login />
                </BookingProvider>
            </MemoryRouter>
        );

        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
});
