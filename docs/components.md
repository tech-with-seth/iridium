# Component Development

TWS Foundations uses DaisyUI for pre-built components and CVA (Class Variance Authority) for managing component variants with type safety.

## Overview

The component system combines:

- **DaisyUI** - Component library built on Tailwind CSS
- **CVA** - Type-safe variant management
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

## DaisyUI Components

DaisyUI provides semantic component classes that work with Tailwind CSS.

### Button

```typescript
function MyComponent() {
  return (
    <div className="space-x-2">
      <button className="btn">Default</button>
      <button className="btn btn-primary">Primary</button>
      <button className="btn btn-secondary">Secondary</button>
      <button className="btn btn-accent">Accent</button>
      <button className="btn btn-ghost">Ghost</button>
      <button className="btn btn-link">Link</button>
    </div>
  );
}
```

### Form Controls

```typescript
function FormExample() {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">What is your name?</span>
      </label>
      <input
        type="text"
        placeholder="Type here"
        className="input input-bordered w-full max-w-xs"
      />
      <label className="label">
        <span className="label-text-alt">Your name will be displayed publicly</span>
      </label>
    </div>
  );
}
```

### Card

```typescript
function CardExample() {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <figure>
        <img src="/image.jpg" alt="Description" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">Card Title</h2>
        <p>Card description goes here</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">Action</button>
        </div>
      </div>
    </div>
  );
}
```

### Modal

```typescript
function ModalExample() {
  return (
    <>
      <button className="btn" onClick={() => document.getElementById('my_modal')?.showModal()}>
        Open Modal
      </button>

      <dialog id="my_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Modal Title</h3>
          <p className="py-4">Modal content goes here</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
```

### Alert

```typescript
function AlertExample() {
  return (
    <div>
      <div className="alert">
        <span>Info alert</span>
      </div>

      <div className="alert alert-success">
        <span>Success alert</span>
      </div>

      <div className="alert alert-warning">
        <span>Warning alert</span>
      </div>

      <div className="alert alert-error">
        <span>Error alert</span>
      </div>
    </div>
  );
}
```

### Drawer

```typescript
function DrawerExample() {
  return (
    <div className="drawer">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label htmlFor="my-drawer" className="btn btn-primary drawer-button">
          Open drawer
        </label>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-200">
          <li><a>Sidebar Item 1</a></li>
          <li><a>Sidebar Item 2</a></li>
        </ul>
      </div>
    </div>
  );
}
```

## CVA for Component Variants

CVA provides type-safe variant management for custom components.

### Basic CVA Usage

```typescript
import { cva, type VariantProps } from "cva";

const buttonVariants = cva({
  base: "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  variants: {
    variant: {
      default: "bg-primary text-primary-content hover:bg-primary-focus",
      secondary: "bg-secondary text-secondary-content hover:bg-secondary-focus",
      outline: "border border-primary text-primary hover:bg-primary hover:text-primary-content",
      ghost: "hover:bg-base-200",
    },
    size: {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-11 px-8 text-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

type ButtonProps = VariantProps<typeof buttonVariants> & {
  children: React.ReactNode;
  onClick?: () => void;
};

function Button({ variant, size, children, onClick }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })} onClick={onClick}>
      {children}
    </button>
  );
}

// Usage
<Button variant="outline" size="lg">Click me</Button>
```

### Compound Variants

```typescript
const cardVariants = cva({
  base: "card bg-base-100",
  variants: {
    bordered: {
      true: "border border-base-300",
      false: "",
    },
    elevated: {
      true: "shadow-xl",
      false: "",
    },
  },
  compoundVariants: [
    {
      bordered: true,
      elevated: true,
      className: "border-2",
    },
  ],
});

function Card({ bordered, elevated, children }) {
  return (
    <div className={cardVariants({ bordered, elevated })}>
      {children}
    </div>
  );
}
```

### CVA with Tailwind Merge

Combine CVA with tailwind-merge for better class handling:

```typescript
import { cva } from "cva";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva({
  base: "btn",
  variants: {
    variant: {
      primary: "btn-primary",
      secondary: "btn-secondary",
    },
  },
});

function Button({ variant, className, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}

// Usage - custom classes override variant classes
<Button variant="primary" className="btn-lg">
  Large Primary Button
</Button>
```

