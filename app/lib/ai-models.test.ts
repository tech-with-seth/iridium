import { describe, expect, it } from 'vitest';
import { ALLOWED_MODELS, DEFAULT_MODEL_ID, isAllowedModel } from './ai-models';

describe('ai-models allowlist', () => {
    it('accepts every allowlisted model id', () => {
        for (const model of ALLOWED_MODELS) {
            expect(isAllowedModel(model.id)).toBe(true);
        }
    });

    it('rejects unknown ids and non-strings', () => {
        expect(isAllowedModel('anthropic/claude-evil-9000')).toBe(false);
        expect(isAllowedModel('')).toBe(false);
        expect(isAllowedModel(undefined)).toBe(false);
        expect(isAllowedModel(42)).toBe(false);
    });

    it('defaults to an allowlisted model', () => {
        expect(isAllowedModel(DEFAULT_MODEL_ID)).toBe(true);
    });
});
