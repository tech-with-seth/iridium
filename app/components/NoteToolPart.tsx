import { FileTextIcon, ListIcon, SearchIcon } from 'lucide-react';
import { isToolDone, ToolPartShell } from '~/components/ToolPartShell';

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
    const isDone = isToolDone(state);
    const Icon = ICONS[toolName] ?? FileTextIcon;
    const label = LABELS[toolName] ?? toolName;

    return (
        <ToolPartShell icon={Icon} label={label} state={state}>
            {isDone && toolName === 'create_note' && output && (
                <p className="mt-1 text-xs opacity-80">
                    Saved: {String(output.title)}
                </p>
            )}

            {isDone &&
                (toolName === 'list_notes' || toolName === 'search_notes') &&
                output && (
                    <ul className="mt-1 space-y-1">
                        {((output.notes as NoteOutput[] | undefined) ?? []).map(
                            (note) => (
                                <li
                                    key={note.id}
                                    className="text-xs opacity-80"
                                >
                                    <strong>{note.title}</strong> &mdash;{' '}
                                    {note.content.slice(0, 80)}
                                </li>
                            ),
                        )}
                    </ul>
                )}
        </ToolPartShell>
    );
}