## Icons with Lucide React

```typescript
import { User, Mail, Lock, Check, X } from "lucide-react";

function IconExample() {
  return (
    <div className="space-x-4">
      <User size={24} />
      <Mail size={24} className="text-primary" />
      <Lock size={24} strokeWidth={1.5} />
      <Check size={24} className="text-success" />
      <X size={24} className="text-error" />
    </div>
  );
}
```

## Component Patterns

### Compound Components

```typescript
type TabsProps = {
  children: React.ReactNode;
  defaultValue: string;
};

type TabsContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

function Tabs({ children, defaultValue }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="tabs tabs-boxed">{children}</div>;
}

function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const { activeTab, setActiveTab } = context;

  return (
    <button
      className={`tab ${activeTab === value ? "tab-active" : ""}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.activeTab !== value) return null;

  return <div className="p-4">{children}</div>;
}

// Usage
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings</TabsContent>
  <TabsContent value="password">Password settings</TabsContent>
</Tabs>
```

### Render Props

```typescript
type DataListProps<T> = {
  data: T[];
  isLoading: boolean;
  render: (item: T) => React.ReactNode;
};

function DataList<T>({ data, isLoading, render }: DataListProps<T>) {
  if (isLoading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index}>{render(item)}</div>
      ))}
    </div>
  );
}

// Usage
<DataList
  data={users}
  isLoading={loading}
  render={(user) => (
    <div className="card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  )}
/>
```

### Composition

```typescript
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-200">
      <Header />
      <main className="container mx-auto p-4">{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">TWS Foundations</a>
      </div>
      <div className="flex-none">
        <Navigation />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer footer-center p-4 bg-base-300 text-base-content">
      <div>
        <p>Copyright © 2025 - All rights reserved</p>
      </div>
    </footer>
  );
}
```

## Theming

### Custom Theme Colors

Configure custom themes in `tailwind.config.ts`:

```typescript
import daisyui from "daisyui";

export default {
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#570df8",
          secondary: "#f000b8",
          accent: "#1dcdbc",
          neutral: "#2b3440",
          "base-100": "#ffffff",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
        },
      },
    ],
  },
};
```

### Dark Mode

DaisyUI supports dark mode out of the box:

```typescript
// Toggle dark mode
function ThemeToggle() {
  function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    html.setAttribute("data-theme", currentTheme === "dark" ? "light" : "dark");
  }

  return (
    <button className="btn btn-ghost" onClick={toggleTheme}>
      Toggle Theme
    </button>
  );
}
```

## Best Practices

1. **Use DaisyUI classes** - Leverage pre-built components for consistency
2. **CVA for custom components** - Type-safe variants for reusable components
3. **Compose components** - Build complex UIs from simple, reusable pieces
4. **Keep components focused** - Single responsibility principle
5. **Use TypeScript** - Ensure type safety for props and variants
6. **Extract common patterns** - Create reusable component abstractions
7. **Document component APIs** - Clear props and usage examples
8. **Test components** - Unit tests for component logic and rendering

## Testing Components

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./button";

test("renders button with text", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText("Click me")).toBeInTheDocument();
});

test("calls onClick when clicked", async () => {
  const handleClick = vi.fn();
  const user = userEvent.setup();

  render(<Button onClick={handleClick}>Click me</Button>);

  await user.click(screen.getByText("Click me"));

  expect(handleClick).toHaveBeenCalledTimes(1);
});

test("applies correct variant classes", () => {
  const { container } = render(<Button variant="primary">Click me</Button>);
  const button = container.querySelector("button");

  expect(button).toHaveClass("btn-primary");
});
```

## Further Reading

- [DaisyUI Documentation](https://daisyui.com/)
- [CVA Documentation](https://cva.style/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide React Documentation](https://lucide.dev/guide/packages/lucide-react)
- [Architecture Decision: DaisyUI](./decisions/004-daisyui.md)
- [Architecture Decision: CVA](./decisions/005-cva.md)
