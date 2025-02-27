import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return <><Component {...pageProps} />
  <Toaster richcolours /></>
}
