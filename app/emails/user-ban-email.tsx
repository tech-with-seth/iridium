import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
} from '@react-email/components';

interface UserBanEmailProps {
    name: string;
    reason?: string;
    supportEmail: string;
}

export default function UserBanEmail({
    name,
    reason,
    supportEmail,
}: UserBanEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Your Iridium account has been suspended</Preview>
            <Body style={bodyStyle}>
                <Container style={containerStyle}>
                    <Heading style={headingStyle}>Account Suspended</Heading>
                    <Text style={textStyle}>Hi {name},</Text>
                    <Text style={textStyle}>
                        Your Iridium account has been temporarily suspended. You
                        will not be able to access your account until this is
                        resolved.
                    </Text>
                    {reason ? (
                        <div style={reasonBoxStyle}>
                            <Text style={textStyle}>
                                <strong>Reason:</strong> {reason}
                            </Text>
                        </div>
                    ) : null}
                    <Text style={textStyle}>
                        If you believe this was an error or you would like to
                        appeal, please contact our support team.
                    </Text>
                    <Text style={textStyle}>
                        <strong>Support:</strong> {supportEmail}
                    </Text>
                    <Text style={footerStyle}>
                        We take account security and community guidelines
                        seriously. Please review our Terms of Service for more
                        information.
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
    color: '#dc2626',
    margin: '0 0 12px 0',
};

const textStyle = {
    color: '#111827',
    fontSize: '16px',
    lineHeight: '24px',
};

const reasonBoxStyle = {
    backgroundColor: '#fff7ed',
    borderLeft: '4px solid #fb923c',
    padding: '12px 16px',
    borderRadius: '6px',
    margin: '16px 0',
};

const footerStyle = {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '20px',
    marginTop: '24px',
};
