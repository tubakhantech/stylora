import { Suspense } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <AuthLayout title="Welcome Back">
            <Suspense fallback={null}>
                <LoginForm />
            </Suspense>
        </AuthLayout>
    );
}