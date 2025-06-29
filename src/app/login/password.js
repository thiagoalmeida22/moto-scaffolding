import "server-only";
import bcrypt from "bcrypt";

export async function hashPassword(plainPassword) {
    const saltRounds = 12;
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(plainPassword, salt);
        return hash;
    } catch (error) {
        throw error;
    }
}

export async function verifyPassword(plainPassword, hashedPassword) {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch; // returns true if the passwords match, false otherwise
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
}