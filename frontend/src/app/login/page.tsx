import LoginPageClient from "./LoginPageClient";
import { getLoginSettings } from "@/lib/loginSettings";

export default async function LoginPage() {
  const loginSettings = await getLoginSettings({ cache: "no-store" });
  return <LoginPageClient initialSettings={loginSettings} />;
}
