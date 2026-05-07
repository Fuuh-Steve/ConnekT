'use client';

import { ProfilePage } from '@/src/views/ProfilePage';
import { useParams } from 'next/navigation';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  
  return <ProfilePage lookupBy={username} />;
}
