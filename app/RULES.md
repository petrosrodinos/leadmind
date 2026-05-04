# AI Agent Rules — React + TypeScript Project

## 1. Purpose

This file defines architectural rules, naming conventions, and coding patterns for AI coding agents working in a React + TypeScript project. Follow these rules precisely when reading, writing, or refactoring code.

---

## 2. Project Structure Guidelines

```
src/
├── App.tsx                        # Root: Router > QueryProvider > AppRoutes
├── main.tsx                       # Entry point
├── index.css                      # Tailwind v4 CSS-first config + CSS variables
├── routes/
│   └── routes.ts                  # Centralized Routes object (all frontend paths)
├── config/
│   ├── api/
│   │   ├── axios.ts               # Axios instance with auth interceptor
│   │   └── routes.ts              # Centralized ApiRoutes object (all API endpoints)
│   ├── environments/
│   │   └── index.ts               # Typed and exported env vars
│   └── constants/                 # Static maps and dropdown options
├── features/                      # Domain modules (see Feature Module Pattern)
├── pages/                         # Route-level page components
├── components/
│   ├── layout/                    # Layout shells (sidebar, header, etc.)
│   ├── ui/                        # shadcn/ui base components + custom primitives
│   └── providers/                 # React context providers
├── stores/                        # Zustand stores
├── hooks/                         # Global reusable hooks (not feature-specific)
├── lib/                           # Pure utility functions
├── interfaces/                    # Shared cross-domain interfaces
└── types/                         # Global TypeScript declarations
```

### Feature Module Pattern

Every domain feature lives in `src/features/<feature-name>/` and follows this structure:

```
features/<feature-name>/
├── hooks/
│   └── use-<feature-name>.ts         # TanStack Query hooks (useQuery / useMutation)
├── interfaces/
│   └── <feature-name>.interfaces.ts  # TypeScript interfaces + DTO types + const enums
├── services/
│   └── <feature-name>.services.ts    # Plain async functions wrapping axiosInstance
└── validation-schemas/               # (optional — only if feature has forms)
    └── <feature-name>.schema.ts      # Zod schemas + inferred types
```

### Page Structure

Pages live in `src/pages/<section>/` and may contain nested sub-pages:

```
pages/<section>/
├── index.tsx                      # Top-level page component (route entry)
├── components/                    # Page-local components (not reused elsewhere)
├── hooks/                         # Page-local hooks (UI state only, no API calls)
├── pages/                         # Sub-pages (e.g., new-item, edit-item)
├── utils/                         # Page-local utility functions
└── validation-schemas/            # Page-local Zod schemas (if not in features/)
```

**Do:** Put all data-fetching logic in `features/`. Pages only import from features.  
**Don't:** Put API calls or Zod schemas directly inside page components or hooks.

---

## 3. Naming Conventions

### Files
- All files: `kebab-case` (e.g., `use-feature-name.ts`, `feature-name.services.ts`)
- Exception: shadcn/ui components may use `PascalCase.tsx`

### Components
- Function names: `PascalCase`
- Page components: `<Domain>Page`
- Modal components: `<Domain>Modal`
- Form components: `<Domain>Form`

### Hooks
- File: `use-kebab-case.ts`
- Function: `useCamelCase` (e.g., file `use-feature-name.ts` → exports `useFeatureName`)
- Query hooks: `useGet<Entity>` or `use<Entity>`
- Mutation hooks: `useCreate<Entity>`, `useUpdate<Entity>`, `useDelete<Entity>`

### Types and Interfaces
- Interface files: `<feature>.interfaces.ts`
- Interface names: `PascalCase`, no `I` prefix
- DTO types: `<Action><Entity>Dto` (e.g., `CreateEntityDto`, `UpdateEntityDto`)
- Query param types: `<Entity>QueryType` or `<Entity>Query`

### Validation Schemas
- File: `<feature>.schema.ts`
- Schema names: `camelCase` + `Schema` suffix (e.g., `createEntitySchema`)
- Inferred types: `<Action><Entity>FormData` or `<Entity>FormValues`

### Zustand Stores
- File: `<domain>.ts` in `src/stores/`
- Hook export: `use<Domain>Store`
- State accessor: `get<Domain>StoreState()` (for non-React contexts)
- Store key constant: `const STORE_KEY = "<domain>"` (kebab-case string)

---

## 4. Component Guidelines

- Page components manage modal open/close state and selected entity identifier
- Delegate API calls to feature hooks; delegate UI state to page-local hooks
- Use `FC` type annotation with explicit props interface
- Default export for pages and layouts; named exports for reusable components
- shadcn/ui components live in `components/ui/` and must not be modified directly — extend via wrappers
- Use `variant` prop pattern from `class-variance-authority` (cva) in base UI components

---

## 5. Hooks Guidelines

- Feature query hooks live in `features/<feature-name>/hooks/`
- Page-local hooks live in `pages/<section>/hooks/` and manage UI state only (no API calls)
- Every mutation hook **must** call `toast()` in both `onSuccess` and `onError`
- `onSuccess` **must** call `queryClient.invalidateQueries` with the base query key
- Use `enabled: !!param` for conditional queries that depend on a runtime value
- Query keys: kebab-case string matching the entity name (e.g., `["entity-name"]`)

---

## 6. State Management Guidelines

