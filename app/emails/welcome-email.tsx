import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';

interface WelcomeEmailProps {
    userName: string;
    dashboardUrl: string;
}

export default function WelcomeEmail({
    userName,
    dashboardUrl,
}: WelcomeEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Welcome to Iridium!</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Welcome to Iridium!</Heading>
                    <Text style={text}>
                        Hi <strong>{userName}</strong>,
                    </Text>
                    <Text style={text}>
                        Thanks for joining us! We're excited to have you on
                        board.
                    </Text>
                    <Text style={text}>
                        You now have access to all the features. Here's what you
                        can do:
                    </Text>
                    <ul style={list}>
                        <li style={listItem}>
                            Customize your profile and settings
                        </li>
                        <li style={listItem}>
                            Explore the dashboard and analytics
                        </li>
                        <li style={listItem}>Start building amazing things</li>
                    </ul>
                    <Section style={buttonContainer}>
                        <Button style={button} href={dashboardUrl}>
                            Go to Dashboard
                        </Button>
                    </Section>
                    <Text style={text}>
                        If you have any questions, feel free to reach out to our
                        support team.
                    </Text>
                    <Text style={footer}>
                        Welcome aboard!
                        <br />
                        The Iridium Team
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

const list = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
    paddingLeft: '20px',
};

const listItem = {
    marginBottom: '8px',
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

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    marginTop: '32px',
};
