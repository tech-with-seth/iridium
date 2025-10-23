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

    it('renders with different variants', () => {
        const { rerender } = render(<Button variant="outline">Outline</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-outline');

        rerender(<Button variant="ghost">Ghost</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-ghost');

        rerender(<Button variant="link">Link</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-link');
    });

    it('renders with different status colors', () => {
        const { rerender } = render(<Button status="primary">Primary</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-primary');

        rerender(<Button status="success">Success</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-success');

        rerender(<Button status="error">Error</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-error');
    });

    it('renders with different sizes', () => {
        const { rerender } = render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-sm');

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-lg');

        rerender(<Button size="xl">Extra Large</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-xl');
    });

    it('handles disabled state', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveClass('btn-disabled');
    });

    it('handles loading state', () => {
        render(<Button loading>Loading</Button>);
        const button = screen.getByRole('button');

        // Should be disabled when loading
        expect(button).toBeDisabled();

        // Should show spinner instead of children
        expect(button.querySelector('.loading-spinner')).toBeInTheDocument();
        expect(button).not.toHaveTextContent('Loading');
    });

    it('handles wide prop', () => {
        render(<Button wide>Wide Button</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-wide');
    });

    it('handles block prop', () => {
        render(<Button block>Block Button</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-block');
    });

    it('handles circle and square props', () => {
        const { rerender } = render(<Button circle>O</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-circle');

        rerender(<Button square>□</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-square');
    });

    it('accepts custom className', () => {
        render(<Button className="custom-class">Custom</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('btn');
        expect(button).toHaveClass('custom-class');
    });

    it('handles click events', async () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        const button = screen.getByRole('button');
        button.click();

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
        const handleClick = vi.fn();
        render(
            <Button disabled onClick={handleClick}>
                Disabled
            </Button>,
        );

        const button = screen.getByRole('button');
        button.click();

        expect(handleClick).not.toHaveBeenCalled();
    });

    it('defaults to button type', () => {
        render(<Button>Default Type</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('accepts submit type', () => {
        render(<Button type="submit">Submit</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('forwards all HTML button attributes', () => {
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
