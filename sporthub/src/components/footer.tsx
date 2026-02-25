import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            SportHub — Discover and book group sports, classes, and activities.
          </p>
          <nav className="flex gap-6 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Discover
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
          </nav>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          © {new Date().getFullYear()} SportHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
