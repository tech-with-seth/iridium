import { describe, it, expect } from 'vitest';
import { render, screen, within } from '~/test/utils';
import { Accordion, AccordionItem } from './Accordion';

describe('Accordion', () => {
    it('wraps children in a container while forwarding className', () => {
        const { container } = render(
            <Accordion name="faq" className="custom-accordion">
                <div>Child</div>
            </Accordion>,
        );

        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper).toHaveClass('custom-accordion');
        expect(wrapper).toHaveTextContent('Child');
    });

    it('renders items with shared radio name', () => {
        const { container } = render(
            <Accordion name="faq">
                <AccordionItem name="faq" title="Question 1">
                    Answer 1
                </AccordionItem>
                <AccordionItem name="faq" title="Question 2">
                    Answer 2
                </AccordionItem>
            </Accordion>,
        );

        const radios = container.querySelectorAll('input[type="radio"]');
        expect(radios).toHaveLength(2);
        radios.forEach((radio) => {
            expect(radio).toHaveAttribute('name', 'faq');
        });
    });
});

describe('AccordionItem', () => {
    it('renders title and content', () => {
        render(
            <AccordionItem name="faq" title="Question">
                Answer
            </AccordionItem>,
        );

        expect(screen.getByText('Question')).toBeInTheDocument();
        expect(screen.getByText('Answer')).toBeInTheDocument();
    });

    it('marks the item open when defaultOpen is true', () => {
        const { container } = render(
            <AccordionItem name="faq" title="Open" defaultOpen>
                Content
            </AccordionItem>,
        );

        const radio = container.querySelector('input[type="radio"]');
        expect(radio).toBeDefined();
        expect(radio).toHaveProperty('checked', true);
    });

    it('applies variant state classes to support daisyUI behavior', () => {
        const { container } = render(
            <AccordionItem name="faq" title="Styled" variant="arrow" state="open">
                Content
            </AccordionItem>,
        );

        const item = container.firstElementChild as HTMLElement;
        expect(item).toHaveClass('collapse-arrow');
        expect(item).toHaveClass('collapse-open');
    });
});
