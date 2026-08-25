'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArtisanDetail } from '@/components/artisan-detail';

export default function ArtisanPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <ArtisanDetail
      artisanId={id || ''}
      onBack={() => router.back()}
    />
  );
}
