import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-secondary-50">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16 ">
        <h1 className="text-4xl font-bold tracking-tight text-primary-900 sm:text-6xl">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Maamul360
          </span>
        </h1>
        <p className="text-center text-lg text-muted-foreground">
          Your complete business management solution. Start managing your business
          efficiently today.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg" className="bg-primary-600 hover:bg-primary-700">
            <Link href="/register">Register Now</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary-200 hover:bg-primary-50"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
