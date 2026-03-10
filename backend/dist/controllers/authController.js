import * as tokenService from "../services/tokenService.js";
import * as userService from "../services/userService.js";
import ApiError from "../utils/ApiError.js";
import { validateEmailPassword } from "../utils/emailPassword.js";
/**
 * Auth Controller - Functional approach for handling auth-related HTTP requests
 */
/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 * Body: { refreshToken: string }
 */
export async function refreshToken(c) {
    const body = await c.req.json();
    const { refreshToken } = body;
    if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
    }
    try {
        // Verify refresh token and generate new access token
        const newAccessToken = tokenService.refreshAccessToken(refreshToken);
        return c.json({
            accessToken: newAccessToken
        });
    }
    catch (error) {
        throw new ApiError(401, 'Invalid or expired refresh token');
    }
}
/**
 * GET /auth/me
 * Get current user info (requires auth middleware)
 */
export async function getCurrentUser(c) {
    // User is already attached by auth middleware
    const userId = c.get('userId');
    if (!userId) {
        throw new ApiError(401, 'Unauthorized');
    }
    const user = await userService.getUserById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    return c.json({ user });
}
/**
 * GET /auth/identities
 * Get all linked identities for current user
 */
export async function getUserIdentities(c) {
    const userId = c.get('userId');
    if (!userId) {
        throw new ApiError(401, 'Unauthorized');
    }
    const identities = await userService.getUserIdentities(userId);
    return c.json({ identities });
}
/**
 * DELETE /auth/identities/:provider
 * Unlink an identity provider
 */
export async function unlinkIdentity(c) {
    const userId = c.get('userId');
    const provider = c.req.param('provider');
    if (!userId) {
        throw new ApiError(401, 'Unauthorized');
    }
    try {
        await userService.unlinkIdentity(userId, provider);
        return c.json({ message: 'Identity unlinked successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            throw new ApiError(400, error.message);
        }
        throw error;
    }
}
/**
 * POST /auth/register
 * Register new user with email and password
 * Body: { email: string, password: string, name?: string }
 */
export async function register(c) {
    try {
        const body = await c.req.json();
        const { email, password, name } = body;
        if (!email || !password) {
            throw new ApiError(400, 'Email and password are required');
        }
        validateEmailPassword(email, password);
        // Register user in database with hashed password
        const user = await userService.registerWithEmailPassword(email, password, name);
        // Generate JWT tokens
        const tokens = tokenService.generateTokens(user.id, user.email);
        return c.json({
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        }, 201);
    }
    catch (error) {
        if (error instanceof Error) {
            throw new ApiError(400, error.message);
        }
        throw error;
    }
}
/**
 * POST /auth/login
 * Login with email and password
 * Body: { email: string, password: string }
 */
export async function login(c) {
    try {
        const body = await c.req.json();
        const { email, password } = body;
        if (!email || !password) {
            throw new ApiError(400, 'Email and password are required');
        }
        validateEmailPassword(email, password);
        // Authenticate user and verify password
        const user = await userService.authenticateWithEmailPassword(email, password);
        // Generate JWT tokens
        const tokens = tokenService.generateTokens(user.id, user.email);
        return c.json({
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            throw new ApiError(401, error.message);
        }
        throw error;
    }
}
