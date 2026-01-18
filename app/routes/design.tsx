import { useState } from 'react';
import { Form } from 'react-router';
import type { Route } from './+types/design';
import { Accordion, AccordionItem } from '~/components/data-display/Accordion';
import { Alert } from '~/components/feedback/Alert';
import { Avatar, AvatarGroup } from '~/components/data-display/Avatar';
import { Badge } from '~/components/data-display/Badge';
import { Button } from '~/components/actions/Button';
import { Card } from '~/components/data-display/Card';
import { Checkbox } from '~/components/data-input/Checkbox';
import { Code } from '~/components/mockup/Code';
import { Container } from '~/components/layout/Container';
import { Diff } from '~/components/data-display/Diff';
import { FileInput } from '~/components/data-input/FileInput';
import { Hero } from '~/components/layout/Hero';
import { HoverCard } from '~/components/data-display/HoverCard';
import { Modal, ModalActions } from '~/components/actions/Modal';
import { Radio } from '~/components/data-input/Radio';
import { Range } from '~/components/data-input/Range';
import { Select } from '~/components/data-input/Select';
import { Timeline, TimelineItem } from '~/components/data-display/Timeline';
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableHeaderCell,
    TableCell,
} from '~/components/data-display/Table';
import { Tab, Tabs } from '~/components/navigation/Tabs';
import { Textarea } from '~/components/data-input/Textarea';
import { TextInput } from '~/components/data-input/TextInput';
import { Toggle } from '~/components/data-input/Toggle';
import { Tooltip } from '~/components/feedback/Tooltip';
import { cx } from '~/cva.config';
import { createSignedDownloadUrl, uploadObject } from '~/lib/s3.server';

const DESIGN_TIMELINE_INDICATOR_CLASSES: Record<
    'positive' | 'warning' | 'info' | 'error',
    string
> = {
    positive: 'bg-success',
    warning: 'bg-warning',
    info: 'bg-info',
    error: 'bg-error',
};

const DESIGN_TIMELINE_STEPS = [
    {
        id: 'research',
        title: 'Research & Direction',
        timestamp: 'Jan 2024',
        description: 'Validated brand voice with stakeholder interviews.',
        tone: 'positive' as const,
    },
    {
        id: 'system',
        title: 'Component System',
        timestamp: 'Apr 2024',
        description: 'Documented spacing, elevation, and interaction tokens.',
        tone: 'info' as const,
    },
    {
        id: 'polish',
        title: 'Polish & Launch',
        timestamp: 'Aug 2024',
        description: 'QA, accessibility checks, and production rollout.',
        tone: 'warning' as const,
    },
];

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function action({ request }: Route.ActionArgs) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!(file instanceof File) || file.size === 0) {
            return { error: 'Please choose a file to upload.' };
        }

        if (file.size > MAX_UPLOAD_SIZE) {
            return {
                error: 'File is too large. Max size is 5 MB.',
            };
        }

        if (file.type && !ALLOWED_IMAGE_TYPES.has(file.type)) {
            return {
                error: 'Unsupported file type. Use PNG, JPG, or WEBP.',
            };
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uploadKey = `uploads/${Date.now()}-${safeName}`;
        const buffer = new Uint8Array(await file.arrayBuffer());

        await uploadObject({
            key: uploadKey,
            body: buffer,
            contentType: file.type || undefined,
        });

        const signedUrl = await createSignedDownloadUrl({
            key: uploadKey,
            expiresIn: 3600,
        });

        return {
            uploadedKey: uploadKey,
            signedUrl,
        };
    } catch (error) {
        return {
            error:
                error instanceof Error
                    ? error.message
                    : 'Upload failed. Please try again.',
        };
    }
}

