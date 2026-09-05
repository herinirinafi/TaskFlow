import { RouterProvider } from 'react-router-dom';
import { GlobalConfirm, Toaster } from '@/components/ui/Toaster';
import { router } from '@/routes';
import { useBootstrap } from '@/hooks/useBootstrap';
import { PageLoader } from '@/components/ui/Spinner';

export default function App() {
  const loading = useBootstrap();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <PageLoader />
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
      <GlobalConfirm />
    </>
  );
}