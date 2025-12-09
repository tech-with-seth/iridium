import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput } from './TextInput';

describe('TextInput', () => {
    test('renders input field', () => {
        render(<TextInput placeholder="Enter text" />);
        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    test('renders with label', () => {
        render(<TextInput label="Username" />);
        expect(screen.getByText('Username')).toBeInTheDocument();
    });

    test('renders required indicator when required', () => {
        render(<TextInput label="Email" required />);
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('renders helper text', () => {
        render(
            <TextInput
                label="Password"
                helperText="Must be at least 8 characters"
            />,
        );
        expect(
            screen.getByText('Must be at least 8 characters'),
        ).toBeInTheDocument();
    });

    test('renders error message', () => {
        render(<TextInput label="Email" error="Invalid email address" />);
        const errorMsg = screen.getByText('Invalid email address');
        expect(errorMsg).toBeInTheDocument();
        expect(errorMsg).toHaveClass('text-error');
    });

    test('applies error color when error present', () => {
        const { container } = render(
            <TextInput label="Email" color="success" error="Invalid email" />,
        );
        const input = container.querySelector('input');
        expect(input).toHaveClass('input-error');
        expect(input).not.toHaveClass('input-success');
    });

    test('prioritizes error over helper text', () => {
        render(
            <TextInput
                label="Email"
                error="Invalid email"
                helperText="Enter your email"
            />,
        );
        expect(screen.getByText('Invalid email')).toBeInTheDocument();
        expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
    });

    test('handles disabled state', () => {
        render(<TextInput label="Name" disabled />);
        const input = screen.getByLabelText('Name');
        expect(input).toBeDisabled();
    });

    test('accepts and displays user input', async () => {
        const user = userEvent.setup();
        render(<TextInput label="Name" />);

        const input = screen.getByLabelText('Name');
        await user.type(input, 'John Doe');

        expect(input).toHaveValue('John Doe');
    });

    test('supports different input types', () => {
        render(<TextInput type="email" placeholder="Email" />);
        const input = screen.getByPlaceholderText('Email');
        expect(input).toHaveAttribute('type', 'email');
    });

    test('supports value and onChange props', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();

        const { rerender } = render(
            <TextInput value="" onChange={handleChange} />,
        );

        const input = screen.getByRole('textbox');
        await user.type(input, 'test');

        expect(handleChange).toHaveBeenCalled();
    });

    test('supports name attribute for forms', () => {
        render(<TextInput name="username" />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('name', 'username');
    });

    test('renders complete input with all features', () => {
        render(
            <TextInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                helperText="We'll never share your email"
                required
                size="lg"
                color="primary"
            />,
        );

        expect(screen.getByText('Email Address')).toBeInTheDocument();
        expect(screen.getByText('*')).toBeInTheDocument();
        expect(
            screen.getByText("We'll never share your email"),
        ).toBeInTheDocument();

        const input = screen.getByPlaceholderText('you@example.com');
        expect(input).toHaveAttribute('type', 'email');
        expect(input).toHaveAttribute('name', 'email');
        expect(input).toHaveAttribute('required');
        expect(input).toHaveClass('input-lg', 'input-primary');
    });
});
