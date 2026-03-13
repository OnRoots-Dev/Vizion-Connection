// app/(auth)/register/page.tsx

import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ background: "#07070e", minHeight: "100vh" }} />}>
      <RegisterForm />
    </Suspense>
  );
}