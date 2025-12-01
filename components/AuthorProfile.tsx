"use client";

import Image from "next/image";

interface Author {
  name: string;
  bio: string;
  avatarUrl: string;
}

interface AuthorProfileProps {
  author: Author;
}

const AVATAR_SIZE_PX = 64;
const AVATAR_SIZE_CLASS = "w-16 h-16";

export default function AuthorProfile({ author }: AuthorProfileProps) {
  return (
    <section
      className="mt-12 pt-8 border-t border-gray-200"
      aria-labelledby="author-heading"
    >
      <div className="flex items-start gap-4">
        <AuthorAvatar
          name={author.name}
          avatarUrl={author.avatarUrl}
        />
        <AuthorInfo
          name={author.name}
          bio={author.bio}
        />
      </div>
    </section>
  );
}

function AuthorAvatar({ name, avatarUrl }: Pick<Author, "name" | "avatarUrl">) {
  return (
    <div className={`relative ${AVATAR_SIZE_CLASS} rounded-full overflow-hidden flex-shrink-0`}>
      <Image
        src={avatarUrl}
        alt={`${name}'s avatar`}
        fill
        className="object-cover"
        sizes={`${AVATAR_SIZE_PX}px`}
        priority={false}
      />
    </div>
  );
}

function AuthorInfo({ name, bio }: Pick<Author, "name" | "bio">) {
  return (
    <div className="flex-1">
      <h3
        id="author-heading"
        className="text-lg font-bold text-gray-900 mb-1"
      >
        {name}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed">
        {bio}
      </p>
    </div>
  );
}