export default function DesignRoute({ actionData }: Route.ComponentProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const DisplayBox = ({
        children,
        className,
    }: {
        children: React.ReactNode;
        className?: string;
    }) => (
        <div className={cx(`bg-base-200 p-4 rounded-box`, className)}>
            {children}
        </div>
    );

    return (
        <>
            <title>Design | Iridium</title>
            <meta
                name="description"
                content="Explore and interact with various design components"
            />
            <Container className="flex flex-col gap-12 pb-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 bg-base-100 rounded-box p-8">
                    <div className="col-span-2">
                        <h1 className="text-4xl font-bold">
                            Component Showcase
                        </h1>
                    </div>
                    {/* 3D Hover Cards Section */}
                    <section className="flex h-full flex-col gap-4">
                        <h2 className="text-2xl font-bold">3D Hover Card</h2>
                        <p className="text-base-content/70">
                            Hover over the image to see the 3D tilt effect that
                            follows your mouse movement.
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center py-8">
                            <HoverCard>
                                <div className="card md:w-96 bg-black text-white bg-[radial-gradient(circle_at_bottom_left,#ffffff04_35%,transparent_36%),radial-gradient(circle_at_top_right,#ffffff04_35%,transparent_36%)] bg-size-[4.95em_4.95em]">
                                    <div className="card-body">
                                        <div className="flex justify-between mb-10">
                                            <div className="font-bold">
                                                BANK OF IRIDIUM
                                            </div>
                                            <div className="text-5xl opacity-50 grayscale">
                                                🤑
                                            </div>
                                        </div>
                                        <div className="text-lg mb-4 opacity-40">
                                            4242 4242 4242 4242
                                        </div>
                                        <div className="flex justify-between">
                                            <div>
                                                <div className="text-xs opacity-20">
                                                    CARD HOLDER
                                                </div>
                                                <div>SETH DAVIS</div>
                                            </div>
                                            <div>
                                                <div className="text-xs opacity-20">
                                                    EXPIRES
                                                </div>
                                                <div>08/28</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </HoverCard>
                        </div>
                        <Code
                            className="mt-auto"
                            lines={[
                                { content: '<HoverCard>' },
                                {
                                    content:
                                        '  <figure className="rounded-box">',
                                },
                                {
                                    content:
                                        '    <img src="/image.jpg" alt="Demo" />',
                                },
                                { content: '  </figure>' },
                                { content: '</HoverCard>' },
                            ]}
                        />
                    </section>
                    {/* File Input Section */}
                    <section className="flex h-full flex-col gap-4">
                        <h2 className="text-2xl font-bold">File Upload</h2>
                        <p className="text-base-content/70">
                            This demo posts the file to the server, stores it in
                            the Railway S3 bucket, and returns a signed download
                            link that expires in 1 hour.
                        </p>
                        <ul className="list-disc pl-5 text-sm text-base-content/70 space-y-1">
                            <li>
                                Files are private by default and only accessible
                                via presigned URLs.
                            </li>
                            <li>
                                Requires{' '}
                                <span className="font-semibold">S3_*</span>{' '}
                                environment variables on the server.
                            </li>
                        </ul>

                        <Form
                            method="POST"
                            encType="multipart/form-data"
                            className="space-y-4"
                        >
                            <FileInput
                                className='w-full'
                                name="file"
                                label="Upload a file"
                                helperText="PNG, JPG, or WEBP up to 5 MB"
                                accept=".png,.jpg,.jpeg,.webp"
                                color="primary"
                                size="lg"
                                error={actionData?.error}
                            />
                            <Button type="submit" status="primary">
                                Upload File
                            </Button>
                        </Form>
                        {actionData?.signedUrl && (
                            <Alert status="success">
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold">
                                        Upload successful
                                    </span>
                                    <span className="text-xs text-base-content/70">
                                        Key: {actionData.uploadedKey}
                                    </span>
                                    <a
                                        href={actionData.signedUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="link link-primary text-sm"
                                    >
                                        View temporary link
                                    </a>
                                </div>
                            </Alert>
                        )}
                        <Code
                            className="mt-auto"
                            lines={[
                                {
                                    content:
                                        '<Form method="post" encType="multipart/form-data">',
                                },
                                { content: '  <FileInput' },
                                { content: '    name="file"' },
                                {
                                    content: '    label="Upload a file"',
                                },
                                {
                                    content:
                                        '    helperText="PNG, JPG, or WEBP"',
                                },
                                { content: '    color="primary"' },
                                { content: '    error={actionData?.error}' },
                                { content: '  />' },
                                {
                                    content:
                                        '  <Button type="submit">Upload</Button>',
                                },
                                { content: '</Form>' },
                            ]}
                        />
                    </section>
                    {/* Buttons Section */}
                    <section className="flex h-full flex-col gap-4">
                        <h2 className="text-2xl font-bold">Buttons</h2>

                        <div className="flex flex-1 flex-col gap-6">
                            <div className="flex flex-col gap-3">
                                <h2 className="text-2xl font-bold">Variants</h2>
                                <div className="flex flex-wrap gap-4 mb-3">
                                    <Button>Default</Button>
                                    <Button variant="outline">Outline</Button>
                                    <Button variant="soft">Soft</Button>
                                    <Button variant="dash">Dash</Button>
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="link">Link</Button>
                                </div>
                                <Code
                                    className="mt-auto"
                                    lines={[
                                        { content: '<Button>Outline</Button>' },
                                        {
                                            content:
                                                '<Button variant="outline">Outline</Button>',
                                        },
                                        {
                                            content:
                                                '<Button variant="soft">Soft</Button>',
                                        },
                                        {
                                            content:
                                                '<Button variant="dash">Dash</Button>',
                                        },
                                        {
                                            content:
                                                '<Button variant="ghost">Ghost</Button>',
                                        },
                                        {
                                            content:
                                                '<Button variant="link">Link</Button>',
                                        },
                                    ]}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <h2 className="text-2xl font-bold">Colors</h2>
                                <div className="flex flex-wrap gap-4 mb-3">
                                    <Button status="accent">Accent</Button>
                                    <Button status="error">Error</Button>
                                    <Button status="info">Info</Button>
                                    <Button status="neutral">Neutral</Button>
                                    <Button status="primary">Primary</Button>
                                    <Button status="secondary">
                                        Secondary
                                    </Button>
                                    <Button status="success">Success</Button>
                                    <Button status="warning">Warning</Button>
                                </div>
                                <Code
                                    className="mt-auto"
                                    lines={[
                                        {
                                            content:
                                                '<Button status="primary">Primary</Button>',
                                        },
                                        {
                                            content:
                                                '<Button status="error">Error</Button>',
                                        },
                                    ]}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <h2 className="text-2xl font-bold">Shapes</h2>
                                <div className="flex flex-wrap gap-4 mb-3">
                                    <Button square>+</Button>
                                    <Button circle>+</Button>
                                    <Button wide>Wide</Button>
                                </div>
                                <Code
                                    className="mt-auto"
                                    lines={[
                                        {
                                            content:
                                                '<Button circle>+</Button>',
                                        },
                                        {
                                            content:
                                                '<Button wide>Wide</Button>',
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    </section>
                    {/* Form Controls Section */}
                    <section className="flex h-full flex-col gap-4">
                        <h2 className="text-2xl font-bold">Text input</h2>
                        <div className="flex h-full flex-col gap-3">
                            <h3 className="text-lg font-semibold">
                                With Label
                            </h3>
                            <DisplayBox>
                                <TextInput
                                    label="Text Input"
                                    placeholder="Enter text..."
                                />
                            </DisplayBox>
                            <h3 className="text-lg font-semibold">
                                Helper text
                            </h3>
                            <DisplayBox>
                                <TextInput
                                    placeholder="Enter text..."
                                    helperText="This is helper text"
                                />
                            </DisplayBox>
                            <h3 className="text-lg font-semibold">Full</h3>
                            <DisplayBox>
                                <TextInput
                                    label="Text Input"
                                    placeholder="Enter text..."
                                    helperText="This is helper text"
                                />
                            </DisplayBox>
                            <h3 className="text-lg font-semibold">Errors</h3>
                            <DisplayBox>
                                <TextInput
                                    label="Text Input"
                                    placeholder="Enter text..."
                                    helperText="This is helper text"
                                    error="This is broken!"
                                />
                            </DisplayBox>
                            <Code
                                className="mt-auto"
                                lines={[
                                    { content: '<TextInput' },
                                    { content: '  label="Text Input"' },
                                    {
                                        content:
                                            '  placeholder="Enter text..."',
                                    },
                                    { content: '  helperText="Helper text"' },
                                    { content: '/>' },
                                ]}
                            />
                        </div>
                    </section>
                    <section className="flex h-full flex-col gap-3">
                        <h2 className="text-2xl font-bold">Select</h2>
                        <Select
                            label="Important Text"
                            options={[
                                { value: '1', label: 'Option 1' },
                                { value: '2', label: 'Option 2' },
                                { value: '3', label: 'Option 3' },
                            ]}
                            helperText="Choose an option"
                        />
                        <Code
                            className="mt-auto"
                            lines={[
                                { content: '<Select' },
                                { content: '  label="Select"' },
                                { content: '  options={options}' },
                                { content: '/>' },
                            ]}
                        />
                    </section>
                    <section className="flex h-full flex-col gap-3">
                        <h2 className="text-2xl font-bold">Textarea</h2>
                        <Textarea
                            label="Very important text"
                            placeholder="Enter longer text..."
                            rows={3}
                        />
                        <Code
                            className="mt-auto"
                            lines={[
                                { content: '<Textarea' },
                                { content: '  label="Very important text"' },
                                { content: '  rows={3}' },
                                { content: '/>' },
                            ]}
                        />
                    </section>
                    <section className="flex h-full flex-col gap-3">
                        <h2 className="text-2xl font-bold">Checkbox</h2>
                        <Checkbox label="Checkbox Option" />
                        <Code
                            className="mt-auto"
                            lines={[{ content: '<Checkbox label="Option" />' }]}
                        />
                    </section>
                    <section className="flex h-full flex-col gap-3">
                        <h2 className="text-2xl font-bold">Radio</h2>
                        <Radio label="Radio Option" name="radio-demo" />
                        <Code
                            className="mt-auto"
                            lines={[
                                {
                                    content:
                                        '<Radio label="Option" name="group" />',
                                },
                            ]}
                        />
                    </section>
                    <section className="flex h-full flex-col gap-3">
                        <h2 className="text-2xl font-bold">Toggle</h2>
                        <Toggle label="Toggle Option" />
                        <Code
                            className="mt-auto"
                            lines={[{ content: '<Toggle label="Option" />' }]}
                        />
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold">Range</h2>
                        <Range
                            label="Range Slider"
                            min={0}
                            max={100}
                            defaultValue={50}
                            className="mb-8"
                        />
                        <Code
                            className="mt-auto"
                            lines={[
                                { content: '<Range' },
                                { content: '  label="Range Slider"' },
                                { content: '  min={0} max={100}' },
                                { content: '/>' },
                            ]}
                        />
                    </section>

                    <section className="flex h-full flex-col gap-6">
                        <h2 className="text-2xl font-bold">Timeline</h2>
                        <DisplayBox>
                            <Timeline
                                direction="vertical"
                                snapIcon
                                className="w-full max-w-lg"
                            >
                                {DESIGN_TIMELINE_STEPS.map((step, index) => (
                                    <TimelineItem
                                        key={step.id}
                                        start={
                                            <span className="text-sm font-semibold text-base-content/70">
                                                {step.timestamp}
                                            </span>
                                        }
                                        middle={
                                            <span
                                                className={`inline-flex h-3 w-3 rounded-full ${DESIGN_TIMELINE_INDICATOR_CLASSES[step.tone]}`}
                                            />
                                        }
                                        end={
                                            <div className="space-y-1">
                                                <p className="font-semibold">
                                                    {step.title}
                                                </p>
                                                <p className="text-sm text-base-content/70">
                                                    {step.description}
                                                </p>
                                            </div>
                                        }
                                        boxEnd
                                        lineBefore={index !== 0}
                                        lineAfter={
                                            index !==
                                            DESIGN_TIMELINE_STEPS.length - 1
                                        }
                                    />
                                ))}
                            </Timeline>
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                {
                                    content:
                                        '<Timeline direction="vertical" snapIcon>',
                                },
                                {
                                    content:
                                        '<TimelineItem start="Jan 2024" end="Research" />',
                                },
                                {
                                    content:
                                        '<TimelineItem start="Aug 2024" end="Launch" />',
                                },
                                { content: '</Timeline>' },
                            ]}
                        />
                    </section>

                    <section className="flex h-full flex-col gap-6">
                        <h2 className="text-2xl font-bold">Alerts</h2>
                        <DisplayBox>
                            <div className="flex flex-col gap-3">
                                <Alert status="info">
                                    <span>
                                        Information: This is an info alert
                                        message
                                    </span>
                                </Alert>
                                <Alert status="success">
                                    <span>
                                        Success: Operation completed
                                        successfully
                                    </span>
                                </Alert>
                                <Alert status="warning">
                                    <span>
                                        Warning: Please review before proceeding
                                    </span>
                                </Alert>
                                <Alert status="error">
                                    <span>Error: Something went wrong</span>
                                </Alert>
                                <Alert status="info" variant="outline">
                                    <span>Outlined info alert</span>
                                </Alert>
                                <Alert status="success" variant="soft">
                                    <span>Soft success alert</span>
                                </Alert>
                                <Alert
                                    status="warning"
                                    icon={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 shrink-0 stroke-current"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                            />
                                        </svg>
                                    }
                                >
                                    <span>Alert with custom icon</span>
                                </Alert>
                            </div>
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                { content: '<Alert status="info">' },
                                { content: '  <span>Info message</span>' },
                                { content: '</Alert>' },
                                { content: '' },
                                {
                                    content:
                                        '<Alert status="success" variant="outline">',
                                },
                                { content: '  <span>Outlined success</span>' },
                                { content: '</Alert>' },
                                { content: '' },
                                {
                                    content:
                                        '<Alert status="warning" icon={<Icon />}>',
                                },
                                { content: '  <span>With icon</span>' },
                                { content: '</Alert>' },
                            ]}
                        />
                    </section>

                    <section className="flex h-full flex-col gap-6">
                        <h2 className="text-2xl font-bold">Badges</h2>
                        <DisplayBox>
                            <div className="flex flex-wrap gap-2">
                                <Badge color="primary">Primary</Badge>
                                <Badge color="secondary">Secondary</Badge>
                                <Badge color="accent">Accent</Badge>
                                <Badge variant="outline" color="success">
                                    Outline
                                </Badge>
                                <Badge variant="soft" color="warning">
                                    Soft
                                </Badge>
                                <Badge variant="ghost" color="error">
                                    Ghost
                                </Badge>
                            </div>
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                {
                                    content:
                                        '<Badge color="primary">Primary</Badge>',
                                },
                                {
                                    content:
                                        '<Badge variant="outline">Outline</Badge>',
                                },
                            ]}
                        />
                    </section>

                    {/* Data Display Section */}
                    <section className="flex h-full flex-col gap-6">
                        <h2 className="text-2xl font-bold">Cards</h2>
                        <DisplayBox>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Card
                                    title="Card Title"
                                    variant="border"
                                    actions={<Button size="sm">Action</Button>}
                                >
                                    <p>Card content goes here</p>
                                </Card>

                                <Card
                                    title="With Image"
                                    image={{
                                        src: 'https://picsum.photos/400/200',
                                        alt: 'Placeholder',
                                    }}
                                >
                                    <p>Image at top</p>
                                </Card>

                                <Card size="lg" variant="dash">
                                    <p>Large card with dash border</p>
                                </Card>
                            </div>
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                {
                                    content:
                                        '<Card title="Title" variant="border">',
                                },
                                { content: '  <p>Content</p>' },
                                { content: '</Card>' },
                            ]}
                        />
                    </section>

                    <section className="flex h-full flex-col gap-6">
                        <h2 className="text-2xl font-bold">Avatars</h2>
                        <DisplayBox>
                            <div className="flex flex-wrap items-center gap-4">
                                <Avatar
                                    src="https://picsum.photos/100/100"
                                    size="lg"
                                />
                                <Avatar status="online" placeholder>
                                    <span className="text-xl">AB</span>
                                </Avatar>
                                <Avatar
                                    src="https://picsum.photos/101/101"
                                    shape="squircle"
                                    size="lg"
                                />
                                <AvatarGroup>
                                    <Avatar src="https://picsum.photos/102/102" />
                                    <Avatar src="https://picsum.photos/103/103" />
                                    <Avatar src="https://picsum.photos/104/104" />
                                </AvatarGroup>
                            </div>
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                {
                                    content:
                                        '<Avatar src="/img.jpg" size="lg" />',
                                },
                                {
                                    content:
                                        '<Avatar status="online" placeholder>AB</Avatar>',
                                },
                                { content: '<AvatarGroup>...</AvatarGroup>' },
                            ]}
                        />
                    </section>
                    <section className="flex h-full flex-col gap-6">
                        <h2 className="text-2xl font-bold">Table</h2>
                        <DisplayBox>
                            <div className="overflow-x-auto">
                                <Table zebra scrollable>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>
                                                Name
                                            </TableHeaderCell>
                                            <TableHeaderCell>
                                                Role
                                            </TableHeaderCell>
                                            <TableHeaderCell>
                                                Status
                                            </TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow hover>
                                            <TableCell>John Doe</TableCell>
                                            <TableCell>Developer</TableCell>
                                            <TableCell>
                                                <Badge color="success">
                                                    Active
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell>Jane Smith</TableCell>
                                            <TableCell>Designer</TableCell>
                                            <TableCell>
                                                <Badge color="warning">
                                                    Away
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell>Bob Johnson</TableCell>
                                            <TableCell>Manager</TableCell>
                                            <TableCell>
                                                <Badge color="error">
                                                    Offline
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                { content: '<Table zebra scrollable>' },
                                {
                                    content:
                                        '  <TableHead>...<TableRow>...</TableHead>',
                                },
                                {
                                    content:
                                        '  <TableBody>...<TableRow hover>...</TableBody>',
                                },
                                { content: '</Table>' },
                            ]}
                        />
                    </section>

                    <section className="flex h-full flex-col gap-6">
                        <h2 className="text-2xl font-bold">Hero</h2>
                        <DisplayBox>
                            <Hero
                                overlay
                                image="https://picsum.photos/1200/400"
                                className="rounded-box min-h-[300px]"
                            >
                                <div className="text-center text-neutral-content">
                                    <h1 className="text-5xl font-bold">
                                        Hero Section
                                    </h1>
                                    <p className="py-6">
                                        A large featured section with overlay
                                    </p>
                                    <Button status="primary">
                                        Get Started
                                    </Button>
                                </div>
                            </Hero>
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                { content: '<Hero overlay image="/bg.jpg">' },
                                { content: '  <div>Content</div>' },
                                { content: '</Hero>' },
                            ]}
                        />
                    </section>

                    {/* Layout & Navigation Section */}
                    <section className="flex h-full flex-col gap-6">
                        <h2 className="text-2xl font-bold">Tabs</h2>
                        <DisplayBox>
                            <div className="flex flex-col gap-4">
                                <Tabs variant="box">
                                    <Tab
                                        active={activeTab === 0}
                                        onClick={() => setActiveTab(0)}
                                    >
                                        Tab 1
                                    </Tab>
                                    <Tab
                                        active={activeTab === 1}
                                        onClick={() => setActiveTab(1)}
                                    >
                                        Tab 2
                                    </Tab>
                                    <Tab
                                        active={activeTab === 2}
                                        onClick={() => setActiveTab(2)}
                                    >
                                        Tab 3
                                    </Tab>
                                </Tabs>
                                <div className="rounded-b-lg bg-base-200 p-4">
                                    Tab {activeTab + 1} content
                                </div>
                            </div>
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                { content: '<Tabs variant="box">' },
                                {
                                    content:
                                        '  <Tab active={active}>Tab 1</Tab>',
                                },
                                { content: '  <Tab>Tab 2</Tab>' },
                                { content: '</Tabs>' },
                            ]}
                        />
                    </section>
                    <section className="flex h-full flex-col gap-6">
                        <h2 className="text-2xl font-bold">Accordion</h2>
                        <DisplayBox>
                            <Accordion name="demo-accordion">
                                <AccordionItem
                                    title="First Item"
                                    name="demo-accordion"
                                    variant="arrow"
                                    defaultOpen
                                >
                                    Content for the first accordion item
                                </AccordionItem>
                                <AccordionItem
                                    title="Second Item"
                                    name="demo-accordion"
                                    variant="arrow"
                                >
                                    Content for the second accordion item
                                </AccordionItem>
                                <AccordionItem
                                    title="Third Item"
                                    name="demo-accordion"
                                    variant="plus"
                                >
                                    Content for the third accordion item with
                                    plus icon
                                </AccordionItem>
                            </Accordion>
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                { content: '<Accordion name="group">' },
                                {
                                    content:
                                        '  <AccordionItem title="Item" name="group" variant="arrow">',
                                },
                                { content: '    Content' },
                                { content: '  </AccordionItem>' },
                                { content: '</Accordion>' },
                            ]}
                        />
                    </section>

                    {/* Interactive Section */}
                    <section className="flex h-full flex-col gap-6">
                        <h2 className="text-2xl font-bold">Modal</h2>
                        <DisplayBox>
                            <div className="flex flex-col gap-4">
                                <Button onClick={() => setModalOpen(true)}>
                                    Open Modal
                                </Button>
                                <Modal
                                    open={modalOpen}
                                    onClose={() => setModalOpen(false)}
                                    title="Modal Title"
                                    placement="middle"
                                >
                                    <p className="py-4">
                                        This is modal content. You can put any
                                        content here.
                                    </p>
                                    <ModalActions>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setModalOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            status="primary"
                                            onClick={() => setModalOpen(false)}
                                        >
                                            Confirm
                                        </Button>
                                    </ModalActions>
                                </Modal>
                            </div>
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                {
                                    content:
                                        '<Modal open={open} onClose={handleClose} title="Title">',
                                },
                                { content: '  <p>Content</p>' },
                                {
                                    content:
                                        '  <ModalActions>...</ModalActions>',
                                },
                                { content: '</Modal>' },
                            ]}
                        />
                    </section>

                    <section className="flex h-full flex-col gap-6">
                        <h2 className="text-2xl font-bold">Diff Comparison</h2>
                        <DisplayBox>
                            <Diff
                                aspectRatio="aspect-video"
                                item1={
                                    <img
                                        src="https://picsum.photos/seed/before/1200/675"
                                        alt="Before"
                                    />
                                }
                                item2={
                                    <img
                                        src="https://picsum.photos/seed/after/1200/675"
                                        alt="After"
                                    />
                                }
                            />
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                { content: '<Diff' },
                                { content: '  aspectRatio="aspect-16/9"' },
                                {
                                    content:
                                        '  item1={<img src="/before.jpg" />}',
                                },
                                {
                                    content:
                                        '  item2={<img src="/after.jpg" />}',
                                },
                                { content: '/>' },
                            ]}
                        />
                    </section>

                    <section className="flex h-full flex-col gap-6">
                        <h2 className="text-2xl font-bold">Custom Content</h2>
                        <DisplayBox>
                            <div className="flex flex-wrap gap-4">
                                <Tooltip
                                    content={
                                        <div className="-rotate-10 text-2xl font-black text-orange-400 animate-bounce">
                                            Wow!
                                        </div>
                                    }
                                    open
                                >
                                    <Button>Custom Content</Button>
                                </Tooltip>
                            </div>
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                { content: '<Tooltip' },
                                {
                                    content:
                                        '  content={<div>Custom JSX</div>}',
                                },
                                { content: '>' },
                                { content: '  <Button>Hover me</Button>' },
                                { content: '</Tooltip>' },
                            ]}
                        />
                        <h3 className="text-lg font-semibold">Positions</h3>
                        <DisplayBox>
                            <div className="flex flex-wrap gap-4">
                                <Tooltip tip="Top tooltip" position="top" open>
                                    <Button>Top</Button>
                                </Tooltip>
                                <Tooltip
                                    tip="Bottom tooltip"
                                    position="bottom"
                                    open
                                >
                                    <Button>Bottom</Button>
                                </Tooltip>
                                <Tooltip
                                    tip="Left tooltip"
                                    position="left"
                                    open
                                >
                                    <Button>Left</Button>
                                </Tooltip>
                                <Tooltip
                                    tip="Right tooltip"
                                    position="right"
                                    open
                                >
                                    <Button>Right</Button>
                                </Tooltip>
                            </div>
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                {
                                    content:
                                        '<Tooltip tip="Hello" position="top">',
                                },
                                { content: '  <Button>Hover me</Button>' },
                                { content: '</Tooltip>' },
                            ]}
                        />
                        <h3 className="text-lg font-semibold">Colors</h3>
                        <DisplayBox>
                            <div className="flex flex-wrap gap-4">
                                <Tooltip tip="Neutral" color="neutral" open>
                                    <Button status="neutral">Neutral</Button>
                                </Tooltip>
                                <Tooltip tip="Primary" color="primary" open>
                                    <Button status="primary">Primary</Button>
                                </Tooltip>
                                <Tooltip tip="Secondary" color="secondary" open>
                                    <Button status="secondary">
                                        Secondary
                                    </Button>
                                </Tooltip>
                                <Tooltip tip="Accent" color="accent" open>
                                    <Button status="accent">Accent</Button>
                                </Tooltip>
                                <Tooltip tip="Info" color="info" open>
                                    <Button status="info">Info</Button>
                                </Tooltip>
                                <Tooltip tip="Success" color="success" open>
                                    <Button status="success">Success</Button>
                                </Tooltip>
                                <Tooltip tip="Warning" color="warning" open>
                                    <Button status="warning">Warning</Button>
                                </Tooltip>
                                <Tooltip tip="Error" color="error" open>
                                    <Button status="error">Error</Button>
                                </Tooltip>
                            </div>
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                {
                                    content:
                                        '<Tooltip tip="Info" color="info">',
                                },
                                { content: '  <Button>Hover me</Button>' },
                                { content: '</Tooltip>' },
                            ]}
                        />
                        <h3 className="text-lg font-semibold">
                            Interactive (Hover)
                        </h3>
                        <DisplayBox>
                            <div className="flex flex-wrap gap-4">
                                <Tooltip tip="Hover over me!">
                                    <Button>Hover me</Button>
                                </Tooltip>
                                <Tooltip
                                    tip="This tooltip appears on hover"
                                    position="bottom"
                                >
                                    <Button variant="outline">
                                        Another one
                                    </Button>
                                </Tooltip>
                            </div>
                        </DisplayBox>
                        <Code
                            className="mt-auto"
                            lines={[
                                {
                                    content: '<Tooltip tip="Appears on hover">',
                                },
                                { content: '  <Button>Hover me</Button>' },
                                { content: '</Tooltip>' },
                            ]}
                        />
                    </section>
                </div>
                <Alert status="success">
                    <div>
                        <h3 className="font-bold">
                            Looking for more components?
                        </h3>
                        <div className="text-xs">
                            Explore the complete DaisyUI component library and
                            usage guidelines at:
                            <a
                                href="https://daisyui.com/components/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline ml-1"
                            >
                                daisyui.com/components
                            </a>
                        </div>
                    </div>
                </Alert>
            </Container>
        </>
    );
}
