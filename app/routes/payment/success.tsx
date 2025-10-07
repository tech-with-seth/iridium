import { Alert } from '~/components/Alert';
import { Button } from '~/components/Button';
import { Card } from '~/components/Card';
import { Container } from '~/components/Container';
import { Link } from 'react-router';
import { Paths } from '~/constants';

export default function PaymentSuccess() {
    return (
        <>
            <title>Payment Successful - TWS Foundations</title>
            <meta
                name="description"
                content="Your payment was processed successfully."
            />
            <Container className="pt-12">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <div className="text-center space-y-6">
                            {/* Success Icon */}
                            <div className="flex justify-center">
                                <div className="rounded-full bg-success/20 p-4">
                                    <svg
                                        className="w-16 h-16 text-success"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Success Message */}
                            <div>
                                <h1 className="text-3xl font-bold mb-2">
                                    Payment Successful!
                                </h1>
                                <p className="text-base-content/70">
                                    Thank you for your purchase. Your payment
                                    has been processed successfully.
                                </p>
                            </div>

                            {/* Information Alert */}
                            <Alert status="info">
                                You should receive a confirmation email shortly.
                                If you have any questions, please check your
                                billing dashboard or contact support.
                            </Alert>

                            {/* What's Next */}
                            <div className="text-left bg-base-200 p-6 rounded-lg">
                                <h2 className="font-semibold text-lg mb-3">
                                    What&apos;s Next?
                                </h2>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start">
                                        <svg
                                            className="w-5 h-5 text-success mt-0.5 mr-2 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <span>
                                            Your order has been confirmed and is
                                            being processed
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg
                                            className="w-5 h-5 text-success mt-0.5 mr-2 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <span>
                                            Check your email for order details
                                            and receipt
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg
                                            className="w-5 h-5 text-success mt-0.5 mr-2 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <span>
                                            Access your benefits and
                                            subscriptions in the billing
                                            dashboard
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                                <Link to={Paths.BILLING}>
                                    <Button status="primary" wide>
                                        View Billing Dashboard
                                    </Button>
                                </Link>
                                <Link to={Paths.DASHBOARD}>
                                    <Button variant="outline" wide>
                                        Go to Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </Container>
        </>
    );
}
