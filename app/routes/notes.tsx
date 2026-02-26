import invariant from 'tiny-invariant';
import { Container } from '~/components/Container';
import { Markdown } from '~/components/Markdown';
import type { Route } from './+types/notes';
import { getUserFromSession } from '~/models/session.server';
import { getNotesByUserId } from '~/models/note.server';
import { authMiddleware } from '~/middleware/auth';
import { FileTextIcon } from 'lucide-react';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    const notes = await getNotesByUserId(user.id);

    return { notes };
}

export default function NotesRoute({ loaderData }: Route.ComponentProps) {
    const { notes } = loaderData;

    return (
        <>
            <title>Notes</title>
            <meta
                name="description"
                content="View and manage your saved notes."
            />
            <div className="h-full overflow-y-auto">
                <Container className="p-4">
                    <h1 className="mb-8 text-4xl font-bold">Notes</h1>
                    {notes.length > 0 ? (
                        <ul className="space-y-4">
                            {notes.map((note) => (
                                <li
                                    key={note.id}
                                    className="rounded-box border-base-300 bg-base-200 border p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <FileTextIcon
                                            aria-hidden="true"
                                            className="text-primary mt-1 h-5 w-5 shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <h2 className="text-lg font-semibold">
                                                {note.title}
                                            </h2>
                                            <div className="text-base-content/70 mt-1">
                                                <details>
                                                    <summary>View Note</summary>
                                                    <Markdown>
                                                        {note.content}
                                                    </Markdown>
                                                </details>
                                            </div>
                                            <time
                                                className="text-base-content/50 mt-2 block text-xs"
                                                dateTime={new Date(
                                                    note.createdAt,
                                                ).toISOString()}
                                            >
                                                {new Date(
                                                    note.createdAt,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    },
                                                )}
                                            </time>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-base-content/50">
                            No notes yet. Try asking the assistant to save a
                            note for you in{' '}
                            <a href="/chat" className="link link-primary">
                                Chat
                            </a>
                            .
                        </p>
                    )}
                </Container>
            </div>
        </>
    );
}
