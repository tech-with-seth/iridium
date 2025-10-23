import { useEffect } from 'react';
import {
    useForm,
    type UseFormProps,
    type UseFormReturn,
    type FieldValues,
    type Path,
} from 'react-hook-form';

interface UseValidatedFormOptions<TFieldValues extends FieldValues>
    extends Omit<UseFormProps<TFieldValues>, 'errors'> {
    /**
     * Server-side errors from action/fetcher response
     * Format: { fieldName: { type: string, message: string } }
     */
    errors?: Record<string, { type: string; message: string }>;
}

/**
 * Enhanced useForm hook that integrates server-side validation errors
 * with React Hook Form's client-side validation
 *
 * @example
 * ```tsx
 * const fetcher = useFetcher();
 * const { register, handleSubmit, formState: { errors } } = useValidatedForm({
 *   resolver: zodResolver(signInSchema),
 *   errors: fetcher.data?.errors
 * });
 * ```
 */
export function useValidatedForm<
    TFieldValues extends FieldValues = FieldValues,
>(
    options?: UseValidatedFormOptions<TFieldValues>,
): UseFormReturn<TFieldValues> {
    const { errors: serverErrors, ...formOptions } = options || {};

    const form = useForm<TFieldValues>(formOptions);

    // Sync server errors with form state
    useEffect(() => {
        if (serverErrors && Object.keys(serverErrors).length > 0) {
            Object.entries(serverErrors).forEach(([fieldName, error]) => {
                form.setError(fieldName as Path<TFieldValues>, {
                    type: error.type,
                    message: error.message,
                });
            });
        }
    }, [serverErrors, form]);

    return form;
}
