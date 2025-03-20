import { useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      if (data.user_type === "admin") {
        Cookies.set("user_id", data.user_id, { expires: 7, secure: true });
        Cookies.set("access_token", data.access, { expires: 7, secure: true });
        router.push("admin/dashboard");
      } else if (data.user_type === "trainer") {
        Cookies.set("user_id", data.user_id, { expires: 7, secure: true });
        Cookies.set("access_token", data.access, { expires: 7, secure: true });
        router.push("/trainer");
      } else {
        throw new Error("Invalid user. Please contact support.");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden grid lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start px-6 md:px-0">
          <a href="#" className="flex items-center gap-2 font-medium">
           
            <Image
              src="/g308.png"
              alt="Logo"
              width={70}
              height={50}
              className="object-contain"
            />
            <h1 className="text-2xl font-bold">FortiFit Gym</h1>
          </a>
        </div>
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
                    <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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
      <div className="relative hidden lg:block">
        <Image
          src="/loginimage.png"
          alt="Login Cover"
          width={1920}
          height={1080}
          className="h-full w-full object-cover"
          priority
        />
      </div>
    </div>
  );
}
