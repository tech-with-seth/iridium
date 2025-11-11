import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal, ModalActions } from './Modal';

describe('Modal', () => {
    test('renders children when open', () => {
        render(
            <Modal open={true} onClose={() => {}}>
                Modal Content
            </Modal>,
        );
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    test('renders with title', () => {
        render(
            <Modal open={true} title="Test Modal" onClose={() => {}}>
                Content
            </Modal>,
        );
        expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    test('calls onClose when close button clicked', async () => {
        const handleClose = vi.fn();
        const user = userEvent.setup();

        render(
            <Modal open={true} title="Test" onClose={handleClose}>
                Content
            </Modal>,
        );

        const closeButton = screen.getByLabelText('Close modal');
        await user.click(closeButton);

        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    test('hides close button when showCloseButton is false', () => {
        render(
            <Modal open={true} showCloseButton={false} onClose={() => {}}>
                Content
            </Modal>,
        );

        expect(
            screen.queryByLabelText('Close modal'),
        ).not.toBeInTheDocument();
    });

    test('renders close button in header when title present', () => {
        render(
            <Modal open={true} title="Test Title" onClose={() => {}}>
                Content
            </Modal>,
        );

        const title = screen.getByText('Test Title');
        const closeButton = screen.getByLabelText('Close modal');

        // Close button should be in the same container as title
        expect(title.parentElement).toContainElement(closeButton);
    });

    test('renders absolute positioned close button when no title', () => {
        const { container } = render(
            <Modal open={true} onClose={() => {}}>
                Content
            </Modal>,
        );

        const closeButton = screen.getByLabelText('Close modal');
        expect(closeButton).toHaveClass('absolute');
    });

    test('applies placement variant classes', () => {
        const { container } = render(
            <Modal open={true} placement="top" onClose={() => {}}>
                Content
            </Modal>,
        );

        const dialog = container.querySelector('dialog');
        expect(dialog).toHaveClass('modal-top');
    });

    test('applies open class when open prop is true', () => {
        const { container } = render(
            <Modal open={true} onClose={() => {}}>
                Content
            </Modal>,
        );

        const dialog = container.querySelector('dialog');
        expect(dialog).toHaveClass('modal-open');
    });

    test('applies custom className', () => {
        const { container } = render(
            <Modal
                open={true}
                className="custom-modal"
                onClose={() => {}}
            >
                Content
            </Modal>,
        );

        const dialog = container.querySelector('dialog');
        expect(dialog).toHaveClass('custom-modal');
    });
});

describe('ModalActions', () => {
    test('renders children', () => {
        render(
            <ModalActions>
                <button>Action 1</button>
                <button>Action 2</button>
            </ModalActions>,
        );

        expect(screen.getByText('Action 1')).toBeInTheDocument();
        expect(screen.getByText('Action 2')).toBeInTheDocument();
    });

    test('applies modal-action class', () => {
        const { container } = render(
            <ModalActions>
                <button>Action</button>
            </ModalActions>,
        );

        expect(container.firstChild).toHaveClass('modal-action');
    });

    test('applies custom className', () => {
        const { container } = render(
            <ModalActions className="custom-actions">
                <button>Action</button>
            </ModalActions>,
        );

        expect(container.firstChild).toHaveClass('custom-actions');
    });
});
