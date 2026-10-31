import { redirect } from 'next/navigation';

export default async function SharedPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  redirect(`/social?post=${encodeURIComponent(postId)}`);
}
