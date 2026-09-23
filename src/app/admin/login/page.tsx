import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Editor sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ signedout?: string }> }) {
  if (await currentUser()) redirect("/admin");
  const { signedout } = await searchParams;
  return (
    <main className="login">
      <div className="panel">
        <div className="logo" style={{ fontSize: "2.6rem" }}>
          Glitz<span className="amp">&amp;</span>Style
        </div>
        <div>
          <h1 style={{ fontSize: "1.6rem" }}>Editor sign in</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0", fontSize: ".9rem" }}>For the Glitz &amp; Style editorial and events team.</p>
        </div>
        {signedout ? <div className="flash">You&apos;re signed out.</div> : null}
        <LoginForm />
      </div>
    </main>
  );
}
