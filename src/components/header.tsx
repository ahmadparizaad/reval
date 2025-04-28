"use client";

import Link from "next/link";
import { Brain } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
export default function Header() {
  const { user } = useUser();
  const router = useRouter();

  const handleProtectedNavigation = (path: string) => {
    if (user) {
      router.push(path);
    } else {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to access this feature',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b px-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image alt="logo" src='/logo.png' width={30} height={30}/>
            <span className="font-bold">Reval</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <button 
              onClick={() => handleProtectedNavigation('/evaluate')}
              className="transition-colors hover:text-foreground/80"
            >
              Evaluate
            </button>
            <button 
              onClick={() => handleProtectedNavigation('/history')}
              className="transition-colors hover:text-foreground/80"
            >
              History
            </button>
            {/* <Link href="/docs" className="transition-colors hover:text-foreground/80">
              Docs
            </Link> */}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <nav className="flex items-center space-x-4">
            <ModeToggle />
            <SignedOut>
              <div className="flex items-center space-x-4">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm"
                  className="border border-gray-500 px-3">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" className="px-3">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </div>
    </header>
  );
}