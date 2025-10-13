import { Link } from 'react-router';
import { Container } from '~/components/Container';
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';

export default function ProfileRoute() {
    const { user } = useAuthenticatedContext();

    return (
        <Container>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-4">Profile</h1>
                </div>
                <div>
                    <Link
                        to="/profile/edit"
                        className="text-blue-500 underline"
                    >
                        Edit Profile
                    </Link>
                </div>
            </div>
            <div className="space-y-4">
                <p>Name: {user?.name}</p>
                <p>Email: {user?.email}</p>
                <p>Joined: {user?.createdAt.toLocaleDateString()}</p>
            </div>
        </Container>
    );
}
