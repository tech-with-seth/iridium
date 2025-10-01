import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { TextInput } from '~/components/TextInput';

export default function DesignRoute() {
    return (
        <Container className="flex flex-col gap-8">
            <h1 className="text-2xl font-bold">Design</h1>

            <div className="flex flex-wrap gap-4">
                <Button variant="dash">Dash</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="soft">Soft</Button>
            </div>

            <div className="flex flex-wrap gap-4">
                <Button status="accent">Accent</Button>
                <Button status="error">Error</Button>
                <Button status="info">Info</Button>
                <Button status="neutral">Neutral</Button>
                <Button status="primary">Primary</Button>
                <Button status="secondary">Secondary</Button>
                <Button status="success">Success</Button>
                <Button status="warning">Warning</Button>
            </div>

            <div className="flex flex-wrap gap-4">
                <Button square>+</Button>
                <Button circle>+</Button>
                <Button wide>Wiiide</Button>
            </div>

            <div className="flex flex-wrap gap-4">
                <Button variant="dash" status="primary" circle>
                    🎯
                </Button>
                <Button variant="soft" status="secondary">
                    Soft
                </Button>
            </div>

            <div>
                <TextInput label="Text Input" placeholder="Placeholder" />
            </div>
        </Container>
    );
}
