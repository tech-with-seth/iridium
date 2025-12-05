import type { PropsWithChildren } from 'react';
import { cva, cx } from '~/cva.config';
import { Button } from './Button';
import { XIcon } from 'lucide-react';

export const drawerVariants = cva({
    base: 'drawer',
    variants: {
        side: {
            left: 'drawer-start',
            right: 'drawer-end',
        },
        size: {
            sm: 'w-64',
            md: 'w-80',
            lg: 'w-96',
            xl: 'w-128',
        },
    },
    defaultVariants: {
        side: 'right',
    },
});

export const drawerMenuVariants = cva({
    base: 'menu bg-base-100 text-base-content min-h-full p-4',
    variants: {
        size: {
            sm: 'w-80',
            md: 'w-80 md:w-96',
            lg: 'w-80 md:w-128',
            xl: 'w-80 md:w-160',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

interface DrawerProps {
    contents: React.ReactNode;
    handleClose: () => void;
    id: string;
    isOpen: boolean;
    side?: 'left' | 'right';
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Drawer({
    children,
    contents,
    handleClose,
    id,
    isOpen,
    side,
    size,
}: PropsWithChildren<DrawerProps>) {
    return (
        <div className={cx(drawerVariants({ side }))}>
            <input
                id={id}
                type="checkbox"
                className="drawer-toggle"
                checked={isOpen}
                readOnly
            />
            <div className="drawer-content flex min-h-0 flex-1 flex-col">
                {children}
            </div>
            <div className="drawer-side">
                <label
                    htmlFor={id}
                    aria-label="close sidebar"
                    className="drawer-overlay"
                    onClick={handleClose}
                ></label>
                <div className={cx(drawerMenuVariants({ size }))}>
                    <Button
                        circle
                        onClick={handleClose}
                        className="self-end mb-8"
                    >
                        <XIcon />
                    </Button>
                    <div>{contents}</div>
                </div>
            </div>
        </div>
    );
}
