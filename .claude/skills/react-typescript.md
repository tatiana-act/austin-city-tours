---
name: react-typescript
description: Best practices for React and TypeScript — component design, typing, hooks, forms, and accessibility. Use when building components, reviewing code, or working with forms and state.
---

# React + TypeScript Best Practices

## TypeScript: Strict by Default

The project has `"strict": true` in `tsconfig.json`. Honor it:

- No `any` — use `unknown` and narrow, or define a proper type
- No type assertions (`as Foo`) unless you have verified the type at runtime
- No `// @ts-ignore` — fix the underlying issue
- No untyped props — every component prop must have an explicit type

```ts
// Bad
const MyComponent = ({ tour, onBook }: any) => ...

// Good
interface MyComponentProps {
  tour: TourProgram;
  onBook: (tourId: string) => void;
}
const MyComponent = ({ tour, onBook }: MyComponentProps) => ...
```

Use `type` for object shapes and unions. Use `interface` only when you need `extends`.

## Component Design

**One responsibility per component.** If a component fetches data, renders a list, AND handles a modal — split it.

**Prefer small, composable components** over large monolithic ones:
```tsx
// Instead of one big TourCard with 100+ lines:
<TourCard tour={tour}>
  <TourCard.Image />
  <TourCard.Body>
    <TourCard.Title />
    <TourCard.Highlights />
  </TourCard.Body>
  <TourCard.Actions onBook={onBook} />
</TourCard>
```

**Named exports** for all components — not default exports. Default exports make refactoring and searching harder.

**Props over state** — if something can be derived from props, derive it. Don't copy props into state.

## Hooks

**`useState`** — only for UI state that is local and ephemeral (open/closed, selected tab). Not for data that comes from the server.

**`useEffect`** — for synchronizing with external systems (DOM APIs, subscriptions, timers). Not for:
- Deriving state from other state (compute it inline instead)
- Fetching data (use Server Components or a library like SWR)
- Responding to user events (use event handlers instead)

**Custom hooks** — extract any `useState` + `useEffect` combination that is reused in 2+ components into a `hooks/use{Name}.ts` file.

```ts
// hooks/useModal.ts
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return { isOpen, open, close };
}
```

**Dependency arrays** — every `useEffect`, `useCallback`, `useMemo` must have a complete dependency array. Never suppress the exhaustive-deps lint warning — fix the code instead.

## Forms: react-hook-form + Zod

All forms use `react-hook-form` with a Zod resolver. The Zod schema is the single source of truth.

```tsx
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contact: z.string().min(1, 'Contact is required'),
  groupSize: z.number().min(1).max(15),
});

type FormData = z.infer<typeof schema>;

export function BookingForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} aria-invalid={!!errors.name} />
      {errors.name && <p role="alert">{errors.name.message}</p>}
    </form>
  );
}
```

For server actions, use `useActionState`:
```tsx
const [state, action, isPending] = useActionState(submitBookingForm, initState);
```

Never mix `useForm` state with `useActionState` — pick one pattern per form.

## Accessibility

Every interactive element must be keyboard-navigable and screen-reader friendly:

- Use semantic HTML: `<button>` not `<div onClick>`, `<a href>` not `<span onClick>`
- All images need descriptive `alt` text — not empty, not "image of"
- Form inputs must have associated `<label>` elements (via `htmlFor` or wrapping)
- Error messages use `role="alert"` so screen readers announce them
- Modal dialogs: trap focus inside, restore focus on close, `role="dialog"` with `aria-modal="true"`
- Interactive cards: if the whole card is clickable, use a single `<a>` or `<button>` wrapping the content — not multiple nested clickables

## Avoid These Patterns

```tsx
// Prop drilling more than 2 levels — use composition or context instead
<A prop={x}><B prop={x}><C prop={x} /></B></A>

// Index as key — breaks reconciliation on reorder/insert
{tours.map((t, i) => <TourCard key={i} tour={t} />)}
// Use: key={t.id}

// Optional chaining on things that can't be null — creates false safety
tour?.id?.valueOf()
// If tour is typed as TourProgram (not TourProgram | null), just: tour.id

// Inline object/array in JSX — creates new reference every render
<Component style={{ margin: 0 }} options={[1, 2, 3]} />
// Move to a constant outside the component

// Commented-out code — delete it, git has history
{/*<span>🚶 {tour.difficulty}</span>*/}
```
