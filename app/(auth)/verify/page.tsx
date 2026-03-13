import { Suspense } from "react";
import VerifyContent from "./VerifyContent";

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
            <VerifyContent />
        </Suspense>
    );
}