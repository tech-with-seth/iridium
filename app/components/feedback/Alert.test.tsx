import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert Component', () => {
    it('renders with base classes and role', () => {
        render(<Alert>Important message</Alert>);
        const alert = screen.getByRole('alert');

        expect(alert).toBeInTheDocument();
        expect(alert).toHaveClass('alert');
        expect(alert).toHaveClass('alert-horizontal');
        expect(alert).toHaveTextContent('Important message');
    });

    it('applies variant classes', () => {
        const { rerender } = render(
            <Alert variant="outline">Outline alert</Alert>,
        );
        expect(screen.getByRole('alert')).toHaveClass('alert-outline');

        rerender(<Alert variant="dash">Dash alert</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('alert-dash');

        rerender(<Alert variant="soft">Soft alert</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('alert-soft');
    });

    it('applies status classes', () => {
        const { rerender } = render(<Alert status="info">Info</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('alert-info');

        rerender(<Alert status="success">Success</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('alert-success');

        rerender(<Alert status="warning">Warning</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('alert-warning');

        rerender(<Alert status="error">Error</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('alert-error');
    });

    it('applies direction classes', () => {
        const { rerender } = render(
            <Alert direction="vertical">Vertical alert</Alert>,
        );
        expect(screen.getByRole('alert')).toHaveClass('alert-vertical');
        expect(screen.getByRole('alert')).not.toHaveClass('alert-horizontal');

        rerender(<Alert direction="horizontal">Horizontal alert</Alert>);
        expect(screen.getByRole('alert')).toHaveClass('alert-horizontal');
    });

    it('renders icon when provided', () => {
        render(
            <Alert icon={<span data-testid="alert-icon">!</span>}>
                Icon alert
            </Alert>,
        );

        expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent('Icon alert');
    });

    it('merges custom className', () => {
        render(<Alert className="custom-alert">Custom alert</Alert>);
        const alert = screen.getByRole('alert');

        expect(alert).toHaveClass('alert');
        expect(alert).toHaveClass('custom-alert');
    });
});
