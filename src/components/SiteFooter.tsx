import Link from "next/link";
import { Newsletter } from "@/components/Newsletter";

export function SiteFooter() {
  return (
    <>
      <section className="news">
        <div className="wrap">
          <h2>Get the Sunday Guestlist</h2>
          <Newsletter />
        </div>
      </section>
      <footer className="site">
        <div className="wrap">
          <div className="brand">
            <div className="logo">
              Glitz<span className="amp">&amp;</span>Style
            </div>
            <p style={{ maxWidth: "34ch" }}>
              Showcasing your events and lifestyle. Weddings, galas, owambes, red carpets and the people who make them shine.
            </p>
          </div>
          <div>
            <h4>Read</h4>
            <ul>
              <li><Link href="/?section=events#stories">Events</Link></li>
              <li><Link href="/?section=weddings#stories">Weddings</Link></li>
              <li><Link href="/#carpet">Red Carpet</Link></li>
              <li><Link href="/#guestlist">The Guestlist</Link></li>
            </ul>
          </div>
          <div>
            <h4>Work with us</h4>
            <ul>
              <li><Link href="/#book">Event coverage</Link></li>
              <li><Link href="/#book">Advertising</Link></li>
              <li><Link href="/#cover-maker">Be the cover</Link></li>
            </ul>
          </div>
          <div>
            <h4>Team</h4>
            <ul>
              <li><Link href="/admin">Editor login</Link></li>
            </ul>
          </div>
        </div>
        <div className="wrap legal">© {new Date().getFullYear()} Glitz &amp; Style Magazine</div>
      </footer>
    </>
  );
}
