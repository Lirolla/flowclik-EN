import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

const AUTH_TOKEN_KEY = "auth_token";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use fetch directly instead of tRPC to avoid header issues
      const response = await fetch('/api/trpc/customAuth.login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          json: { email, password }
        }),
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        toast.error(data.error?.message || "Incorrect email or password");
        setIsLoading(false);
        return;
      }

      // Get the token from the response
      const token = data?.result?.data?.json?.token;
      const userName = data?.result?.data?.json?.user?.name || "User";
      
      if (token) {
        // Save the token to localStorage
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        toast.success(`Welcome, ${userName}!`);
        
        // Use window.location to force complete reload
        window.location.href = "/admin";
      } else {
        toast.error("Login failed. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Unable to connect to the server");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">FlowClik</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            <LogIn className="h-4 w-4 mr-2" />
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Don't have an account?{" "}
            <a href="/register" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
