"use client";

import Link from "next/link";

import NotFoundIllustration from "@/components/404/not-found-illustration";
import Button from "@/components/button";

export default function NotFound() {
  return (
    <div className="min-h-screen" 
    style={{
            background: `
            radial-gradient(ellipse at 15% 50%, #bfdbfe 0%, transparent 50%),
            radial-gradient(ellipse at 85% 15%, #ffffff 0%, transparent 45%),
            radial-gradient(ellipse at 80% 85%, #bae6fd 0%, transparent 40%),
            #f0f7ff
            `,
        }}>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6">
            <h1 className="text-2xl font-bold text-primary-800">Oops!</h1>

            <div className="flex items-center gap-4">
                <span className="text-[10rem] font-bold text-primary-800">4</span>
                <NotFoundIllustration />
                <span className="text-[10rem] font-bold text-primary-800">4</span>
            </div>
            
            <p className="text-sm text-gray-500 text-center max-w-xs">
                We&apos;re sorry, the page you requested could not be found. Please go back to the homepage.
            </p>

            <Link href="/">
                <Button variant="primary" size="md" text="Go back home" />
            </Link>
        </div>
    </div>
    );
}