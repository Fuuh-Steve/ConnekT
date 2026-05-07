import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-4xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="text-[rgb(var(--text-muted))] mb-8">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-[rgb(var(--accent))] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
      >
        Go back home
      </Link>
    </div>
  );
}
