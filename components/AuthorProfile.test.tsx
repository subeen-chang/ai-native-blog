import { render, screen } from '@testing-library/react'
import AuthorProfile from './AuthorProfile'

describe('AuthorProfile', () => {
  const mockAuthor = {
    name: 'John Doe',
    bio: 'Software engineer passionate about web development and open source.',
    avatarUrl: '/images/author.jpg',
  }

  describe('Component Rendering', () => {
    it('renders the main section with proper accessibility attributes', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const section = screen.getByRole('region', { name: mockAuthor.name })
      expect(section).toBeInTheDocument()
      expect(section).toHaveAttribute('aria-labelledby', 'author-heading')
    })

    it('renders with proper semantic HTML structure', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const section = screen.getByRole('region')
      expect(section.tagName).toBe('SECTION')
    })

    it('applies correct layout classes', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const section = screen.getByRole('region')
      expect(section).toHaveClass('mt-12', 'pt-8', 'border-t', 'border-gray-200')
    })
  })

  describe('AuthorAvatar Rendering', () => {
    it('renders the avatar image with correct src', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const avatar = screen.getByRole('img', { name: `${mockAuthor.name}'s avatar` })
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(mockAuthor.avatarUrl)))
    })

    it('renders avatar with correct alt text', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const avatar = screen.getByRole('img')
      expect(avatar).toHaveAttribute('alt', `${mockAuthor.name}'s avatar`)
    })

    it('applies correct avatar container classes', () => {
      const { container } = render(<AuthorProfile author={mockAuthor} />)

      const avatarContainer = container.querySelector('.rounded-full')
      expect(avatarContainer).toBeInTheDocument()
      expect(avatarContainer).toHaveClass('relative', 'w-16', 'h-16', 'rounded-full', 'overflow-hidden', 'flex-shrink-0')
    })

    it('renders Next.js Image component with correct props', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const avatar = screen.getByRole('img')
      expect(avatar).toHaveClass('object-cover')
    })
  })

  describe('AuthorInfo Rendering', () => {
    it('renders author name as heading', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const heading = screen.getByRole('heading', { level: 3, name: mockAuthor.name })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent(mockAuthor.name)
    })

    it('renders heading with correct id for accessibility', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveAttribute('id', 'author-heading')
    })

    it('applies correct heading styles', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveClass('text-lg', 'font-bold', 'text-gray-900', 'mb-1')
    })

    it('renders author bio as paragraph', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const bio = screen.getByText(mockAuthor.bio)
      expect(bio).toBeInTheDocument()
      expect(bio.tagName).toBe('P')
    })

    it('applies correct bio styles', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const bio = screen.getByText(mockAuthor.bio)
      expect(bio).toHaveClass('text-gray-600', 'text-sm', 'leading-relaxed')
    })
  })

  describe('Props Handling', () => {
    it('handles different author names correctly', () => {
      const authors = [
        { ...mockAuthor, name: 'Jane Smith' },
        { ...mockAuthor, name: 'Bob Johnson' },
        { ...mockAuthor, name: 'Alice Williams' },
      ]

      authors.forEach((author) => {
        const { unmount } = render(<AuthorProfile author={author} />)
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(author.name)
        expect(screen.getByRole('img')).toHaveAttribute('alt', `${author.name}'s avatar`)
        unmount()
      })
    })

    it('handles different bio content correctly', () => {
      const bios = [
        'Short bio.',
        'A much longer biography that spans multiple lines and contains various details about the author.',
        'Bio with special characters: <>&"\'',
      ]

      bios.forEach((bio) => {
        const { unmount } = render(<AuthorProfile author={{ ...mockAuthor, bio }} />)
        expect(screen.getByText(bio)).toBeInTheDocument()
        unmount()
      })
    })

    it('handles different avatar URLs correctly', () => {
      const avatarUrls = [
        '/images/avatar1.jpg',
        '/images/avatar2.png',
        'https://example.com/avatar.jpg',
        '/path/with spaces/avatar.jpg',
      ]

      avatarUrls.forEach((avatarUrl) => {
        const { unmount } = render(<AuthorProfile author={{ ...mockAuthor, avatarUrl }} />)
        const avatar = screen.getByRole('img')
        expect(avatar).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(avatarUrl)))
        unmount()
      })
    })
  })

  describe('Edge Cases', () => {
    it('renders with empty bio string', () => {
      const authorWithEmptyBio = { ...mockAuthor, bio: '' }
      render(<AuthorProfile author={authorWithEmptyBio} />)

      const bio = screen.queryByText(mockAuthor.bio)
      expect(bio).not.toBeInTheDocument()

      const paragraph = screen.getByRole('heading', { level: 3 }).parentElement?.querySelector('p')
      expect(paragraph).toBeInTheDocument()
      expect(paragraph).toHaveTextContent('')
    })

    it('renders with very long author name', () => {
      const longName = 'A'.repeat(100)
      const authorWithLongName = { ...mockAuthor, name: longName }
      render(<AuthorProfile author={authorWithLongName} />)

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(longName)
      expect(screen.getByRole('img')).toHaveAttribute('alt', `${longName}'s avatar`)
    })

    it('renders with very long bio', () => {
      const longBio = 'Lorem ipsum dolor sit amet. '.repeat(50)
      const authorWithLongBio = { ...mockAuthor, bio: longBio }
      render(<AuthorProfile author={authorWithLongBio} />)

      expect(screen.getByText((content) => content.includes('Lorem ipsum'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.length > 1000)).toBeInTheDocument()
    })

    it('handles special characters in name', () => {
      const specialNames = [
        "O'Brien",
        'José García',
        '张伟',
        'François Müller',
      ]

      specialNames.forEach((name) => {
        const { unmount } = render(<AuthorProfile author={{ ...mockAuthor, name }} />)
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(name)
        unmount()
      })
    })

    it('handles HTML entities in bio', () => {
      const bioWithEntities = 'Love & code > everything'
      render(<AuthorProfile author={{ ...mockAuthor, bio: bioWithEntities }} />)

      expect(screen.getByText(bioWithEntities)).toBeInTheDocument()
    })

    it('handles newlines in bio', () => {
      const bioWithNewlines = 'Line 1\nLine 2\nLine 3'
      render(<AuthorProfile author={{ ...mockAuthor, bio: bioWithNewlines }} />)

      expect(screen.getByText((content, element) => {
        return element?.tagName === 'P' && content.includes('Line 1') && content.includes('Line 3')
      })).toBeInTheDocument()
    })

    it('handles avatarUrl with query parameters', () => {
      const avatarUrlWithParams = '/images/avatar.jpg?size=64&quality=80'
      render(<AuthorProfile author={{ ...mockAuthor, avatarUrl: avatarUrlWithParams }} />)

      const avatar = screen.getByRole('img')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('renders avatar and info in flex layout', () => {
      const { container } = render(<AuthorProfile author={mockAuthor} />)

      const flexContainer = container.querySelector('.flex.items-start.gap-4')
      expect(flexContainer).toBeInTheDocument()
    })

    it('avatar container has flex-shrink-0 to prevent shrinking', () => {
      const { container } = render(<AuthorProfile author={mockAuthor} />)

      const avatarContainer = container.querySelector('.rounded-full')
      expect(avatarContainer).toHaveClass('flex-shrink-0')
    })

    it('info container has flex-1 to take remaining space', () => {
      const { container } = render(<AuthorProfile author={mockAuthor} />)

      const infoContainer = screen.getByRole('heading', { level: 3 }).parentElement
      expect(infoContainer).toHaveClass('flex-1')
    })

    it('section has top border separator', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const section = screen.getByRole('region')
      expect(section).toHaveClass('border-t', 'border-gray-200')
    })

    it('section has proper spacing', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const section = screen.getByRole('region')
      expect(section).toHaveClass('mt-12', 'pt-8')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labeling structure', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const section = screen.getByRole('region')
      const heading = screen.getByRole('heading', { level: 3 })

      expect(section).toHaveAttribute('aria-labelledby', 'author-heading')
      expect(heading).toHaveAttribute('id', 'author-heading')
    })

    it('avatar has descriptive alt text', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const avatar = screen.getByRole('img')
      expect(avatar).toHaveAttribute('alt')
      expect(avatar.getAttribute('alt')).toContain(mockAuthor.name)
    })

    it('uses semantic HTML elements', () => {
      const { container } = render(<AuthorProfile author={mockAuthor} />)

      const section = screen.getByRole('region')
      const heading = screen.getByRole('heading', { level: 3 })
      const bio = screen.getByText(mockAuthor.bio)

      expect(section.tagName).toBe('SECTION')
      expect(heading.tagName).toBe('H3')
      expect(bio.tagName).toBe('P')
    })

    it('heading is properly nested within section', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const section = screen.getByRole('region')
      const heading = screen.getByRole('heading', { level: 3 })

      expect(section).toContainElement(heading)
    })
  })

  describe('Next.js Image Integration', () => {
    it('renders Next.js Image with fill prop', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const avatar = screen.getByRole('img')
      // Next.js Image with fill prop will have specific data attributes
      expect(avatar).toBeInTheDocument()
    })

    it('image has object-cover class for proper scaling', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const avatar = screen.getByRole('img')
      expect(avatar).toHaveClass('object-cover')
    })

    it('avatar container is positioned relative for fill image', () => {
      const { container } = render(<AuthorProfile author={mockAuthor} />)

      const avatarContainer = container.querySelector('.rounded-full')
      expect(avatarContainer).toHaveClass('relative')
    })

    it('avatar container has overflow hidden for rounded appearance', () => {
      const { container } = render(<AuthorProfile author={mockAuthor} />)

      const avatarContainer = container.querySelector('.rounded-full')
      expect(avatarContainer).toHaveClass('overflow-hidden')
    })
  })

  describe('Type Safety', () => {
    it('accepts valid author prop with all required fields', () => {
      const validAuthor = {
        name: 'Test Author',
        bio: 'Test bio',
        avatarUrl: '/test.jpg',
      }

      expect(() => render(<AuthorProfile author={validAuthor} />)).not.toThrow()
    })
  })

  describe('Component Integration', () => {
    it('all sub-components render together correctly', () => {
      render(<AuthorProfile author={mockAuthor} />)

      // AuthorAvatar rendered
      expect(screen.getByRole('img')).toBeInTheDocument()

      // AuthorInfo rendered
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
      expect(screen.getByText(mockAuthor.bio)).toBeInTheDocument()

      // Main section rendered
      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('maintains proper relationship between avatar and name', () => {
      render(<AuthorProfile author={mockAuthor} />)

      const avatar = screen.getByRole('img')
      const heading = screen.getByRole('heading', { level: 3 })

      expect(avatar.getAttribute('alt')).toContain(mockAuthor.name)
      expect(heading).toHaveTextContent(mockAuthor.name)
    })
  })
})
