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
    Text
} from '@react-email/components';

interface VerificationEmailProps {
    verificationUrl: string;
    userEmail: string;
}

export default function VerificationEmail({
    verificationUrl,
    userEmail
}: VerificationEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Verify your email address</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Verify your email address</Heading>
                    <Text style={text}>
                        Hi there! Thanks for signing up with{' '}
                        <strong>{userEmail}</strong>.
                    </Text>
                    <Text style={text}>
                        Please verify your email address by clicking the button
                        below:
                    </Text>
                    <Section style={buttonContainer}>
                        <Button style={button} href={verificationUrl}>
                            Verify Email Address
                        </Button>
                    </Section>
                    <Text style={text}>
                        Or copy and paste this URL into your browser:
                    </Text>
                    <Link href={verificationUrl} style={link}>
                        {verificationUrl}
                    </Link>
                    <Text style={footer}>
                        If you didn't create an account, you can safely ignore
                        this email.
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
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif'
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px'
};

const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0',
    textAlign: 'center' as const
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0'
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
    padding: '12px 20px'
};

const link = {
    color: '#5469d4',
    fontSize: '14px',
    textDecoration: 'underline'
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    marginTop: '32px'
};
