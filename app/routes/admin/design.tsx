import { useState } from 'react';
import { Accordion, AccordionItem } from '~/components/Accordion';
import { Avatar, AvatarGroup } from '~/components/Avatar';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { Card } from '~/components/Card';
import { Checkbox } from '~/components/Checkbox';
import { Code } from '~/components/Code';
import { Container } from '~/components/Container';
import { Diff } from '~/components/Diff';
import { Hero } from '~/components/Hero';
import { Modal, ModalActions } from '~/components/Modal';
import { Radio } from '~/components/Radio';
import { Range } from '~/components/Range';
import { Select } from '~/components/Select';
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableHeaderCell,
    TableCell
} from '~/components/Table';
import { Tab, Tabs } from '~/components/Tabs';
import { Textarea } from '~/components/Textarea';
import { TextInput } from '~/components/TextInput';
import { Toggle } from '~/components/Toggle';

export default function DesignRoute() {
    const [modalOpen, setModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    return (
        <Container className="flex flex-col gap-12 py-8">
            <h1 className="text-4xl font-bold">Design System Showcase</h1>

            {/* Buttons Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold">Buttons</h2>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Variants</h3>
                        <div className="flex flex-wrap gap-4 mb-3">
                            <Button variant="dash">Dash</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="link">Link</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="soft">Soft</Button>
                        </div>
                        <Code
                            lines={[
                                { content: '<Button variant="outline">Outline</Button>' },
                                { content: '<Button variant="soft">Soft</Button>' }
                            ]}
                        />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Colors</h3>
                        <div className="flex flex-wrap gap-4 mb-3">
                            <Button status="accent">Accent</Button>
                            <Button status="error">Error</Button>
                            <Button status="info">Info</Button>
                            <Button status="neutral">Neutral</Button>
                            <Button status="primary">Primary</Button>
                            <Button status="secondary">Secondary</Button>
                            <Button status="success">Success</Button>
                            <Button status="warning">Warning</Button>
                        </div>
                        <Code
                            lines={[
                                { content: '<Button status="primary">Primary</Button>' },
                                { content: '<Button status="error">Error</Button>' }
                            ]}
                        />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Shapes</h3>
                        <div className="flex flex-wrap gap-4 mb-3">
                            <Button square>+</Button>
                            <Button circle>+</Button>
                            <Button wide>Wide</Button>
                        </div>
                        <Code
                            lines={[
                                { content: '<Button circle>+</Button>' },
                                { content: '<Button wide>Wide</Button>' }
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* Form Controls Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold">Form Controls</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <TextInput
                            label="Text Input"
                            placeholder="Enter text..."
                            helperText="This is helper text"
                        />
                        <Code
                            lines={[
                                { content: '<TextInput' },
                                { content: '  label="Text Input"' },
                                { content: '  placeholder="Enter text..."' },
                                { content: '  helperText="Helper text"' },
                                { content: '/>' }
                            ]}
                        />
                    </div>

                    <div className="space-y-3">
                        <Select
                            label="Select"
                            options={[
                                { value: '1', label: 'Option 1' },
                                { value: '2', label: 'Option 2' },
                                { value: '3', label: 'Option 3' }
                            ]}
                            helperText="Choose an option"
                        />
                        <Code
                            lines={[
                                { content: '<Select' },
                                { content: '  label="Select"' },
                                { content: '  options={options}' },
                                { content: '/>' }
                            ]}
                        />
                    </div>

                    <div className="space-y-3">
                        <Textarea
                            label="Textarea"
                            placeholder="Enter longer text..."
                            rows={3}
                        />
                        <Code
                            lines={[
                                { content: '<Textarea' },
                                { content: '  label="Textarea"' },
                                { content: '  rows={3}' },
                                { content: '/>' }
                            ]}
                        />
                    </div>

                    <div className="space-y-3">
                        <Checkbox label="Checkbox Option" />
                        <Radio label="Radio Option" name="radio-demo" />
                        <Toggle label="Toggle Option" />
                        <Code
                            lines={[
                                { content: '<Checkbox label="Option" />' },
                                { content: '<Radio label="Option" name="group" />' },
                                { content: '<Toggle label="Option" />' }
                            ]}
                        />
                    </div>

                    <div className="space-y-3">
                        <Range
                            label="Range Slider"
                            min={0}
                            max={100}
                            defaultValue={50}
                        />
                        <Code
                            lines={[
                                { content: '<Range' },
                                { content: '  label="Range Slider"' },
                                { content: '  min={0} max={100}' },
                                { content: '/>' }
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* Data Display Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold">Data Display</h2>

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Cards</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
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
                                alt: 'Placeholder'
                            }}
                        >
                            <p>Image at top</p>
                        </Card>

                        <Card size="lg" variant="dash">
                            <p>Large card with dash border</p>
                        </Card>
                    </div>
                    <Code
                        lines={[
                            { content: '<Card title="Title" variant="border">' },
                            { content: '  <p>Content</p>' },
                            { content: '</Card>' }
                        ]}
                    />
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Badges</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
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
                    <Code
                        lines={[
                            { content: '<Badge color="primary">Primary</Badge>' },
                            { content: '<Badge variant="outline">Outline</Badge>' }
                        ]}
                    />
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Avatars</h3>
                    <div className="flex flex-wrap gap-4 items-center mb-3">
                        <Avatar
                            src="https://picsum.photos/100/100"
                            size={16}
                        />
                        <Avatar status="online" placeholder>
                            <span className="text-xl">AB</span>
                        </Avatar>
                        <Avatar
                            src="https://picsum.photos/101/101"
                            shape="squircle"
                            size={16}
                        />
                        <AvatarGroup>
                            <Avatar src="https://picsum.photos/102/102" />
                            <Avatar src="https://picsum.photos/103/103" />
                            <Avatar src="https://picsum.photos/104/104" />
                        </AvatarGroup>
                    </div>
                    <Code
                        lines={[
                            { content: '<Avatar src="/img.jpg" size={16} />' },
                            { content: '<Avatar status="online" placeholder>AB</Avatar>' },
                            { content: '<AvatarGroup>...</AvatarGroup>' }
                        ]}
                    />
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Table</h3>
                    <div className="mb-3">
                        <Table zebra scrollable>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Name</TableHeaderCell>
                                    <TableHeaderCell>Role</TableHeaderCell>
                                    <TableHeaderCell>Status</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow hover>
                                    <TableCell>John Doe</TableCell>
                                    <TableCell>Developer</TableCell>
                                    <TableCell>
                                        <Badge color="success">Active</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow hover>
                                    <TableCell>Jane Smith</TableCell>
                                    <TableCell>Designer</TableCell>
                                    <TableCell>
                                        <Badge color="warning">Away</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow hover>
                                    <TableCell>Bob Johnson</TableCell>
                                    <TableCell>Manager</TableCell>
                                    <TableCell>
                                        <Badge color="error">Offline</Badge>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <Code
                        lines={[
                            { content: '<Table zebra scrollable>' },
                            { content: '  <TableHead>...<TableRow>...</TableHead>' },
                            { content: '  <TableBody>...<TableRow hover>...</TableBody>' },
                            { content: '</Table>' }
                        ]}
                    />
                </div>
            </section>

            {/* Layout & Navigation Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold">Layout & Navigation</h2>

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Hero</h3>
                    <div className="mb-3">
                        <Hero
                            overlay
                            image="https://picsum.photos/1200/400"
                            className="rounded-lg min-h-[300px]"
                        >
                            <div className="text-center text-neutral-content">
                                <h1 className="text-5xl font-bold">
                                    Hero Section
                                </h1>
                                <p className="py-6">
                                    A large featured section with overlay
                                </p>
                                <Button status="primary">Get Started</Button>
                            </div>
                        </Hero>
                    </div>
                    <Code
                        lines={[
                            { content: '<Hero overlay image="/bg.jpg">' },
                            { content: '  <div>Content</div>' },
                            { content: '</Hero>' }
                        ]}
                    />
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Tabs</h3>
                    <div className="mb-3">
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
                        <div className="p-4 bg-base-200 rounded-b-lg">
                            Tab {activeTab + 1} content
                        </div>
                    </div>
                    <Code
                        lines={[
                            { content: '<Tabs variant="box">' },
                            { content: '  <Tab active={active}>Tab 1</Tab>' },
                            { content: '  <Tab>Tab 2</Tab>' },
                            { content: '</Tabs>' }
                        ]}
                    />
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Accordion</h3>
                    <div className="mb-3">
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
                                Content for the third accordion item with plus icon
                            </AccordionItem>
                        </Accordion>
                    </div>
                    <Code
                        lines={[
                            { content: '<Accordion name="group">' },
                            { content: '  <AccordionItem title="Item" name="group" variant="arrow">' },
                            { content: '    Content' },
                            { content: '  </AccordionItem>' },
                            { content: '</Accordion>' }
                        ]}
                    />
                </div>
            </section>

            {/* Interactive Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold">Interactive Components</h2>

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Modal</h3>
                    <div className="mb-3">
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
                                This is modal content. You can put any content here.
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
                    <Code
                        lines={[
                            { content: '<Modal open={open} onClose={handleClose} title="Title">' },
                            { content: '  <p>Content</p>' },
                            { content: '  <ModalActions>...</ModalActions>' },
                            { content: '</Modal>' }
                        ]}
                    />
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">
                        Diff Comparison
                    </h3>
                    <div className="mb-3">
                        <Diff
                            aspectRatio="aspect-16/9"
                            item1={
                                <div className="bg-primary text-primary-content text-6xl font-black grid place-content-center">
                                    BEFORE
                                </div>
                            }
                            item2={
                                <div className="bg-secondary text-secondary-content text-6xl font-black grid place-content-center">
                                    AFTER
                                </div>
                            }
                        />
                    </div>
                    <Code
                        lines={[
                            { content: '<Diff' },
                            { content: '  aspectRatio="aspect-16/9"' },
                            { content: '  item1={<div>Before</div>}' },
                            { content: '  item2={<div>After</div>}' },
                            { content: '/>' }
                        ]}
                    />
                </div>
            </section>
        </Container>
    );
}
