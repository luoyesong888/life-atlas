import { hasUserAccessCookie, USER_ACCESS_COOKIE, userAccessSessionToken, verifyUserInviteCode } from "@/app/lib/user-access";

function cookieHeader(value: string, request: Request, maxAge: number) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${USER_ACCESS_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie")?.split(";").map(item => item.trim()).find(item => item.startsWith(`${USER_ACCESS_COOKIE}=`))?.slice(USER_ACCESS_COOKIE.length + 1);
  return Response.json({ authorized: hasUserAccessCookie(cookie) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { code?: string };
  if (!body.code || !verifyUserInviteCode(body.code)) return Response.json({ error: "测试码不正确，请检查后重试" }, { status: 401 });
  return Response.json({ authorized: true }, { headers: { "Set-Cookie": cookieHeader(userAccessSessionToken(), request, 60 * 60 * 24 * 7) } });
}

export async function DELETE(request: Request) {
  return Response.json({ authorized: false }, { headers: { "Set-Cookie": cookieHeader("", request, 0) } });
}
