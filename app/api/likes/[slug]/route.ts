import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const LIKES_FILE_PATH = path.join(process.cwd(), "data", "likes.json");

interface LikesData {
  [slug: string]: number;
}

async function readLikesData(): Promise<LikesData> {
  try {
    const data = await fs.readFile(LIKES_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function writeLikesData(data: LikesData): Promise<void> {
  await fs.writeFile(LIKES_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const likesData = await readLikesData();
  const likes = likesData[slug] || 0;

  return NextResponse.json({ likes });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const likesData = await readLikesData();

  likesData[slug] = (likesData[slug] || 0) + 1;
  await writeLikesData(likesData);

  return NextResponse.json({ likes: likesData[slug] });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const likesData = await readLikesData();

  if (likesData[slug] && likesData[slug] > 0) {
    likesData[slug] -= 1;
  }
  await writeLikesData(likesData);

  return NextResponse.json({ likes: likesData[slug] || 0 });
}
