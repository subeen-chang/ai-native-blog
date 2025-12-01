'use client'

interface Author {
  name: string;
  bio: string;
  avatarUrl: string;
}

interface AuthorProfileProps {
  author: Author;
}

export default function AuthorProfile({ author }: AuthorProfileProps) {
  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-start gap-4">
        <img
          src={author.avatarUrl}
          alt={`${author.name}'s avatar`}
          className="w-16 h-16 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {author.name}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {author.bio}
          </p>
        </div>
      </div>
    </div>
  );
}
