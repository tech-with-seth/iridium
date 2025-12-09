import { describe, it, expect } from 'vitest';
import { render, screen } from '~/test/utils';
import { Avatar, AvatarGroup } from './Avatar';

describe('Avatar', () => {
    it('renders an image when src provided', () => {
        render(<Avatar src="/photo.png" alt="User" />);
        const image = screen.getByRole('img', { name: 'User' });
        expect(image).toHaveAttribute('src', '/photo.png');
    });

    it('falls back to children when src missing', () => {
        render(<Avatar>AB</Avatar>);
        expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('applies size and shape classes', () => {
        const { container } = render(
            <Avatar size={10} shape="squircle">
                SQ
            </Avatar>,
        );

        const inner = container.querySelector('.mask');
        expect(inner).toHaveClass('mask-squircle');
        expect(inner).toHaveClass('w-10');
    });

    it('applies status and placeholder variants', () => {
        const { container } = render(
            <Avatar status="online" placeholder>
                <span>?</span>
            </Avatar>,
        );

        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper).toHaveClass('avatar-online');
        expect(wrapper).toHaveClass('avatar-placeholder');
    });
});

describe('AvatarGroup', () => {
    it('renders provided avatars', () => {
        render(
            <AvatarGroup>
                <Avatar>A</Avatar>
                <Avatar>B</Avatar>
            </AvatarGroup>,
        );

        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();
    });
});
