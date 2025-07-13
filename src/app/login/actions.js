"use server";

import { z } from "zod";
import { createSession, deleteSession } from "./session";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "./password";

const loginSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, { message: "Username must be at least 3 characters" })
        .max(20, { message: "Username cannot be more than 20 characters" }),
    password: z
        .string()
        .trim()
        .min(8, { message: "Password must be at least 8 characters" })
        .max(40, { message: "Password cannot be more than 40 characters" }),
});

export async function loginFunction(prevState, formData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        };
    }

    const { username, password } = result.data;
    const baseUrl = 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/db/user/${username}`);
    const data = await response.json();
    const { id, role, hashedPass } = data;
    if (verifyPassword(password, hashedPass)) {
        {
            await createSession(id, role);
            if (role > -1 && role <= 1)
                redirect("/admin");
        }
    } else {
        return {
            errors: {
                email: ["Invalid email or password"],
            },
        };
    }
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}

export async function hashPasswordAction(plainPassword) {
    return hashPassword(plainPassword);
}