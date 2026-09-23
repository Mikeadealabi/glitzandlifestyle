import Link from "next/link";

export default function NotFound() {
  return (
    <main className="login">
      <div className="panel" style={{ textAlign: "center" }}>
        <div className="eyebrow">404</div>
        <h1 style={{ fontSize: "2.2rem" }}>This page left the party early</h1>
        <p style={{ color: "var(--muted)", margin: 0 }}>The story may have moved or been unpublished.</p>
        <Link className="btn btn-red" href="/">
          Back to the front page
        </Link>
      </div>
    </main>
  );
}
