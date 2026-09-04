export const USER_ACCESS_COOKIE = "life_atlas_user_access";
export const DEFAULT_TEST_CODE = "LIFE-ATLAS-0904";
const DEFAULT_SESSION_TOKEN = "la_preview_b393cb846c60";

export function verifyUserInviteCode(value: string) {
  const expected = process.env.USER_INVITE_CODE || DEFAULT_TEST_CODE;
  const received = value.trim();
  if (received.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) difference |= expected.charCodeAt(index) ^ received.charCodeAt(index);
  return difference === 0;
}

export function userAccessSessionToken() {
  return process.env.USER_ACCESS_SESSION_TOKEN || DEFAULT_SESSION_TOKEN;
}

export function hasUserAccessCookie(value?: string) {
  return Boolean(value && value === userAccessSessionToken());
}
