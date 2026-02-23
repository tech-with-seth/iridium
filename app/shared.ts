import { cx } from 'cva.config';
import type { NavLinkRenderProps } from 'react-router';

export const listItemClassName = `bg-base-100 flex gap-2 py-3 px-4 rounded-box`;

export const navLinkClassName = ({ isActive }: NavLinkRenderProps) =>
    cx(listItemClassName, isActive && 'bg-primary/20');
