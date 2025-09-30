export function meta() {
    return [
        { title: 'TWS Foundations' },
        {
            name: 'description',
            content:
                'Modern full-stack boilerplate with authentication, billing, and AI'
        }
    ];
}

export default function Home() {
    return (
        <div className="p-8">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-8">
                TWS Foundations
            </h1>
        </div>
    );
}
