# AuthorProfile Component

A React component that displays author information below blog posts, consisting of an avatar image and biographical details. The component is designed with accessibility in mind and uses Next.js Image optimization for efficient avatar rendering.

## Overview

The `AuthorProfile` component is typically displayed at the bottom of blog posts to provide readers with information about the author. It features a modular architecture with three sub-components that work together to create a cohesive author profile section.

## Component Architecture

The component is structured as follows:

- **AuthorProfile**: Main orchestrating component that arranges the layout
- **AuthorAvatar**: Handles avatar display with Next.js Image optimization
- **AuthorInfo**: Manages author name and bio display

## Props

### AuthorProfile

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| author | `Author` | Yes | - | Author object containing name, bio, and avatar URL |

### Author Type Definition

```typescript
interface Author {
  name: string;        // Author's full name
  bio: string;         // Author's biography or description
  avatarUrl: string;   // URL or path to author's avatar image
}
```

## Sub-Components

### AuthorAvatar

Internal component that renders the author's avatar image.

**Props:**
- `name` (string): Author's name, used for alt text
- `avatarUrl` (string): URL or path to the avatar image

**Features:**
- Uses Next.js `Image` component with `fill` prop for responsive sizing
- Fixed size: 64x64 pixels
- Rounded circular appearance
- Object-cover sizing for proper image scaling
- Optimized loading with `priority={false}`

### AuthorInfo

Internal component that displays the author's name and bio.

**Props:**
- `name` (string): Author's name
- `bio` (string): Author's biography

**Features:**
- Name rendered as an `<h3>` heading
- Bio rendered as a paragraph with relaxed line-height
- Proper semantic HTML structure

## Usage

### Basic Example

```tsx
import AuthorProfile from '@/components/AuthorProfile'

export default function BlogPost() {
  return (
    <article>
      {/* Your blog post content */}

      <AuthorProfile
        author={{
          name: "John Doe",
          bio: "A passionate writer and developer.",
          avatarUrl: "/images/avatar.png"
        }}
      />
    </article>
  )
}
```

### With Dynamic Author Data

```tsx
import AuthorProfile from '@/components/AuthorProfile'

interface BlogPostProps {
  authorData: {
    name: string
    bio: string
    avatarUrl: string
  }
}

export default function BlogPost({ authorData }: BlogPostProps) {
  return (
    <article>
      <h1>Blog Post Title</h1>
      {/* Post content */}

      <AuthorProfile author={authorData} />
    </article>
  )
}
```

### Complete Blog Page Example

```tsx
import AuthorProfile from '@/components/AuthorProfile'

export default function BlogPostPage() {
  const post = {
    title: "Understanding React Hooks",
    content: "Blog post content...",
    author: {
      name: "Jane Smith",
      bio: "Frontend developer with 5+ years of experience in React and TypeScript.",
      avatarUrl: "/images/authors/jane-smith.jpg"
    }
  }

  return (
    <section>
      <h1 className="title font-semibold text-2xl tracking-tighter">
        {post.title}
      </h1>

      <article className="prose">
        {post.content}
      </article>

      <AuthorProfile author={post.author} />
    </section>
  )
}
```

### With Remote Avatar URLs

```tsx
import AuthorProfile from '@/components/AuthorProfile'

export default function BlogPost() {
  return (
    <article>
      <AuthorProfile
        author={{
          name: "Alex Johnson",
          bio: "Tech blogger and open-source contributor.",
          avatarUrl: "https://example.com/avatars/alex-johnson.jpg"
        }}
      />
    </article>
  )
}
```

## Accessibility Features

The component implements several accessibility best practices:

1. **Semantic HTML**: Uses proper semantic elements (`<section>`, `<h3>`, `<p>`)
2. **ARIA Labels**: Section is labeled with `aria-labelledby` pointing to the author heading
3. **Descriptive Alt Text**: Avatar images include descriptive alt text (e.g., "John Doe's avatar")
4. **Heading Hierarchy**: Uses `<h3>` for the author name with an `id="author-heading"`
5. **Landmark Region**: Section has `role="region"` implicitly through the `<section>` element

## Styling and Layout

### Layout Structure

The component uses Flexbox for layout:

