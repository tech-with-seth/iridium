import type { PropsWithChildren } from 'react';
import { cva, cx } from '~/cva.config';
import { Button } from './Button';
import { XIcon } from 'lucide-react';

export const drawerVariants = cva({
    base: 'drawer',
    variants: {
        side: {
            left: 'drawer-start',
            right: 'drawer-end'
        },
        size: {
            sm: 'w-64',
            md: 'w-80',
            lg: 'w-96',
            xl: 'w-128'
        }
    },
    defaultVariants: {
        side: 'right'
    },
    compoundVariants: []
});

interface DrawerProps {
    id: string;
    isOpen: boolean;
    handleClose: () => void;
    side?: 'left' | 'right';
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Drawer({
    children,
    handleClose,
    id,
    isOpen,
    side,
    size
}: PropsWithChildren<DrawerProps>) {
    return (
        <div className={cx(drawerVariants({ side, size }))}>
            <input
                id={id}
                type="checkbox"
                className="drawer-toggle"
                checked={isOpen}
            />
            <div className="drawer-content">{children}</div>
            <div className="drawer-side">
                <label
                    htmlFor={id}
                    aria-label="close sidebar"
                    className="drawer-overlay"
                    onClick={handleClose}
                ></label>
                <div className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
                    <Button circle onClick={handleClose} className="self-end mb-8">
                        <XIcon />
                    </Button>
                    <ul>
                        <li>
                            <a>Sidebar Item 1</a>
                        </li>
                        <li>
                            <a>Sidebar Item 2</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