Use Zustand for global client state.

- All stores use `devtools` + `persist` middlewares
- Use `partialize` when only part of the state should be persisted
- Expose a `get<Domain>StoreState()` function for non-React contexts (e.g., Axios interceptors)
- Store key is a `const STORE_KEY` string at the top of the store file

---

## 7. Forms and Validation

- Always use `zodResolver` — never manual validation
- Always use shadcn `Form`, `FormField`, `FormItem`, `FormControl`, `FormLabel`, `FormMessage` components
- Schema files export both the Zod schema and its inferred type
- Zod schemas live in `features/<feature-name>/validation-schemas/` or `pages/<section>/validation-schemas/`

---

## 8. API and Services

- All API endpoints are defined in a single `ApiRoutes` object — never hardcode API path strings
- All frontend paths are defined in a single `Routes` object — never hardcode URL strings
- All HTTP calls go through a shared `axiosInstance` — never use `fetch` or a raw `axios` import
- Service functions are plain `async` functions — no React hooks inside them
- Always wrap service calls with `try/catch`; throw a human-readable `new Error("...")` message
- Return `response.data` directly, not the full Axios response object
- All env vars are accessed through a typed `environments` object — never use `import.meta.env.*` directly in components or features

---

## 9. Styling Guidelines

- Use Tailwind CSS utility classes — no CSS modules, no inline `style` objects
- Theme tokens (colors, radius, etc.) defined as CSS variables in `index.css`
- Dark mode: class-based (`.dark` on `<html>`)
- Conditional classes: always use `cn()` from `@/lib/utils`
- Use `@/` path alias for all imports — never use relative `../../` paths across folders

---

## 10. TypeScript Guidelines

- Use `const` objects as enums with an extracted union type — do not use the TypeScript `enum` keyword
- No `I` prefix on interface names
- Export DTO and form types alongside the schema or interface that defines the shape
- Use `FC` for page and layout component type annotations with an explicit props interface

---

## 11. Do / Don't Rules

| Do | Don't |
|---|---|
| Use `@/` alias for all imports | Use relative `../../` paths across folders |
| Define all routes in a central `Routes` object | Hardcode URL strings in components |
| Define all API paths in a central `ApiRoutes` object | Hardcode API path strings in service files |
| Put API calls in `features/<name>/services/` | Call `axiosInstance` from components or hooks |
| Use TanStack Query for all server state | Use `useState` + `useEffect` for data fetching |
| Call `toast()` in every mutation's `onSuccess` and `onError` | Leave mutations silent |
| Use `zodResolver` with React Hook Form | Write manual form validation logic |
| Use `cn()` for conditional classnames | Concatenate class strings or use `style={}` |
| Use shared `lib/` date helpers | Call `new Date().toLocaleDateString()` in components |
| Export inferred Zod types next to schemas | Re-define types that duplicate schema shape |
| Use const-object enum pattern with extracted union type | Use the TypeScript `enum` keyword |
| `invalidateQueries` with the base key after mutations | Target parameterized query keys in mutations |
| Access env vars through a typed `environments` object | Access `import.meta.env.VITE_*` directly |
| Extend shadcn/ui components via wrappers | Modify files inside `components/ui/` directly |

---

## 12. Examples

### Const-Object Enum Pattern
```ts
export const StatusTypes = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;
export type StatusType = (typeof StatusTypes)[keyof typeof StatusTypes];
```

### Service Function
```ts
import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";

export const getEntities = async (query?: EntityQueryType): Promise<Entity[]> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.entities.prefix, { params: query });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch entities. Please try again.");
  }
};
```

### Query Hook
```ts
export const useGetEntities = (query?: EntityQueryType) => {
  return useQuery({
    queryKey: ["entities", query],
    queryFn: () => getEntities(query),
  });
};

// Conditional query
export const useGetEntity = (id: string) => {
  return useQuery({
    queryKey: ["entity", id],
    queryFn: () => getEntity(id),
    enabled: !!id,
  });
};
```

### Mutation Hook
```ts
export const useCreateEntity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEntity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      toast({ title: "Entity created", description: "...", duration: 2000 });
    },
    onError: (error) => {
      toast({ title: "Could not create entity", description: error.message, variant: "error" });
    },
  });
};
```

### Zod Schema + Inferred Type
```ts
import { z } from "zod";

export const createEntitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type CreateEntityFormData = z.infer<typeof createEntitySchema>;
```

### Form Component Setup
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const form = useForm<CreateEntityFormData>({
  resolver: zodResolver(createEntitySchema),
  defaultValues: { name: "", description: "" },
});
```

### Zustand Store
```ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const STORE_KEY = "domain-name";

export const useDomainStore = create<DomainStore>()(
  devtools(
    persist(
      (set) => ({ ...initialValues, setData: (data) => set((state) => ({ ...state, ...data })) }),
      { name: STORE_KEY }
    )
  )
);

export const getDomainStoreState = () => useDomainStore.getState();
```

### Conditional Classnames
```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-class", isActive && "active-class", className)} />
```

### Page Component
```tsx
const FeaturePage: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <FeatureList onItemClick={(id) => { setSelectedId(id); setIsModalOpen(true); }} />
      <FeatureModal id={selectedId} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedId(null); }} />
    </>
  );
};
export default FeaturePage;
```
