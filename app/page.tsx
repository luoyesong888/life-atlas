import { cookies } from "next/headers";
import LifeAtlas from "./components/LifeAtlas";
import InviteGate from "./components/InviteGate";
import { hasUserAccessCookie, USER_ACCESS_COOKIE } from "./lib/user-access";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  if (!hasUserAccessCookie(cookieStore.get(USER_ACCESS_COOKIE)?.value)) return <InviteGate />;
  return <LifeAtlas />;
}
