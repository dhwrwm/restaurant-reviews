import type { CookieOptions, Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'auth';
export const REFRESH_TOKEN_COOKIE = 'refresh';

const ACCESS_TOKEN_MAX_AGE = 1000 * 60 * 15;
const REFRESH_TOKEN_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

const BASE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

export function setAccessTokenCookie(res: Response, accessToken: string) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

export function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, BASE_COOKIE_OPTIONS);
  res.clearCookie(REFRESH_TOKEN_COOKIE, BASE_COOKIE_OPTIONS);
}
