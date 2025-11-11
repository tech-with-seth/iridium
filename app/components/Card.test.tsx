import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
    test('renders children', () => {
        render(<Card>Test Content</Card>);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('renders with title', () => {
        render(<Card title="Test Title">Content</Card>);
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Title').tagName).toBe('H2');
    });

    test('renders with actions', () => {
        render(
            <Card actions={<button>Action Button</button>}>Content</Card>,
        );
        expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    test('renders with image at top', () => {
        render(
            <Card
                image={{
                    src: '/test-image.jpg',
                    alt: 'Test Image',
                    position: 'top',
                }}
            >
                Content
            </Card>,
        );
        const image = screen.getByAltText('Test Image');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/test-image.jpg');
    });

    test('renders with image at bottom', () => {
        render(
            <Card
                image={{
                    src: '/test-image.jpg',
                    alt: 'Test Image',
                    position: 'bottom',
                }}
            >
                Content
            </Card>,
        );
        const image = screen.getByAltText('Test Image');
        expect(image).toBeInTheDocument();
    });

    test('applies size variant classes', () => {
        const { container } = render(<Card size="lg">Content</Card>);
        expect(container.firstChild).toHaveClass('card-lg');
    });

    test('applies border variant', () => {
        const { container } = render(<Card variant="border">Content</Card>);
        expect(container.firstChild).toHaveClass('card-border');
    });

    test('applies side layout', () => {
        const { container } = render(<Card side>Content</Card>);
        expect(container.firstChild).toHaveClass('card-side');
    });

    test('applies custom className', () => {
        const { container } = render(
            <Card className="custom-class">Content</Card>,
        );
        expect(container.firstChild).toHaveClass('custom-class');
    });

    test('renders complete card with all props', () => {
        render(
            <Card
                title="Complete Card"
                actions={<button>Action</button>}
                image={{ src: '/img.jpg', alt: 'Image' }}
                size="md"
                variant="border"
            >
                Card body content
            </Card>,
        );

        expect(screen.getByText('Complete Card')).toBeInTheDocument();
        expect(screen.getByText('Card body content')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByAltText('Image')).toBeInTheDocument();
    });
});
