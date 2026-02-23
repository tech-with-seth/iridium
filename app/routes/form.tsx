import { Container } from '~/components/Container';
import type { Route } from './+types/form';
import { CircleXIcon } from 'lucide-react';
import { authMiddleware } from '~/middleware/auth';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

// Force server round-trip so auth middleware runs on client-side navigations
export async function loader() {
    return null;
}

export async function action() {
    return {
        formError: 'This is a fake error message for demonstration purposes.',
        fieldError: {
            name: 'Name is required',
            email: 'Email is required',
        },
    };
}

export default function FormRoute({ actionData }: Route.ComponentProps) {
    return (
        <>
            <title>Form | Iridium</title>
            <meta
                name="description"
                content="This is a form example with validation errors."
            />
            <Container className="p-4">
                <h1 className="mb-8 text-4xl font-bold">Form</h1>
                {actionData?.formError && (
                    <div role="alert" className="alert alert-error mb-4">
                        <CircleXIcon className="h-6 w-6" />
                        <span>{actionData.formError}</span>
                    </div>
                )}
                <form method="POST" className="space-y-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            What is your first name?
                        </legend>
                        <input
                            type="text"
                            className="input"
                            placeholder="Your name"
                        />
                        {actionData?.fieldError?.name && (
                            <p className="label text-error italic">
                                {actionData.fieldError.name}
                            </p>
                        )}
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            What is your email address?
                        </legend>
                        <input
                            type="email"
                            className="input"
                            placeholder="name@example.com"
                        />
                        {actionData?.fieldError?.email && (
                            <p className="label text-error italic">
                                {actionData.fieldError.email}
                            </p>
                        )}
                    </fieldset>
                    <button className="btn btn-primary" type="submit">
                        Submit
                    </button>
                </form>
            </Container>
        </>
    );
}