```
┌─────────────────────────────────────┐
│  Section (border-top separator)    │
│  ┌────┐  ┌────────────────────┐   │
│  │    │  │  Author Name        │   │
│  │ 👤 │  │  (h3 heading)       │   │
│  │    │  │                     │   │
│  └────┘  │  Author bio text... │   │
│          │                     │   │
│          └────────────────────┘   │
└─────────────────────────────────────┘
```

### CSS Classes

**Section (Main Container):**
- `mt-12`: Top margin (3rem / 48px)
- `pt-8`: Top padding (2rem / 32px)
- `border-t border-gray-200`: Top border separator

**Layout Container:**
- `flex items-start gap-4`: Flexbox layout with 1rem gap

**Avatar Container:**
- `w-16 h-16`: Fixed 64x64 pixel size
- `rounded-full`: Circular shape
- `overflow-hidden`: Clips image to rounded bounds
- `flex-shrink-0`: Prevents shrinking in flex layout
- `relative`: Positioning context for Next.js Image fill

**Avatar Image:**
- `object-cover`: Maintains aspect ratio while filling container
- `fill`: Next.js Image prop for responsive sizing

**Info Container:**
- `flex-1`: Takes remaining space in flex layout

**Author Name:**
- `text-lg`: Large text (1.125rem / 18px)
- `font-bold`: Bold font weight
- `text-gray-900`: Dark gray color
- `mb-1`: Bottom margin (0.25rem / 4px)

**Author Bio:**
- `text-gray-600`: Medium gray color
- `text-sm`: Small text (0.875rem / 14px)
- `leading-relaxed`: Relaxed line height (1.625)

## Performance Considerations

1. **Image Optimization**: Uses Next.js Image component with:
   - `fill` prop for responsive sizing
   - `sizes="64px"` hint for optimal image loading
   - `priority={false}` to defer loading below the fold
   - Automatic format optimization (WebP, AVIF)

2. **Client Component**: Marked with `"use client"` directive for client-side rendering

3. **Constants**: Avatar size constants are defined once and reused:
   ```typescript
   const AVATAR_SIZE_PX = 64
   const AVATAR_SIZE_CLASS = "w-16 h-16"
   ```

## Best Practices

1. **Avatar Image Paths**:
   - Use absolute paths starting with `/` for local images
   - Ensure images are placed in the `public` directory
   - For external URLs, configure Next.js `images.remotePatterns` in `next.config.js`

2. **Biography Text**:
   - Keep bio text concise (1-3 sentences recommended)
   - Avoid HTML in bio text; plain text is automatically escaped
   - Newlines in bio text are preserved but rendered as spaces

3. **Author Names**:
   - Support international characters (UTF-8)
   - Handle names with special characters (e.g., O'Brien, José)
   - No length restrictions, but shorter names display better

4. **Positioning**:
   - Typically placed after blog post content
   - Separated from content with top border
   - Provides visual closure to the post

5. **Responsive Design**:
   - Fixed avatar size works well on all screen sizes
   - Flexbox layout adapts to content width
   - Text wraps naturally in the bio section

## Edge Cases Handled

The component gracefully handles:

- Empty bio strings (displays empty paragraph)
- Very long author names (no truncation)
- Very long biographies (text wraps naturally)
- Special characters in names (UTF-8 support)
- HTML entities in bio (automatically escaped)
- Newlines in bio text (rendered as spaces)
- Avatar URLs with query parameters
- Avatar URLs with spaces (URL-encoded)
- International characters in all fields

## Testing

The component includes comprehensive tests covering:

- Component rendering and structure
- Sub-component integration
- Props handling and validation
- Accessibility features
- Layout and styling
- Next.js Image integration
- Edge cases and special characters

See `components/AuthorProfile.test.tsx` for the complete test suite.

## Notes

- This is a **client component** (`"use client"`) due to potential future interactivity
- The component uses Tailwind CSS for styling
- Avatar images should ideally be square (1:1 aspect ratio) for best results
- The component maintains a consistent visual style with the rest of the blog
- Sub-components (AuthorAvatar, AuthorInfo) are internal and not exported
- The component follows the project's TypeScript strict mode requirements

## Related Components

- **CustomMDX**: Used for rendering blog post content
- **Blog Post Layout**: Parent component that includes AuthorProfile

## Version History

- **v1.1** (Current): Refactored into three sub-components for better maintainability
- **v1.0**: Initial implementation with integrated avatar and info display
