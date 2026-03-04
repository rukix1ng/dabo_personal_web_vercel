import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import { headers } from "next/headers";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check authentication
    const admin = await getCurrentAdmin();
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "";

    // Check if we're on the login page
    const isLoginPage = pathname === "/admin/login" || pathname.startsWith("/admin/login");

    // If no admin and not on login page, redirect to login
    if (!admin && !isLoginPage) {
        redirect("/admin/login");
    }

    // If no admin, return children without layout for login page
    if (!admin) {
        return <>{children}</>;
    }

    console.log('AdminLayout rendered, admin:', admin.username);

    return (
        <div className="flex h-screen overflow-hidden bg-background admin-font">
            {/* Sidebar */}
            <AdminNav username={admin.username} />

            {/* Main Content */}
            <main id="admin-content" className="ml-64 flex-1 overflow-auto">
                <div className="container mx-auto p-8">{children}</div>
            </main>
        </div>
    );
}
