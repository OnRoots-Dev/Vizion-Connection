import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div style={{ background: "#07070e", minHeight: "100vh" }} />}>
            <ResetPasswordForm />
        </Suspense>
    );
}