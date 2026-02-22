import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import LayoutWrapper from "@/components/LayoutWrapper";
import { LogIn, Mail, AlertCircle, Lock } from "lucide-react";

export default function ClienteAcesso() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const findAppointmentMutation = trpc.appointments.findByEmail.useMutation({
    onSuccess: (appointment) => {
      if (appointment) {
        // Redirect to client dashboard
        setLocation(`/client/dashboard/${appointment.id}`);
      } else {
        setError("Incorrect email or password.");
      }
      setIsLoading(false);
    },
    onError: () => {
      setError("Error fetching booking. Please try again.");
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    findAppointmentMutation.mutate({ 
      email: email.trim(),
      password: password.trim()
    });
  };

  return (
    <LayoutWrapper>
      <div className="min-h-screen flex flex-col bg-black">
      
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Client Area</h1>
            <p className="text-gray-400">
              Access your panel to track your project
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="pl-10 bg-gray-800 border-gray-700"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter the email used for your booking
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-gray-800 border-gray-700"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Password provided by the photographer
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-600 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Access Panel"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-sm text-gray-400 text-center">
              Can't find your booking?<br />
              Get in touch with us through the{" "}
              <a href="/contact" className="text-red-400 hover:underline">
                contact form
              </a>
            </p>
          </div>
        </Card>
      </main>

      </div>
    </LayoutWrapper>
  );
}
