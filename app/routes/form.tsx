import type { Route } from './+types/form';
import { CircleXIcon } from 'lucide-react';
import { useFetcher } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Container } from '~/components/Container';
import { authMiddleware } from '~/middleware/auth';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

// Force server round-trip so auth middleware runs on client-side navigations
export async function loader() {
    return null;
}

export async function action() {
    return {
        formError: 'This is a fake error message for demonstration purposes.',
    };
}

const formSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.email({ message: 'Enter a valid email address' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function FormRoute() {
    const fetcher = useFetcher<typeof action>();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = (_data: FormValues) => {
        fetcher.submit({}, { method: 'post' });
    };

    return (
        <>
            <title>Form | Iridium</title>
            <meta
                name="description"
                content="This is a form example with validation errors."
            />
            <Container className="p-4">
                <h1 className="mb-8 text-4xl font-bold">Form</h1>
                {fetcher.data?.formError && (
                    <div role="alert" className="alert alert-error mb-4">
                        <CircleXIcon aria-hidden="true" className="h-6 w-6" />
                        <span>{fetcher.data.formError}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            What is your first name?
                        </legend>
                        <input
                            type="text"
                            className="input"
                            placeholder="Your name"
                            aria-describedby={
                                errors.name ? 'name-error' : undefined
                            }
                            {...register('name')}
                        />
                        {errors.name && (
                            <p
                                id="name-error"
                                className="label text-error italic"
                            >
                                {errors.name.message}
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
                            aria-describedby={
                                errors.email ? 'email-error' : undefined
                            }
                            {...register('email')}
                        />
                        {errors.email && (
                            <p
                                id="email-error"
                                className="label text-error italic"
                            >
                                {errors.email.message}
                            </p>
                        )}
                    </fieldset>
                    <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={fetcher.state !== 'idle'}
                    >
                        Submit
                    </button>
                </form>
            </Container>
        </>
    );
}
