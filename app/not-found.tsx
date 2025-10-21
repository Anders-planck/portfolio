"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center space-y-8">
        {/* 404 Title */}
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-primary animate-pulse">
            404
          </h1>
          <h2 className="text-4xl font-semibold">Page Not Found</h2>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Countdown */}
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground">
            Redirecting to homepage in{" "}
            <span className="text-2xl font-bold text-primary">{countdown}</span>{" "}
            second{countdown !== 1 ? "s" : ""}...
          </p>

          {/* Manual Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <Home className="h-5 w-5" />
            Go Home Now
          </Link>
        </div>
      </div>
    </div>
  );
}
