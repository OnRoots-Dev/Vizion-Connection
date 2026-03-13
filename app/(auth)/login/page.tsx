// app/(auth)/login/page.tsx

import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ background: "#07070e", minHeight: "100vh" }} />}>
            <LoginForm />
        </Suspense>
    );
}