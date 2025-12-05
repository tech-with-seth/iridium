import type { FeatureFlag } from "~/types/posthog";

export function isActive(flags: FeatureFlag[] | undefined, flagName: string) {
    if (!flags) {
        return false;
    }

    return flags.find((flag) => flag.key === flagName)?.active;
}