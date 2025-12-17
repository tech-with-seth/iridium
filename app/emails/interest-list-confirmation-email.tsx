import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';

interface InterestListConfirmationEmailProps {
    userEmail: string;
    inquiryType?: string;
    note?: string;
}

export default function InterestListConfirmationEmail({
    userEmail,
    inquiryType,
    note,
}: InterestListConfirmationEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>
                You're on the list! Get ready for early access to Iridium.
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>You're on the List!</Heading>
                    <Text style={text}>
                        Thanks for your interest in Iridium! We've successfully
                        added <strong>{userEmail}</strong> to our interest list.
                    </Text>
                    {inquiryType && (
                        <Text style={text}>
                            <strong>Inquiry Type:</strong>{' '}
                            {inquiryType === 'business'
                                ? 'Business opportunity'
                                : 'General inquiry'}
                        </Text>
                    )}
                    {note && (
                        <Text style={text}>
                            <strong>Your Note:</strong> {note}
                        </Text>
                    )}
                    <Text style={text}>
                        You'll be among the first to know when we launch.
                        Expect:
                    </Text>
                    <Section style={listContainer}>
                        <Text style={listItem}>
                            ✨ Early access notification
                        </Text>
                        <Text style={listItem}>
                            🎁 Exclusive launch pricing
                        </Text>
                        <Text style={listItem}>📚 Updates on new features</Text>
                    </Section>
                    <Text style={text}>
                        We're working hard to bring Iridium to life and can't
                        wait to share it with you.
                    </Text>
                    <Text style={footer}>
                        Stay tuned,
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
    maxWidth: '580px',
};

const h1 = {
    color: '#333',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '40px 0 20px',
    padding: '0 40px',
    textAlign: 'center' as const,
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
    padding: '0 40px',
};

const listContainer = {
    padding: '0 40px',
    margin: '24px 0',
};

const listItem = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '32px',
    margin: '0',
};

const footer = {
    color: '#8898aa',
    fontSize: '14px',
    lineHeight: '22px',
    marginTop: '48px',
    padding: '0 40px',
};
