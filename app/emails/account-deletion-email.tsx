import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
} from '@react-email/components';

interface AccountDeletionEmailProps {
    name: string;
    email: string;
}

export default function AccountDeletionEmail({
    name,
    email,
}: AccountDeletionEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Your Iridium account has been deleted</Preview>
            <Body style={bodyStyle}>
                <Container style={containerStyle}>
                    <Heading style={headingStyle}>Account Deleted</Heading>
                    <Text style={textStyle}>Hi {name},</Text>
                    <Text style={textStyle}>
                        This email confirms that your Iridium account ({email})
                        has been permanently deleted.
                    </Text>
                    <Text style={textStyle}>What was removed:</Text>
                    <ul style={listStyle}>
                        <li>Profile information</li>
                        <li>Organization memberships</li>
                        <li>Messages and conversations</li>
                        <li>Settings and preferences</li>
                    </ul>
                    <Text style={textStyle}>
                        If you did not request this deletion, please contact our
                        support team immediately.
                    </Text>
                    <Text style={footerStyle}>
                        You can create a new account anytime if you would like
                        to return to Iridium.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const bodyStyle = {
    fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    backgroundColor: '#f4f4f4',
    padding: '24px',
};

const containerStyle = {
    backgroundColor: '#ffffff',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
};

const headingStyle = {
    color: '#111827',
    margin: '0 0 12px 0',
};

const textStyle = {
    color: '#111827',
    fontSize: '16px',
    lineHeight: '24px',
};

const listStyle = {
    paddingLeft: '20px',
    color: '#111827',
    lineHeight: '24px',
};

const footerStyle = {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '20px',
    marginTop: '24px',
};
