import { Link } from 'react-router';
import { Container } from './Container';

export function Footer() {
    return (
        <footer className="py-12 bg-base-300">
            <Container className="px-4">
                <div className="grid grid-cols-4">
                    <div>
                        <ul className="flex flex-col">
                            <li>
                                <Link to="/">Link</Link>
                            </li>
                            <li>
                                <Link to="/">Link</Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <ul className="flex flex-col">
                            <li>
                                <Link to="/">Link</Link>
                            </li>
                            <li>
                                <Link to="/">Link</Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <ul className="flex flex-col">
                            <li>
                                <Link to="/">Link</Link>
                            </li>
                            <li>
                                <Link to="/">Link</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
