"use client";

import Link from "next/link";
// import { Brain } from "lucide-react";
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
import { useEffect, useCallback } from "react";
import { fetchWithAuth, APIError } from '@/utils/api';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export default function Header() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const syncUser = useCallback(async (retryCount = 0) => {
    if (!user) return;

    try {
      const response = await fetchWithAuth('/users/sync-clerk', user.id, {
        method: 'POST',
        body: JSON.stringify({
          clerk_id: user.id,
          username: user.username || user.firstName,
          email: user.emailAddresses[0].emailAddress,
        }),
      });

      console.log('User synced successfully:', response);
    } catch (error) {
      console.error('Error syncing user:', error);

      if (error instanceof APIError) {
        // Handle specific error cases
        switch (error.code) {
          case 'CONNECTION_ERROR':
            if (retryCount < MAX_RETRIES) {
              console.log(`Retrying sync (${retryCount + 1}/${MAX_RETRIES})...`);
              setTimeout(() => syncUser(retryCount + 1), RETRY_DELAY);
              return;
            }
            toast({
              title: 'Connection Error',
              description: 'Unable to connect to the server. Please check if the server is running.',
              variant: 'destructive',
            });
            break;

          case 'AUTH_REQUIRED':
            toast({
              title: 'Authentication Error',
              description: 'Please sign in again',
              variant: 'destructive',
            });
            break;

          default:
            if (retryCount < MAX_RETRIES) {
              console.log(`Retrying sync (${retryCount + 1}/${MAX_RETRIES})...`);
              setTimeout(() => syncUser(retryCount + 1), RETRY_DELAY);
              return;
            }
            toast({
              title: 'Error',
              description: error.message || 'Failed to sync user data. Please try again later.',
              variant: 'destructive',
            });
        }
      } else {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again later.',
          variant: 'destructive',
        });
      }
    }
  }, [user]);

  // Sync user with backend when signed in
  useEffect(() => {
    if (isLoaded && user) {
      syncUser();
    }
  }, [user, isLoaded, syncUser]);

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
          <nav className="flex items-center space-x-6 text-sm font-medium">            <button 
              onClick={() => handleProtectedNavigation('/evaluate')}
              className="transition-colors hover:text-foreground/80"
            >
              Evaluate
            </button>
            <button 
              onClick={() => handleProtectedNavigation('/leaderboard')}
              className="transition-colors hover:text-foreground/80"
            >
              Leaderboard
            </button>
            <button 
              onClick={() => handleProtectedNavigation('/history')}
              className="transition-colors hover:text-foreground/80"
            >
              History
            </button>
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