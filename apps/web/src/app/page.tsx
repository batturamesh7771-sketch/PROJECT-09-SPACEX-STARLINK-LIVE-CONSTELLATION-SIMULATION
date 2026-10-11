import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import StatusBar from '@/components/Dashboard/StatusBar';

const GlobeWrapper = dynamic(() => import('@/components/Globe/GlobeWrapper'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden">
      <StatusBar />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <Suspense fallback={<div className="flex items-center justify-center h-full w-full bg-deep-navy">Loading Earth...</div>}>
            <GlobeWrapper />
          </Suspense>
        </div>
        <div className="w-[360px] bg-black/50 border-l border-gray-800">
          <Sidebar />
        </div>
      </div>
    </main>
  );
}
