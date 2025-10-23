import type { JSX } from 'react';

interface ConditionalWrapperProps {
    condition: boolean;
    wrapper: (children: React.ReactNode) => JSX.Element;
    children?: React.ReactNode;
}

// Example usage:
// <ConditionalWrapper
//     condition={isOn}
//     wrapper={(children) => (
//         <div className="box">
//             <h2 className="title is-2">{children}!!!</h2>
//         </div>
//     )}
// >
//     Banana 🍌
// </ConditionalWrapper>

export function ConditionalWrapper({
    condition,
    wrapper,
    children,
}: ConditionalWrapperProps) {
    return condition ? wrapper(children) : children;
}
