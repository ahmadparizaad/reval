'use client';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation';
// import { useUser } from '@clerk/nextjs'

export function HeroSection() {
  const { user } = useUser();
  const router = useRouter();

  const handleEvaluate = () => {
    if (user) {
      router.push('/evaluate');
    } else {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to start evaluating',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="relative isolate">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>
      
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-border hover:ring-foreground">
              Announcing our beta release.{" "}
              <Link href="/docs" className="font-semibold text-primary">
                <span className="absolute inset-0" aria-hidden="true" />
                Read more <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div> */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Compare and Evaluate LLM Responses with Confidence
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Reval helps you evaluate and compare responses from different Language Models. Get detailed accuracy scores, collect user feedback, and make informed decisions about which LLM works best for your needs.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" onClick={handleEvaluate}>
              Start Evaluating
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {/* <Button variant="outline" size="lg" asChild>
              <Link href="/docs">Learn more</Link>
            </Button> */}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </div>
  );
}