import {
    CheckCircle2Icon,
    InfoIcon,
    ListOrderedIcon,
    LoaderCircleIcon,
    ScaleIcon,
    XCircleIcon,
} from 'lucide-react';
import type { CardData } from '~/voltagent/tools/cards';

interface CardToolPartProps {
    state: string;
    output?: CardData;
}

export function CardToolPart({ state, output }: CardToolPartProps) {
    const isLoading =
        state === 'input-available' || state === 'input-streaming';

    if (isLoading) {
        return (
            <div className="rounded-box border-base-300 bg-base-200 mt-2 flex items-center gap-2 border p-3 text-sm">
                <LoaderCircleIcon
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                />
                <span className="font-medium">Generating card...</span>
            </div>
        );
    }

    if (!output) return null;

    switch (output.variant) {
        case 'info':
            return (
                <InfoCard
                    title={output.title}
                    description={output.description}
                    items={output.items}
                />
            );
        case 'steps':
            return <StepsCard title={output.title} steps={output.steps} />;
        case 'pros_cons':
            return (
                <ProsConsCard
                    title={output.title}
                    pros={output.pros}
                    cons={output.cons}
                />
            );
    }
}

function InfoCard({
    title,
    description,
    items,
}: {
    title: string;
    description: string;
    items?: string[];
}) {
    return (
        <div className="rounded-box border-info/30 bg-info/10 mt-2 border p-4">
            <div className="flex items-center gap-2">
                <InfoIcon
                    className="text-info h-5 w-5 shrink-0"
                    aria-hidden="true"
                />
                <h3 className="font-bold">{title}</h3>
            </div>
            <p className="mt-2 text-sm">{description}</p>
            {items && items.length > 0 && (
                <ul className="mt-2 space-y-1">
                    {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                            <span
                                className="text-info mt-0.5"
                                aria-hidden="true"
                            >
                                &bull;
                            </span>
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function StepsCard({ title, steps }: { title: string; steps: string[] }) {
    return (
        <div className="rounded-box border-primary/30 bg-primary/10 mt-2 border p-4">
            <div className="flex items-center gap-2">
                <ListOrderedIcon
                    className="text-primary h-5 w-5 shrink-0"
                    aria-hidden="true"
                />
                <h3 className="font-bold">{title}</h3>
            </div>
            <ol className="mt-3 space-y-2">
                {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="bg-primary text-primary-content flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                            {i + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
}

function ProsConsCard({
    title,
    pros,
    cons,
}: {
    title: string;
    pros: string[];
    cons: string[];
}) {
    return (
        <div className="rounded-box border-base-300 bg-base-200 mt-2 border p-4">
            <div className="flex items-center gap-2">
                <ScaleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="font-bold">{title}</h3>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <h4 className="text-success mb-1 text-sm font-semibold">
                        Pros
                    </h4>
                    <ul className="space-y-1">
                        {pros.map((pro, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-2 text-sm"
                            >
                                <CheckCircle2Icon
                                    className="text-success mt-0.5 h-4 w-4 shrink-0"
                                    aria-hidden="true"
                                />
                                {pro}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-error mb-1 text-sm font-semibold">
                        Cons
                    </h4>
                    <ul className="space-y-1">
                        {cons.map((con, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-2 text-sm"
                            >
                                <XCircleIcon
                                    className="text-error mt-0.5 h-4 w-4 shrink-0"
                                    aria-hidden="true"
                                />
                                {con}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
