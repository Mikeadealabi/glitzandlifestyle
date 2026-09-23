import { requireUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { PasswordForm } from "@/components/admin/PasswordForm";

export const metadata = { title: "Your account", robots: { index: false } };

export default async function Account() {
  const user = await requireUser();
  return (
    <AdminShell user={user} current="/admin/account">
      <div className="admin-top">
        <div>
          <h1>Your account</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: ".9rem" }}>
            Signed in as {user.email}.
          </p>
        </div>
      </div>
      <PasswordForm />
    </AdminShell>
  );
}
