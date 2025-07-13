"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginFunction } from "./actions";
import { hashPasswordAction } from "./actions";

export default function Login() {
    const [state, loginAction] = useActionState(loginFunction, undefined);

    function SubmitButton() {
        const { pending } = useFormStatus();

        return (
            <button disabled={pending} type="submit">
                Login
            </button>
        );
    }

    return (
        <form action={loginAction}>
            <div>
                <input id="username" name="username" placeholder="Username" />
            </div>
            {
                state?.errors?.email && (
                    <p>{state.errors.email}</p>
                )
            }

            <div>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                />
            </div>
            {
                state?.errors?.password && (
                    <p>{state.errors.password}</p>
                )
            }
            <SubmitButton />
            <button
                onClick={() => console.log(hashPasswordAction('frozenjw'))}
            >
                PASSWORD
            </button>
        </form >
    );
}