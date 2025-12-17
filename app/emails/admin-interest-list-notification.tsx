import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';

interface AdminInterestListNotificationProps {
    userEmail: string;
    inquiryType: string;
    note?: string;
    timestamp: string;
}

export default function AdminInterestListNotification({
    userEmail,
    inquiryType,
    note,
    timestamp,
}: AdminInterestListNotificationProps) {
    const formattedDate = new Date(timestamp).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
    });

    return (
        <Html>
            <Head />
            <Preview>
                New interest list signup from {userEmail} -{' '}
                {inquiryType === 'business'
                    ? 'Business inquiry'
                    : 'General inquiry'}
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>🎉 New Interest List Signup</Heading>
                    <Text style={intro}>
                        A new user has joined the Iridium interest list:
                    </Text>

                    <Section style={detailsBox}>
                        <Section style={detailRow}>
                            <Text style={label}>Email Address</Text>
                            <Text style={value}>{userEmail}</Text>
                        </Section>

                        <Hr style={divider} />

                        <Section style={detailRow}>
                            <Text style={label}>Inquiry Type</Text>
                            <Text style={value}>
                                {inquiryType === 'business'
                                    ? '💼 Business Opportunity'
                                    : '💬 General Inquiry'}
                            </Text>
                        </Section>

                        {note && (
                            <>
                                <Hr style={divider} />
                                <Section style={detailRow}>
                                    <Text style={label}>Note</Text>
                                    <Text style={noteValue}>{note}</Text>
                                </Section>
                            </>
                        )}

                        <Hr style={divider} />

                        <Section style={detailRow}>
                            <Text style={label}>Signup Date</Text>
                            <Text style={timestampValue}>{formattedDate}</Text>
                        </Section>
                    </Section>

                    <Text style={footer}>
                        This is an automated notification from your Iridium
                        application.
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
    maxWidth: '600px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const h1 = {
    color: '#1a1a1a',
    fontSize: '28px',
    fontWeight: '700',
    margin: '40px 0 16px',
    padding: '0 40px',
    textAlign: 'center' as const,
    letterSpacing: '-0.5px',
};

const intro = {
    color: '#525252',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 32px',
    padding: '0 40px',
    textAlign: 'center' as const,
};

const detailsBox = {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    margin: '0 40px 32px',
    padding: '24px',
};

const detailRow = {
    margin: '0',
};

const label = {
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '0 0 8px',
};

const value = {
    color: '#1a1a1a',
    fontSize: '16px',
    fontWeight: '500',
    margin: '0 0 16px',
    wordBreak: 'break-word' as const,
};

const noteValue = {
    color: '#1a1a1a',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 16px',
    padding: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
};

const timestampValue = {
    color: '#525252',
    fontSize: '15px',
    margin: '0',
    fontFamily: 'monospace',
};

const divider = {
    borderColor: '#e5e7eb',
    margin: '16px 0',
};

const footer = {
    color: '#9ca3af',
    fontSize: '13px',
    lineHeight: '20px',
    marginTop: '32px',
    padding: '0 40px',
    textAlign: 'center' as const,
};
