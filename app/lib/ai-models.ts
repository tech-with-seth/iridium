import { z } from 'zod';

/**
 * Models users may pick per thread. The server validates against this
 * allowlist; never trust a model id straight from the client.
 */
export const ALLOWED_MODELS = [
    {
        id: 'anthropic/claude-haiku-4-5-20251001',
        label: 'Claude Haiku 4.5 (fast)',
    },
    {
        id: 'anthropic/claude-sonnet-4-6',
        label: 'Claude Sonnet 4.6 (smart)',
    },
] as const;

export const DEFAULT_MODEL_ID = ALLOWED_MODELS[0].id;

export type AllowedModelId = (typeof ALLOWED_MODELS)[number]['id'];

export const modelIdSchema = z.enum(
    ALLOWED_MODELS.map((model) => model.id) as [
        AllowedModelId,
        ...AllowedModelId[],
    ],
);

export function isAllowedModel(id: unknown): id is AllowedModelId {
    return modelIdSchema.safeParse(id).success;
}
