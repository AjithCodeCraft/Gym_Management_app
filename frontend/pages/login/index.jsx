import { useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid email or password");
      }

      const data = await response.json();
      
      // Ensure navigation completes before setting cookies
      if (data.user_type === "admin") {
        await router.push("/admin/dashboard");
        Cookies.set("admin_id", data.user_id, { expires: 7, secure: true });
        Cookies.set("access_token", data.access, { expires: 7, secure: true });
      } else if (data.user_type === "trainer") {
        await router.push("/trainer");
        Cookies.set("trainer_id", data.user_id, { expires: 7, secure: true });
        Cookies.set("access_token", data.access, { expires: 7, secure: true });
      } else {
        throw new Error("Invalid user. Please contact support.");
      }

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/password-reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send reset link");
      }

      setResetSuccess(true);
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const closeResetModal = () => {
    setIsResetOpen(false);
    setTimeout(() => {
      setResetEmail("");
      setResetError("");
      setResetSuccess(false);
    }, 300); // Delay reset to avoid flickering
  };

  return (
    <div className="h-screen overflow-hidden grid lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Logo and Brand */}
        <div className="flex justify-center gap-2 md:justify-start px-6 md:px-0">
          <div className="flex items-center gap-2 font-medium">
            <Image
              src="/g308.png"
              alt="Logo"
              width={70}
              height={50}
              className="object-contain"
            />
            <h1 className="text-2xl font-bold">FortiFit Gym</h1>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className="flex flex-col gap-6" onSubmit={handleLogin}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email below to login to your account
                </p>
              </div>
              
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                      onClick={() => setIsResetOpen(true)}
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side Image */}
      <div className="relative hidden lg:block">
        <Image
          src="/loginimage.png"
          alt="Login Cover"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={isResetOpen} onOpenChange={closeResetModal}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>
              {resetSuccess ? "Check Your Email" : "Forgot Password"}
            </DialogTitle>
            <DialogDescription>
              {resetSuccess
                ? `We've sent a password reset link to ${resetEmail}`
                : "Enter your email to receive a reset link"}
            </DialogDescription>
          </DialogHeader>

          {!resetSuccess ? (
            <form onSubmit={handleResetPassword} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="m@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              {resetError && (
                <p className="text-red-500 text-sm">{resetError}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={resetLoading}
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="bg-green-100 p-4 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <Button
                onClick={closeResetModal}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}