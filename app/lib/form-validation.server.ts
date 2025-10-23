import type { Resolver, FieldValues } from 'react-hook-form';

/**
 * Validates FormData using a React Hook Form resolver (typically zodResolver)
 *
 * This is the ONE function you need for server-side form validation in React Router 7.
 * Always call request.formData() first, then pass it to this function.
 *
 * @example
 * export async function action({ request }) {
 *   const formData = await request.formData();
 *   const { data, errors } = await validateFormData(formData, zodResolver(mySchema));
 *
 *   if (errors) {
 *     return { errors };
 *   }
 *
 *   await saveToDatabase(data);
 * }
 */
export async function validateFormData<T extends FieldValues>(
    formData: FormData,
    resolver: Resolver<T>,
): Promise<{
    data?: T;
    errors?: Record<string, { type: string; message: string }>;
    receivedValues: Record<string, any>;
}> {
    // Convert FormData to plain object for validation
    const receivedValues: Record<string, any> = {};

    formData.forEach((value, key) => {
        // Handle multiple values for the same key (e.g., checkboxes)
        if (receivedValues[key]) {
            if (Array.isArray(receivedValues[key])) {
                receivedValues[key].push(value);
            } else {
                receivedValues[key] = [receivedValues[key], value];
            }
        } else {
            receivedValues[key] = value;
        }
    });

    // Run validation through the resolver
    const result = await resolver(
        receivedValues as T,
        {},
        {
            shouldUseNativeValidation: false,
            fields: {},
        },
    );

    // If there are errors, format them for easy consumption
    if (result.errors && Object.keys(result.errors).length > 0) {
        const formattedErrors: Record<
            string,
            { type: string; message: string }
        > = {};

        Object.entries(result.errors).forEach(([key, error]) => {
            if (error) {
                formattedErrors[key] = {
                    type: String(error.type || 'validation'),
                    message: String(error.message || 'Invalid value'),
                };
            }
        });

        return {
            errors: formattedErrors,
            receivedValues,
        };
    }

    // Return validated data
    return {
        data: result.values as T | undefined,
        receivedValues,
    };
}
