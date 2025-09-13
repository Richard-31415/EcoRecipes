import Link from "next/link";
import { Button } from "./ui/button";

export function AuthButton() {
  // Optional authentication - users can use the app without logging in
  const user = null; // Always show login options but don't require them

  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}