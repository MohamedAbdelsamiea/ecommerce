import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg px-4 py-12 sm:py-16"><div className="h-12 w-12 bg-muted rounded-full animate-pulse mx-auto mb-4" /><div className="h-8 w-32 bg-muted rounded animate-pulse mx-auto mb-2" /><div className="h-4 w-48 bg-muted rounded animate-pulse mx-auto mb-8" /><div className="h-48 bg-muted rounded-xl animate-pulse" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
