import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '~/test/utils';
import { Button } from './Button';

describe('Button Component', () => {
    it('renders with default props', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('btn');
    });

    it('applies visual variants that define interaction affordance', () => {
        const { rerender } = render(<Button variant="outline">Outline</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-outline');

        rerender(<Button status="success">Success</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-success');

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-lg');
    });

    it('disables interaction when disabled prop is set', () => {
        const handleClick = vi.fn();
        render(
            <Button disabled onClick={handleClick}>
                Disabled
            </Button>,
        );
        const button = screen.getByRole('button');

        expect(button).toBeDisabled();
        button.click();
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows loading indicator and suppresses label when loading', () => {
        render(<Button loading>Loading</Button>);
        const button = screen.getByRole('button');

        expect(button).toBeDisabled();
        expect(button.querySelector('.loading-spinner')).toBeInTheDocument();
        expect(button).not.toHaveTextContent('Loading');
    });

    it('calls onClick when enabled', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        screen.getByRole('button').click();

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('defaults to button type', () => {
        render(<Button>Default Type</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('allows overriding the button type', () => {
        render(<Button type="submit">Submit</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('forwards arbitrary HTML attributes', () => {
        render(
            <Button
                data-testid="custom-button"
                aria-label="Custom aria label"
                id="my-button"
            >
                Button
            </Button>,
        );

        const button = screen.getByTestId('custom-button');
        expect(button).toHaveAttribute('aria-label', 'Custom aria label');
        expect(button).toHaveAttribute('id', 'my-button');
    });
});
