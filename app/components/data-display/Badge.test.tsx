import { describe, it, expect } from 'vitest';
import { render, screen } from '~/test/utils';
import { Badge } from './Badge';

describe('Badge', () => {
    it('renders provided content', () => {
        render(<Badge>New</Badge>);
        expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('applies variant props that alter semantics', () => {
        const { rerender } = render(
            <Badge variant="outline" color="success">
                Status
            </Badge>,
        );

        const badge = screen.getByText('Status');
        expect(badge).toHaveClass('badge-outline');
        expect(badge).toHaveClass('badge-success');

        rerender(
            <Badge size="lg" className="custom-badge">
                Large
            </Badge>,
        );

        const large = screen.getByText('Large');
        expect(large).toHaveClass('badge-lg');
        expect(large).toHaveClass('custom-badge');
    });
});
