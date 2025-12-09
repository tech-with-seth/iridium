import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
    test('renders body content', () => {
        render(<Card>Test Content</Card>);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('renders title heading when provided', () => {
        render(<Card title="Test Title">Content</Card>);
        const heading = screen.getByRole('heading', { name: 'Test Title' });
        expect(heading.tagName).toBe('H2');
    });

    test('renders actions region only when provided', () => {
        const { rerender } = render(<Card>Content</Card>);
        expect(
            screen.queryByRole('button', { name: 'Action Button' }),
        ).toBeNull();

        rerender(
            <Card actions={<button type="button">Action Button</button>}>
                Content
            </Card>,
        );

        expect(
            screen.getByRole('button', { name: 'Action Button' }),
        ).toBeInTheDocument();
    });

    test('places image before content when position is top', () => {
        const { container } = render(
            <Card
                image={{
                    src: '/top-image.jpg',
                    alt: 'Top Image',
                    position: 'top',
                }}
            >
                Body content
            </Card>,
        );

        const wrapper = container.firstElementChild;
        const [figure, body] = Array.from(wrapper?.children ?? []);
        expect(screen.getByAltText('Top Image')).toBeInTheDocument();
        expect(figure?.tagName).toBe('FIGURE');
        expect(body?.className).toContain('card-body');
    });

    test('places image after content when position is bottom', () => {
        const { container } = render(
            <Card
                image={{
                    src: '/bottom-image.jpg',
                    alt: 'Bottom Image',
                    position: 'bottom',
                }}
            >
                Body content
            </Card>,
        );

        const wrapper = container.firstElementChild;
        const children = Array.from(wrapper?.children ?? []);
        const lastChild = children.at(-1);

        expect(screen.getByAltText('Bottom Image')).toBeInTheDocument();
        expect(lastChild?.tagName).toBe('FIGURE');
    });

    test('supports custom class names for outer container', () => {
        const { container } = render(
            <Card className="custom-card">Content</Card>,
        );
        expect(container.firstChild).toHaveClass('custom-card');
    });
});
