import { useCallback } from 'react';
import { useFetcher } from 'react-router';
import type { FeatureFlag } from '~/types/posthog';
import { Toggle } from '../data-input/Toggle';

interface FlagsListProps {
    flags: FeatureFlag[];
}

export function FlagsList({ flags }: FlagsListProps) {
    const flagFetcher = useFetcher();

    return (
        <>
            {flags.map((flag: FeatureFlag) => {
                const isTarget =
                    String(flagFetcher.formData?.get('flagId')) ===
                    String(flag.id);

                const isLoading = flagFetcher.state !== 'idle';

                const handleOnChange = useCallback(
                    () =>
                        flagFetcher.submit(
                            {
                                active: !flag.active,
                                flagId: flag.id,
                                intent: 'toggleFeatureFlag',
                            },
                            {
                                method: 'PATCH',
                                action: '/api/posthog/feature-flags',
                            },
                        ),
                    [flag.active],
                );

                return (
                    <div
                        className="flex flex-col items-start py-4 rounded-box"
                        key={flag.id}
                    >
                        {flag.name && (
                            <p className="text-sm text-base-content mb-2">
                                {flag.name}
                            </p>
                        )}
                        <Toggle
                            color="primary"
                            checked={flag.active}
                            disabled={isTarget && flagFetcher.state !== 'idle'}
                            label={flag.key}
                            loading={isTarget && isLoading}
                            onChange={handleOnChange}
                        />
                    </div>
                );
            })}
        </>
    );
}
