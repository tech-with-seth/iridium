import { Container } from './Container';

export function Footer() {
    return (
        <footer className="py-12 bg-base-200">
            <Container className="px-4">
                <div className="grid grid-cols-1 gap-8 md:gap-4 md:grid-cols-4">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">About</h3>
                        <ul className="flex flex-col gap-2">
                            <li>
                                <a href="https://sethdavis.tech/iridium">
                                    More info on Iridium
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">
                            Core Stack
                        </h3>
                        <ul className="flex flex-col gap-2">
                            <li>
                                <a
                                    href="https://typescriptlang.org/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    TypeScript
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://react.dev/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    React
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://reactrouter.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    React Router
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">
                            Authentication & UI
                        </h3>
                        <ul className="flex flex-col gap-2">
                            <li>
                                <a
                                    href="https://www.better-auth.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    BetterAuth
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://tailwindcss.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Tailwind CSS
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://daisyui.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    DaisyUI
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Services</h3>
                        <ul className="flex flex-col gap-2">
                            <li>
                                <a
                                    href="https://posthog.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    PostHog
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://railway.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Railway
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
