import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';

interface PasswordResetEmailProps {
    resetUrl: string;
    userEmail: string;
}

export default function PasswordResetEmail({
    resetUrl,
    userEmail,
}: PasswordResetEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Reset your password</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Reset your password</Heading>
                    <Text style={text}>
                        Hi there! We received a request to reset the password
                        for your account (<strong>{userEmail}</strong>).
                    </Text>
                    <Text style={text}>
                        Click the button below to reset your password:
                    </Text>
                    <Section style={buttonContainer}>
                        <Button style={button} href={resetUrl}>
                            Reset Password
                        </Button>
                    </Section>
                    <Text style={text}>
                        Or copy and paste this URL into your browser:
                    </Text>
                    <Link href={resetUrl} style={link}>
                        {resetUrl}
                    </Link>
                    <Text style={warningText}>
                        This link will expire in 1 hour for security reasons.
                    </Text>
                    <Text style={footer}>
                        If you didn't request a password reset, you can safely
                        ignore this email. Your password will not be changed.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
};

const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0',
    textAlign: 'center' as const,
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const button = {
    backgroundColor: '#5469d4',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 20px',
};

const link = {
    color: '#5469d4',
    fontSize: '14px',
    textDecoration: 'underline',
};

const warningText = {
    color: '#e63946',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '16px 0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    marginTop: '32px',
};
