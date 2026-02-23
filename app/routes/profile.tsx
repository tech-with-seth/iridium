import { Container } from '~/components/Container';

export async function loader() {}

export async function action() {}

export default function ProfileRoute() {
    return (
        <>
            <title>Profile</title>
            <meta name="description" content="Welcome to your profile page!" />
            <Container className="p-4">
                <h1 className="mb-8 text-4xl font-bold">Profile</h1>
                <p>Good bean juice make me go fast</p>
            </Container>
        </>
    );
}
