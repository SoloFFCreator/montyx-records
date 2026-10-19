import { Link } from "wouter";
import { usePageMeta } from "@/components/SiteLayout";

export default function NotFound() {
  usePageMeta("Page not found — MONTYX RECORDS", "This MONTYX RECORDS page could not be found.");
  return <main className="not-found content-width"><span className="eyebrow red">404 · OFF THE MAP</span><h1>This page isn’t in the mix.</h1><p>The link may have changed, or the page may not be published.</p><Link className="button button-primary" href="/">Back to home ↗</Link></main>;
}
