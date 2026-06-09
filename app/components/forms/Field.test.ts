import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Field, type FieldControlProps } from './Field';

function renderField({
    error,
    children,
}: {
    error?: string;
    children:
        | React.ReactNode
        | ((controlProps: FieldControlProps) => React.ReactNode);
}) {
    return renderToStaticMarkup(
        createElement(Field, {
            label: 'Email',
            name: 'email',
            error,
            children,
        }),
    );
}

describe('Field', () => {
    it('renders the label inside a fieldset legend', () => {
        const html = renderField({ children: 'control' });

        expect(html).toContain('fieldset-legend');
        expect(html).toContain('Email');
    });

    it('renders no error element when there is no error', () => {
        const html = renderField({ children: 'control' });

        expect(html).not.toContain('email-error');
    });

    it('renders the error with the derived id', () => {
        const html = renderField({ error: 'Required', children: 'control' });

        expect(html).toContain('id="email-error"');
        expect(html).toContain('Required');
    });

    it('passes aria wiring to render-prop children when there is an error', () => {
        const html = renderField({
            error: 'Required',
            children: (controlProps: FieldControlProps) =>
                createElement('input', controlProps),
        });

        expect(html).toContain('aria-describedby="email-error"');
        expect(html).toContain('aria-invalid="true"');
    });

    it('passes empty aria wiring when there is no error', () => {
        const html = renderField({
            children: (controlProps: FieldControlProps) =>
                createElement('input', controlProps),
        });

        expect(html).not.toContain('aria-describedby');
        expect(html).not.toContain('aria-invalid');
    });
});
