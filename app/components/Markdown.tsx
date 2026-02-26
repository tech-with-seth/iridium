import ReactMarkdown from 'react-markdown';

export function Markdown({ children }: { children: string }) {
    return (
        <ReactMarkdown
            components={{
                // Open links in new tab
                a: ({ children, href, ...props }) => (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                    >
                        {children}
                    </a>
                ),
                hr: () => <hr className="my-4 border-base-content/20" />,
            }}
        >
            {children}
        </ReactMarkdown>
    );
}
