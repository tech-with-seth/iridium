/**
 * Template: Validated Form Component
 *
 * Replace placeholders:
 * - [Feature] → Your feature name (PascalCase)
 * - [feature] → Your feature name (camelCase)
 * - formSchema → Your schema name
 * - FormData → Your form data type
 *
 * After creating:
 * 1. Add schema to app/lib/validations.ts
 * 2. Add action to your route file
 */

import { useFetcher } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useValidatedForm } from '~/lib/form-hooks';
import { formSchema, type FormData } from '~/lib/validations';
import { TextInput } from '~/components/data-input/TextInput';
import { Textarea } from '~/components/data-input/Textarea';
import { Button } from '~/components/actions/Button';
import { Alert } from '~/components/feedback/Alert';
import { Card } from '~/components/layout/Card';

interface [Feature]FormProps {
    /** Initial values for editing existing data */
    defaultValues?: Partial<FormData>;
    /** Action URL to submit to */
    action?: string;
    /** HTTP method */
    method?: 'POST' | 'PUT';
    /** Callback on successful submission */
    onSuccess?: () => void;
}

export function [Feature]Form({
    defaultValues,
    action,
    method = 'POST',
    onSuccess,
}: [Feature]FormProps) {
    const fetcher = useFetcher();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useValidatedForm<FormData>({
        resolver: zodResolver(formSchema),
        errors: fetcher.data?.errors,
        defaultValues,
    });

    const onSubmit = (data: FormData) => {
        const formData = new FormData();

        // Append all fields to FormData
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        fetcher.submit(formData, {
            method,
            action,
        });
    };

    const isLoading = fetcher.state === 'submitting' || fetcher.state === 'loading';
    const isSuccess = fetcher.state === 'idle' && fetcher.data?.success;

    // Handle success callback
    if (isSuccess && onSuccess) {
        onSuccess();
    }

    return (
        <Card>
            {/* Form-level error */}
            {fetcher.data?.error && (
                <Alert status="error" className="mb-4">
                    {fetcher.data.error}
                </Alert>
            )}

            {/* Success message */}
            {isSuccess && (
                <Alert status="success" className="mb-4">
                    Saved successfully!
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextInput
                    {...register('name')}
                    label="Name"
                    placeholder="Enter name"
                    error={errors.name?.message}
                    required
                />

                <TextInput
                    {...register('email')}
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    error={errors.email?.message}
                    required
                />

                <Textarea
                    {...register('description')}
                    label="Description"
                    placeholder="Enter description"
                    rows={4}
                    error={errors.description?.message}
                />

                <div className="flex gap-2 justify-end">
                    {isDirty && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => reset()}
                            disabled={isLoading}
                        >
                            Reset
                        </Button>
                    )}

                    <Button type="submit" loading={isLoading}>
                        {method === 'POST' ? 'Create' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
