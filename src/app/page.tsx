import { HeroSection } from '@/components/hero-section';
import { Features } from '@/components/features';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <Features />
    </div>
  );
}