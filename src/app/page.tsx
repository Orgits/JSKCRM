import { redirect } from "next/navigation";

/**
 * The staff dashboard is the home screen. Temporary (307) on purpose: once auth is wired up,
 * signed-out visitors should go to /login instead, and browsers cache permanent redirects.
 */
export default function Home() {
  redirect("/dashboard");
}
