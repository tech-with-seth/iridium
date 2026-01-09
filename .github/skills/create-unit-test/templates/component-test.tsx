/**
 * Template: Component Unit Test
 *
 * Replace placeholders:
 * - ComponentName → Your component name
 * - component-name → Your component file name
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '~/test/utils';
import { ComponentName } from './component-name';

describe('ComponentName', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ============================================
    // Rendering Tests
    // ============================================

    it('renders with default props', () => {
        render(<ComponentName>Content</ComponentName>);

        expect(screen.getByText(/content/i)).toBeInTheDocument();
    });

    it('renders with custom className', () => {
        render(<ComponentName className="custom-class">Content</ComponentName>);

        const element = screen.getByText(/content/i);
        expect(element).toHaveClass('custom-class');
    });

    // ============================================
    // Variant Tests (for CVA components)
    // ============================================

    it('applies primary variant styles', () => {
        render(<ComponentName variant="primary">Primary</ComponentName>);

        const element = screen.getByText(/primary/i);
        // Test for DaisyUI class or visual indicator
        expect(element).toHaveClass('btn-primary');
    });

    it('applies different sizes', () => {
        render(<ComponentName size="lg">Large</ComponentName>);

        const element = screen.getByText(/large/i);
        expect(element).toHaveClass('btn-lg');
    });

    // ============================================
    // Interaction Tests
    // ============================================

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<ComponentName onClick={handleClick}>Click me</ComponentName>);

        screen.getByRole('button', { name: /click me/i }).click();

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not fire click when disabled', () => {
        const handleClick = vi.fn();
        render(
            <ComponentName onClick={handleClick} disabled>
                Disabled
            </ComponentName>,
        );

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();

        // Clicking disabled button should not fire handler
        button.click();
        expect(handleClick).not.toHaveBeenCalled();
    });

    // ============================================
    // State Tests
    // ============================================

    it('shows loading state', () => {
        render(<ComponentName loading>Loading</ComponentName>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        // Check for loading indicator (adjust selector as needed)
        expect(button.querySelector('.loading')).toBeInTheDocument();
    });

    // ============================================
    // Accessibility Tests
    // ============================================

    it('has accessible name from children', () => {
        render(<ComponentName>Accessible Button</ComponentName>);

        expect(
            screen.getByRole('button', { name: /accessible button/i }),
        ).toBeInTheDocument();
    });

    it('supports aria-label override', () => {
        render(<ComponentName aria-label="Custom label">Icon</ComponentName>);

        expect(
            screen.getByRole('button', { name: /custom label/i }),
        ).toBeInTheDocument();
    });
});
