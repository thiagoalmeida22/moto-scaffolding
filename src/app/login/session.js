import "server-only";
import { SignJWT, jwtVerify, importJWK } from "jose";
import { cookies } from "next/headers";

async function getCryptoKey() {
    const envKey = process.env[process.env.NODE_ENV === 'production' ? "PROD_ADMIN_SECRET" : "LOCAL_ADMIN_SECRET"];
    if (!envKey) {
        throw new Error("JWT SecretToken is not defined in the environment variables");
    }
    try {
        const jwk = JSON.parse(envKey);
        // Note: if you’re using this key solely for signing/verification, you may keep it extractable or not based on your needs.
        return importJWK(jwk, 'HS256');
    } catch (e) {
        throw new Error("Failed to parse the JWT secret from environment variables: " + e.message);
    }
}

export async function createSession(userId, role) {
    const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ userId, role, expiresAt });

    const cookieStore = await cookies();

    cookieStore.set("session", session, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
    });
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

export async function encrypt(payload) {
    const cryptoKey = await getCryptoKey();
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(cryptoKey);
}

export async function decrypt(cookie) {
    const cryptoKey = await getCryptoKey();
    try {
        const { payload } = await jwtVerify(cookie, cryptoKey, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        console.log("Failed to verify session");
    }
}