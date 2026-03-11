import prisma from "../client.js";
import bcrypt from 'bcrypt';
/**
 * User Service - Functional approach for user and identity management
 */
/**
 * Get user by ID
 */
export async function getUserById(userId) {
    return await prisma.user.findFirst({
        where: { id: userId, isDeleted: false }
    });
}
/**
 * Get user by email
 */
export async function getUserByEmail(email) {
    return await prisma.user.findFirst({
        where: { email, isDeleted: false }
    });
}
/**
 * Get all identities for a user
 */
export async function getUserIdentities(userId) {
    return await prisma.userIdentity.findMany({
        where: { userId, isDeleted: false }
    });
}
/**
 * Unlink an identity from a user
 * Only allowed if user has at least one other identity
 */
export async function unlinkIdentity(userId, provider) {
    const identities = await getUserIdentities(userId);
    if (identities.length <= 1) {
        throw new Error('Cannot unlink last identity. User must have at least one login method.');
    }
    await prisma.userIdentity.updateMany({
        where: {
            userId,
            provider
        },
        data: {
            isDeleted: true
        }
    });
}
/**
 * Register user with email and password
 */
export async function registerWithEmailPassword(email, password, name) {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw new Error('User with this email already exists');
    }
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    // Create user with email/password identity
    const newUser = await prisma.user.create({
        data: {
            email,
            name: name || null,
            identities: {
                create: {
                    provider: 'EmailPassword',
                    providerId: email,
                    metadata: {
                        passwordHash,
                        emailVerified: false,
                        registeredAt: new Date().toISOString()
                    }
                }
            }
        }
    });
    return newUser;
}
/**
 * Authenticate user with email and password
 */
export async function authenticateWithEmailPassword(email, password) {
    // Find user identity
    const identity = await prisma.userIdentity.findFirst({
        where: {
            provider: 'EmailPassword',
            providerId: email,
            isDeleted: false
        },
        include: {
            user: true
        }
    });
    if (!identity || identity.user.isDeleted) {
        throw new Error('Invalid email or password');
    }
    // Verify password
    const metadata = identity.metadata;
    const isValid = await bcrypt.compare(password, metadata.passwordHash);
    if (!isValid) {
        throw new Error('Invalid email or password');
    }
    // Update last login
    await prisma.userIdentity.updateMany({
        where: { id: identity.id, isDeleted: false },
        data: {
            metadata: {
                ...metadata,
                lastLoginAt: new Date().toISOString()
            }
        }
    });
    return identity.user;
}
