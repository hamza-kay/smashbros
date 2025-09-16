"use client";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-card-bg)] text-gray-700 mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-center">
          Powered by{" "}
          {/* Shown only on desktop */}
          <a
            href="https://grubify.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline text-[var(--color-accent)] hover:underline font-medium"
          >
            Grubify
          </a>
          {/* Shown only on mobile */}
          <span className="sm:hidden text-[var(--color-accent)] font-medium">
            Grubify
          </span>
        </p>
      </div>
    </footer>
  );
}
