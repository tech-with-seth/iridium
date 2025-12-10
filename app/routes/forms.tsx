import { useState, useEffect } from 'react';
import { useFetcher } from 'react-router';
import type { Route } from './+types/forms';
import { data } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { validateFormData } from '~/lib/form-validation.server';
import { useValidatedForm } from '~/lib/form-hooks';
import {
    supportRequestSchema,
    type SupportRequestData,
} from '~/lib/validations';
import { Alert } from '~/components/feedback/Alert';
import { Button } from '~/components/actions/Button';
import { Checkbox } from '~/components/data-input/Checkbox';
import { Container } from '~/components/layout/Container';
import { Code } from '~/components/mockup/Code';
import { FileInput } from '~/components/data-input/FileInput';
import { Radio } from '~/components/data-input/Radio';
import { Select } from '~/components/data-input/Select';
import { Textarea } from '~/components/data-input/Textarea';
import { TextInput } from '~/components/data-input/TextInput';

export async function loader() {
    return data({});
}

export async function action({ request }: Route.ActionArgs) {
    if (request.method === 'POST') {
        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const formData = await request.formData();

        const { data: validatedData, errors } =
            await validateFormData<SupportRequestData>(
                formData,
                zodResolver(supportRequestSchema),
            );

        if (errors) {
            console.log('❌ Validation failed, returning errors');
            return data({ errors }, { status: 400 });
        }

        // Simulate random success/failure for demo
        const randomValue = Math.random();
        const shouldFail = randomValue < 0.5; // 50% chance of failure

        if (shouldFail) {
            console.log('❌ Simulated failure triggered');
            return data(
                {
                    error: 'Failed to submit support request. Please try again.',
                },
                { status: 500 },
            );
        }

        return data({
            success: true,
            message:
                "Support request submitted successfully! We'll get back to you soon.",
            submittedData: validatedData,
        });
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}

export default function FormsRoute() {
    const fetcher = useFetcher();
    const [showSuccess, setShowSuccess] = useState(false);

    // Form setup with validation
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useValidatedForm<SupportRequestData>({
        resolver: zodResolver(supportRequestSchema),
        errors: fetcher.data?.errors,
        defaultValues: {
            name: 'John Doe',
            email: 'john@example.com',
            subject: 'technical',
            priority: 'medium',
            message:
                'I am experiencing an issue with the form validation. Could you please help me understand how it works?',
            subscribe: false,
        },
    });

    // Watch message length for character counter
    const message = watch('message');

    // Handle form submission
    const onSubmit = (data: SupportRequestData) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, String(value));
        });

        fetcher.submit(formData, { method: 'POST' });
    };

    // Handle success
    useEffect(() => {
        if (fetcher.data?.success) {
            setShowSuccess(true);
            reset(); // Clear form
            setTimeout(() => setShowSuccess(false), 5000);
        }
    }, [fetcher.data, reset]);

    const isSubmitting = fetcher.state !== 'idle';

    return (
        <>
            <title>Forms | Iridium</title>
            <meta
                name="description"
                content="Form validation and submission examples"
            />

            <Container className="flex flex-col gap-8 pb-8 px-4">
                <div className="bg-base-100 rounded-box p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">
                            Form Examples
                        </h1>
                        <p className="text-base-content/70">
                            Comprehensive form with validation, error handling,
                            and submission
                        </p>
                    </div>

                    {/* 2-Column Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT: Interactive Form */}
                        <section className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-4">
                                    Support Request Form
                                </h2>
                                <p className="text-sm text-base-content/70 mb-4">
                                    All fields marked with * are required
                                </p>
                                {/* Success Alert */}
                                {showSuccess && fetcher.data?.success && (
                                    <Alert status="success">
                                        <span>{fetcher.data.message}</span>
                                    </Alert>
                                )}

                                {/* Error Alert */}
                                {fetcher.data?.error && (
                                    <Alert status="error">
                                        <span>{fetcher.data.error}</span>
                                    </Alert>
                                )}
                            </div>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-5"
                            >
                                <TextInput
                                    {...register('name')}
                                    label="Full Name"
                                    placeholder="Enter your name"
                                    error={errors.name?.message}
                                    required
                                />

                                <TextInput
                                    {...register('email')}
                                    type="email"
                                    label="Email Address"
                                    placeholder="you@example.com"
                                    error={errors.email?.message}
                                    helperText="We'll respond to this email"
                                    required
                                />

                                <Select
                                    {...register('subject')}
                                    label="Subject"
                                    placeholder="Select a subject..."
                                    options={[
                                        { value: 'bug', label: 'Bug Report' },
                                        {
                                            value: 'feature',
                                            label: 'Feature Request',
                                        },
                                        {
                                            value: 'billing',
                                            label: 'Billing Question',
                                        },
                                        {
                                            value: 'technical',
                                            label: 'Technical Support',
                                        },
                                        { value: 'other', label: 'Other' },
                                    ]}
                                    error={errors.subject?.message}
                                    required
                                />

                                {/* Priority Radio Buttons */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">
                                        Priority{' '}
                                        <span className="text-error">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-4">
                                        {[
                                            'low',
                                            'medium',
                                            'high',
                                            'urgent',
                                        ].map((priority) => (
                                            <Radio
                                                key={priority}
                                                {...register('priority')}
                                                value={priority}
                                                label={
                                                    priority
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                    priority.slice(1)
                                                }
                                                name="priority"
                                            />
                                        ))}
                                    </div>
                                    {errors.priority && (
                                        <span className="text-error text-sm">
                                            {errors.priority.message}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <Textarea
                                        {...register('message')}
                                        label="Message"
                                        placeholder="Describe your issue or request..."
                                        rows={6}
                                        error={errors.message?.message}
                                        helperText={`${message?.length || 0}/1000 characters`}
                                        required
                                    />
                                </div>

                                <FileInput
                                    name="attachment"
                                    label="Attachment (Optional)"
                                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                    helperText="File uploads are disabled in this demo"
                                    disabled
                                />

                                <Checkbox
                                    {...register('subscribe')}
                                    label="Subscribe to product updates and newsletters"
                                />

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="submit"
                                        status="primary"
                                        loading={isSubmitting}
                                        disabled={isSubmitting}
                                        wide
                                    >
                                        {isSubmitting
                                            ? 'Submitting...'
                                            : 'Submit Request'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => reset()}
                                        disabled={isSubmitting}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </form>

                            <Alert status="info" variant="soft">
                                <div>
                                    <p className="font-semibold">Demo Mode</p>
                                    <p className="text-sm">
                                        This form has a 50% chance of simulated
                                        server failure (after passing
                                        validation) to demonstrate error
                                        handling. Try submitting multiple times!
                                    </p>
                                </div>
                            </Alert>
                        </section>

                        {/* RIGHT: Code Display */}
                        <section className="flex flex-col gap-6">
                            <h2 className="text-2xl font-bold">
                                Implementation
                            </h2>

                            <div className="space-y-6">
                                {/* Schema Code */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        1. Validation Schema
                                    </h3>
                                    <Code
                                        lines={[
                                            {
                                                content:
                                                    '// app/lib/validations.ts',
                                            },
                                            {
                                                content:
                                                    'export const supportRequestSchema = z.object({',
                                            },
                                            {
                                                content:
                                                    '  name: z.string().min(1).max(100),',
                                            },
                                            {
                                                content:
                                                    '  email: z.string().email(),',
                                            },
                                            {
                                                content:
                                                    '  subject: z.string().min(1),',
                                            },
                                            {
                                                content:
                                                    "  priority: z.enum(['low', 'medium', 'high', 'urgent']),",
                                            },
                                            {
                                                content:
                                                    '  message: z.string().min(10).max(1000),',
                                            },
                                            {
                                                content:
                                                    '  subscribe: z.boolean().optional(),',
                                            },
                                            { content: '});' },
                                        ]}
                                    />
                                </div>

                                {/* Server Action Code */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        2. Server Action
                                    </h3>
                                    <Code
                                        lines={[
                                            {
                                                content:
                                                    'export async function action({ request }) {',
                                            },
                                            {
                                                content:
                                                    '  const formData = await request.formData();',
                                            },
                                            { content: '' },
                                            {
                                                content:
                                                    '  const { data, errors } = await validateFormData(',
                                            },
                                            { content: '    formData,' },
                                            {
                                                content:
                                                    '    zodResolver(supportRequestSchema)',
                                            },
                                            { content: '  );' },
                                            { content: '' },
                                            { content: '  if (errors) {' },
                                            {
                                                content:
                                                    '    return data({ errors }, { status: 400 });',
                                            },
                                            { content: '  }' },
                                            { content: '' },
                                            {
                                                content:
                                                    '  // Process validated data',
                                            },
                                            {
                                                content:
                                                    '  return data({ success: true });',
                                            },
                                            { content: '}' },
                                        ]}
                                    />
                                </div>

                                {/* Form Usage Code */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        3. Form Component
                                    </h3>
                                    <Code
                                        lines={[
                                            {
                                                content:
                                                    'const fetcher = useFetcher();',
                                            },
                                            { content: '' },
                                            {
                                                content:
                                                    'const { register, handleSubmit, formState: { errors } }',
                                            },
                                            {
                                                content:
                                                    '  = useValidatedForm({',
                                            },
                                            {
                                                content:
                                                    '    resolver: zodResolver(supportRequestSchema),',
                                            },
                                            {
                                                content:
                                                    '    errors: fetcher.data?.errors,',
                                            },
                                            { content: '  });' },
                                            { content: '' },
                                            {
                                                content:
                                                    'const onSubmit = (data) => {',
                                            },
                                            {
                                                content:
                                                    '  const formData = new FormData();',
                                            },
                                            {
                                                content:
                                                    '  Object.entries(data).forEach(([key, value]) => {',
                                            },
                                            {
                                                content:
                                                    '    formData.append(key, String(value));',
                                            },
                                            { content: '  });' },
                                            {
                                                content:
                                                    "  fetcher.submit(formData, { method: 'POST' });",
                                            },
                                            { content: '};' },
                                        ]}
                                    />
                                </div>

                                {/* Input Components Code */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        4. Input Components
                                    </h3>
                                    <Code
                                        lines={[
                                            {
                                                content:
                                                    '<form onSubmit={handleSubmit(onSubmit)}>',
                                            },
                                            { content: '  <TextInput' },
                                            {
                                                content:
                                                    "    {...register('name')}",
                                            },
                                            { content: '    label="Name"' },
                                            {
                                                content:
                                                    '    error={errors.name?.message}',
                                            },
                                            { content: '    required' },
                                            { content: '  />' },
                                            { content: '' },
                                            { content: '  <Select' },
                                            {
                                                content:
                                                    "    {...register('subject')}",
                                            },
                                            {
                                                content:
                                                    '    options={subjectOptions}',
                                            },
                                            {
                                                content:
                                                    '    error={errors.subject?.message}',
                                            },
                                            { content: '  />' },
                                            { content: '' },
                                            { content: '  <Textarea' },
                                            {
                                                content:
                                                    "    {...register('message')}",
                                            },
                                            {
                                                content:
                                                    '    error={errors.message?.message}',
                                            },
                                            { content: '  />' },
                                            { content: '' },
                                            {
                                                content:
                                                    '  <Button type="submit" loading={isSubmitting}>',
                                            },
                                            { content: '    Submit' },
                                            { content: '  </Button>' },
                                            { content: '</form>' },
                                        ]}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </Container>
        </>
    );
}
