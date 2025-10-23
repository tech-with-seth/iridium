import { useReducer } from 'react';

export function useDrawer(): [
    boolean,
    { openDrawer: () => void; closeDrawer: () => void },
] {
    const [isOpen, dispatch] = useReducer((state, action) => {
        if (action.type === 'OPEN') {
            return true;
        }

        if (action.type === 'CLOSE') {
            return false;
        }

        if (action.type === 'TOGGLE') {
            return !state;
        }

        return state;
    }, false);

    const closeDrawer = () => dispatch({ type: 'CLOSE' });
    const openDrawer = () => dispatch({ type: 'OPEN' });

    return [isOpen, { openDrawer, closeDrawer }];
}
