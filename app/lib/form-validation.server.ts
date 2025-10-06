import type { Resolver, FieldValues } from 'react-hook-form';

/**
 * Parses FormData from a request into a plain object
 * Handles both POST body and GET search params
 */
export async function parseFormData(request: Request): Promise<Record<string, any>> {
    const url = new URL(request.url);

    // Handle GET requests with search params
    if (request.method === 'GET') {
        const data: Record<string, any> = {};
        url.searchParams.forEach((value, key) => {
            data[key] = value;
        });
        return data;
    }

    // Handle POST/PUT/PATCH/DELETE with FormData
    const formData = await request.formData();
    const data: Record<string, any> = {};

    formData.forEach((value, key) => {
        // Handle multiple values for the same key (e.g., checkboxes)
        if (data[key]) {
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    });

    return data;
}

/**
 * Validates form data using a React Hook Form resolver (typically zodResolver)
 * Returns validated data or field errors
 */
export async function getValidatedFormData<T extends FieldValues>(
    request: Request,
    resolver: Resolver<T>
): Promise<{
    data?: T;
    errors?: Record<string, { type: string; message: string }>;
    receivedValues: Record<string, any>;
}> {
    const receivedValues = await parseFormData(request);

    // Run validation through the resolver
    const result = await resolver(receivedValues as T, {}, {
        shouldUseNativeValidation: false,
        fields: {}
    });

    // If there are errors, format them for easy consumption
    if (result.errors && Object.keys(result.errors).length > 0) {
        const formattedErrors: Record<string, { type: string; message: string }> = {};

        Object.entries(result.errors).forEach(([key, error]) => {
            if (error) {
                formattedErrors[key] = {
                    type: String(error.type || 'validation'),
                    message: String(error.message || 'Invalid value')
                };
            }
        });

        return {
            errors: formattedErrors,
            receivedValues
        };
    }

    // Return validated data
    return {
        data: result.values as T | undefined,
        receivedValues
    };
}
