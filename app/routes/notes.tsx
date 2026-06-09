import { useEffect, useRef, useState } from 'react';
import {
    data,
    Form,
    useNavigation,
    useSearchParams,
    useSubmit,
} from 'react-router';
import {
    NotebookPenIcon,
    PlusCircleIcon,
    SearchIcon,
    SearchXIcon,
} from 'lucide-react';
import { z } from 'zod';
import { rateLimit } from '~/lib/rate-limit.server';
import { pageMeta, parsePage } from '~/lib/pagination';
import { redirectWithToast } from '~/lib/toast.server';
import { requireUserFromContext } from '~/context';
import { authMiddleware } from '~/middleware/auth';
import {
    countNotesByUserId,
    createNote,
    deleteNote,
    getNoteById,
    searchNotes,
    updateNote,
} from '~/models/note.server';
import { Card } from '~/components/Card';
import { Container } from '~/components/Container';
import { EmptyState } from '~/components/EmptyState';
import { Pagination } from '~/components/Pagination';
import { Field } from '~/components/forms/Field';
import { Input } from '~/components/forms/Input';
import { Textarea } from '~/components/forms/Textarea';
import type { Route } from './+types/notes';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

const PAGE_SIZE = 12;

type FieldErrors = Partial<Record<'title' | 'content', string[]>>;

const noteSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, { message: 'Title is required' })
        .max(200, { message: 'Title must be 200 characters or fewer' }),
    content: z
        .string()
        .trim()
        .min(1, { message: 'Content is required' })
        .max(10_000, {
            message: 'Content must be 10,000 characters or fewer',
        }),
});

export async function loader({ request, context }: Route.LoaderArgs) {
    const user = requireUserFromContext(context);
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.trim() ?? '';
    const { page, pageSize, skip, take } = parsePage(url.searchParams, {
        defaultPageSize: PAGE_SIZE,
    });

    const [notes, totalCount] = await Promise.all([
        searchNotes({ userId: user.id, query, skip, take }),
        countNotesByUserId(user.id, query || undefined),
    ]);

    return {
        notes,
        query,
        page,
        ...pageMeta(totalCount, page, pageSize),
        totalCount,
    };
}

export async function action({ request, context }: Route.ActionArgs) {
    const user = requireUserFromContext(context);
    const form = await request.formData();
    const intent = String(form.get('intent'));

    if (intent === 'create-note' || intent === 'update-note') {
        const { success } = rateLimit({
            key: `note-write:${user.id}`,
            maxRequests: 30,
            windowMs: 60_000,
        });

        if (!success) {
            throw new Response('Too many requests. Please wait a moment.', {
                status: 429,
            });
        }

        const parsed = noteSchema.safeParse(Object.fromEntries(form));

        if (!parsed.success) {
            return data(
                {
                    intent,
                    noteId: String(form.get('noteId') ?? '') || null,
                    errors: z.flattenError(parsed.error)
                        .fieldErrors as FieldErrors,
                },
                { status: 400 },
            );
        }

        if (intent === 'create-note') {
            await createNote({ ...parsed.data, userId: user.id });

            return redirectWithToast('/notes', {
                type: 'success',
                message: 'Note created.',
            });
        }

        const noteId = String(form.get('noteId'));
        const note = await getNoteById(noteId);

        if (!note) throw new Response('Note not found', { status: 404 });
        if (note.userId !== user.id) {
            throw new Response('Forbidden', { status: 403 });
        }

        await updateNote({ noteId, ...parsed.data });

        return redirectWithToast('/notes', {
            type: 'success',
            message: 'Note updated.',
        });
    }

    if (intent === 'delete-note') {
        const noteId = String(form.get('noteId'));
        const note = await getNoteById(noteId);

        if (!note) throw new Response('Note not found', { status: 404 });
        if (note.userId !== user.id) {
            throw new Response('Forbidden', { status: 403 });
        }

        await deleteNote(noteId);

        return redirectWithToast('/notes', {
            type: 'success',
            message: 'Note deleted.',
        });
    }

    throw new Response('Unknown intent', { status: 400 });
}

type EditorState =
    | { mode: 'create' }
    | { mode: 'edit'; note: { id: string; title: string; content: string } };

