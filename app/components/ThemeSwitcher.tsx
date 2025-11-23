import { useCallback } from 'react';
import { Select } from './Select';
import { useFetcher } from 'react-router';

interface ThemeSwitcherProps {
    selectedTheme: string;
}

export function ThemeSwitcher({ selectedTheme }: ThemeSwitcherProps) {
    const themeFetcher = useFetcher();

    const handleChange = useCallback(
        (theme: string) => {
            themeFetcher.submit({ theme }, { method: 'POST', action: '/' });
        },
        [themeFetcher],
    );

    const isLoading = themeFetcher.state !== 'idle';

    return (
        <Select
            options={[
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'Abyss', value: 'abyss' },
                { label: 'Acid', value: 'acid' },
                { label: 'Aqua', value: 'aqua' },
                { label: 'Autumn', value: 'autumn' },
                { label: 'Black', value: 'black' },
                { label: 'Bumblebee', value: 'bumblebee' },
                { label: 'Business', value: 'business' },
                { label: 'Caramellatte', value: 'caramellatte' },
                { label: 'CMYK', value: 'cmyk' },
                { label: 'Coffee', value: 'coffee' },
                { label: 'Corporate', value: 'corporate' },
                { label: 'Cupcake', value: 'cupcake' },
                { label: 'Cyberpunk', value: 'cyberpunk' },
                { label: 'Dim', value: 'dim' },
                { label: 'Dracula', value: 'dracula' },
                { label: 'Emerald', value: 'emerald' },
                { label: 'Fantasy', value: 'fantasy' },
                { label: 'Forest', value: 'forest' },
                { label: 'Garden', value: 'garden' },
                { label: 'Halloween', value: 'halloween' },
                { label: 'Lemonade', value: 'lemonade' },
                { label: 'Lofi', value: 'lofi' },
                { label: 'Luxury', value: 'luxury' },
                { label: 'Night', value: 'night' },
                { label: 'Nord', value: 'nord' },
                { label: 'Pastel', value: 'pastel' },
                { label: 'Retro', value: 'retro' },
                { label: 'Silk', value: 'silk' },
                { label: 'Sunset', value: 'sunset' },
                { label: 'Synthwave', value: 'synthwave' },
                { label: 'Valentine', value: 'valentine' },
                { label: 'Winter', value: 'winter' },
                { label: 'Wireframe', value: 'wireframe' },
            ]}
            onChange={(event) => handleChange(event.target.value as string)}
            value={selectedTheme}
            disabled={isLoading}
        />
    );
}
