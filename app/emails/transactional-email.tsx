import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text
} from '@react-email/components';

interface TransactionalEmailProps {
    heading: string;
    previewText: string;
    message: string;
    buttonText?: string;
    buttonUrl?: string;
    footerText?: string;
}

export default function TransactionalEmail({
    heading,
    previewText,
    message,
    buttonText,
    buttonUrl,
    footerText
}: TransactionalEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>{heading}</Heading>
                    <Text style={text}>{message}</Text>
                    {buttonText && buttonUrl && (
                        <Section style={buttonContainer}>
                            <Button style={button} href={buttonUrl}>
                                {buttonText}
                            </Button>
                        </Section>
                    )}
                    {footerText && <Text style={footer}>{footerText}</Text>}
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
    margin: '16px 0',
    whiteSpace: 'pre-wrap' as const
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

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    marginTop: '32px'
};