export default function NotesRoute({
    loaderData,
    actionData,
}: Route.ComponentProps) {
    const { notes, query, page, totalPages, totalCount } = loaderData;
    const navigation = useNavigation();
    const submit = useSubmit();
    const [searchParams] = useSearchParams();

    const editorRef = useRef<HTMLDialogElement>(null);
    const deleteRef = useRef<HTMLDialogElement>(null);
    const [editor, setEditor] = useState<EditorState>({ mode: 'create' });
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const pendingIntent =
        navigation.state !== 'idle'
            ? String(navigation.formData?.get('intent'))
            : null;

    // ?new=1 (e.g. the dashboard quick action) opens the create dialog.
    const openOnLoad = searchParams.get('new') === '1';
    useEffect(() => {
        if (openOnLoad) editorRef.current?.showModal();
    }, [openOnLoad]);

    // Server-side validation errors reopen the editor with messages shown.
    const editorErrors =
        actionData?.intent === 'create-note' ||
        actionData?.intent === 'update-note'
            ? actionData.errors
            : null;
    useEffect(() => {
        if (editorErrors) editorRef.current?.showModal();
    }, [editorErrors]);

    function openCreate() {
        setEditor({ mode: 'create' });
        editorRef.current?.showModal();
    }

    function openEdit(note: { id: string; title: string; content: string }) {
        setEditor({ mode: 'edit', note });
        editorRef.current?.showModal();
    }

    function openDelete(noteId: string) {
        setPendingDeleteId(noteId);
        deleteRef.current?.showModal();
    }

    const isSearching = query.length > 0;

    return (
        <>
            <title>Notes | Iridium</title>
            <meta
                name="description"
                content="Browse, search, and manage your notes."
            />
            <Container className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-bold">Notes</h1>
                    <button
                        type="button"
                        className="btn btn-accent"
                        onClick={openCreate}
                    >
                        <PlusCircleIcon
                            aria-hidden="true"
                            className="mr-2 h-6 w-6"
                        />
                        New Note
                    </button>
                </div>

                <Form method="GET" role="search" className="join max-w-md">
                    <label className="input join-item flex grow items-center gap-2">
                        <SearchIcon
                            aria-hidden="true"
                            className="h-4 w-4 opacity-60"
                        />
                        <input
                            type="search"
                            name="q"
                            placeholder="Search notes"
                            defaultValue={query}
                            aria-label="Search notes"
                        />
                    </label>
                    <button type="submit" className="btn join-item">
                        Search
                    </button>
                </Form>

                {notes.length === 0 ? (
                    isSearching ? (
                        <EmptyState
                            icon={SearchXIcon}
                            title="No notes match your search"
                            description={`Nothing found for "${query}".`}
                        >
                            <Form method="GET">
                                <button type="submit" className="btn btn-sm">
                                    Clear search
                                </button>
                            </Form>
                        </EmptyState>
                    ) : (
                        <EmptyState
                            icon={NotebookPenIcon}
                            title="No notes yet"
                            description="Create your first note, or ask the chat agent to save one for you."
                        >
                            <button
                                type="button"
                                className="btn btn-accent btn-sm"
                                onClick={openCreate}
                            >
                                New Note
                            </button>
                        </EmptyState>
                    )
                ) : (
                    <>
                        <p className="text-base-content/60 text-sm">
                            {totalCount} note{totalCount === 1 ? '' : 's'}
                            {isSearching ? ` matching "${query}"` : ''}
                        </p>
                        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {notes.map((note) => (
                                <li key={note.id}>
                                    <Card title={note.title} bordered>
                                        <p className="line-clamp-3 whitespace-pre-wrap">
                                            {note.content}
                                        </p>
                                        <p className="text-base-content/50 text-xs">
                                            Updated{' '}
                                            {new Date(
                                                note.updatedAt,
                                            ).toLocaleDateString()}
                                        </p>
                                        <div className="card-actions justify-end">
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm"
                                                onClick={() =>
                                                    openEdit({
                                                        id: note.id,
                                                        title: note.title,
                                                        content: note.content,
                                                    })
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm text-error"
                                                onClick={() =>
                                                    openDelete(note.id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </Card>
                                </li>
                            ))}
                        </ul>
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            className="self-center"
                        />
                    </>
                )}
            </Container>

            <dialog ref={editorRef} className="modal">
                <div className="modal-box">
                    <h3 className="text-lg font-bold">
                        {editor.mode === 'edit' ? 'Edit note' : 'New note'}
                    </h3>
                    <Form
                        method="POST"
                        className="space-y-4 pt-4"
                        onSubmit={() => editorRef.current?.close()}
                    >
                        <input
                            type="hidden"
                            name="intent"
                            value={
                                editor.mode === 'edit'
                                    ? 'update-note'
                                    : 'create-note'
                            }
                        />
                        {editor.mode === 'edit' && (
                            <input
                                type="hidden"
                                name="noteId"
                                value={editor.note.id}
                            />
                        )}
                        <Field
                            label="Title"
                            name="title"
                            error={editorErrors?.title?.[0]}
                        >
                            {(controlProps) => (
                                <Input
                                    key={
                                        editor.mode === 'edit'
                                            ? editor.note.id
                                            : 'create'
                                    }
                                    type="text"
                                    name="title"
                                    defaultValue={
                                        editor.mode === 'edit'
                                            ? editor.note.title
                                            : ''
                                    }
                                    placeholder="Note title"
                                    className="w-full"
                                    {...controlProps}
                                />
                            )}
                        </Field>
                        <Field
                            label="Content"
                            name="content"
                            error={editorErrors?.content?.[0]}
                        >
                            {(controlProps) => (
                                <Textarea
                                    key={
                                        editor.mode === 'edit'
                                            ? editor.note.id
                                            : 'create'
                                    }
                                    name="content"
                                    rows={6}
                                    defaultValue={
                                        editor.mode === 'edit'
                                            ? editor.note.content
                                            : ''
                                    }
                                    placeholder="Write something worth remembering"
                                    className="w-full"
                                    {...controlProps}
                                />
                            )}
                        </Field>
                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn"
                                onClick={() => editorRef.current?.close()}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-accent"
                                disabled={pendingIntent !== null}
                            >
                                {editor.mode === 'edit'
                                    ? 'Save changes'
                                    : 'Create note'}
                            </button>
                        </div>
                    </Form>
                </div>
            </dialog>

            <dialog
                ref={deleteRef}
                className="modal"
                onClose={() => setPendingDeleteId(null)}
            >
                <div className="modal-box">
                    <h3 className="text-lg font-bold">Delete note</h3>
                    <p className="py-4">This will delete the note.</p>
                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn"
                            onClick={() => deleteRef.current?.close()}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-error"
                            disabled={pendingIntent === 'delete-note'}
                            onClick={() => {
                                if (pendingDeleteId) {
                                    submit(
                                        {
                                            intent: 'delete-note',
                                            noteId: pendingDeleteId,
                                        },
                                        { method: 'POST' },
                                    );
                                }
                                deleteRef.current?.close();
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
