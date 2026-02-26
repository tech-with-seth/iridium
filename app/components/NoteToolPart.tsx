import {
    CheckIcon,
    FileTextIcon,
    ListIcon,
    LoaderCircleIcon,
    SearchIcon,
} from 'lucide-react';

interface NoteToolPartProps {
    toolName: string;
    state: string;
    output?: Record<string, unknown>;
}

const LABELS: Record<string, string> = {
    create_note: 'Creating note',
    list_notes: 'Listing notes',
    search_notes: 'Searching notes',
};

const ICONS: Record<string, typeof FileTextIcon> = {
    create_note: FileTextIcon,
    list_notes: ListIcon,
    search_notes: SearchIcon,
};

interface NoteOutput {
    id: string;
    title: string;
    content: string;
}

export function NoteToolPart({ toolName, state, output }: NoteToolPartProps) {
    const isLoading =
        state === 'input-available' || state === 'input-streaming';
    const isDone = state === 'output-available';
    const Icon = ICONS[toolName] ?? FileTextIcon;
    const label = LABELS[toolName] ?? toolName;

    return (
        <div className="rounded-box border-base-300 bg-base-200 mt-2 border p-3 text-sm">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="font-medium">{label}</span>
                {isLoading && (
                    <LoaderCircleIcon
                        className="h-3 w-3 animate-spin"
                        aria-hidden="true"
                    />
                )}
                {isDone && (
                    <CheckIcon
                        className="text-success h-3 w-3"
                        aria-hidden="true"
                    />
                )}
            </div>

            {isDone && toolName === 'create_note' && output && (
                <p className="mt-1 text-xs opacity-80">
                    Saved: {String(output.title)}
                </p>
            )}

            {isDone &&
                (toolName === 'list_notes' || toolName === 'search_notes') &&
                output && (
                    <ul className="mt-1 space-y-1">
                        {(
                            (output.notes as NoteOutput[] | undefined) ?? []
                        ).map((note) => (
                            <li key={note.id} className="text-xs opacity-80">
                                <strong>{note.title}</strong> &mdash;{' '}
                                {note.content.slice(0, 80)}
                            </li>
                        ))}
                    </ul>
                )}
        </div>
    );
}
