// app/stack-report/[slug]/page.js — a single Stack Report article.

import Link from "next/link";
import { notFound } from "next/navigation";
import { REPORT } from "@/lib/stack-report/config";
import { getPost, getPublishedPosts, formatDate } from "@/lib/stack-report/posts";

export const revalidate = 3600;

const SITE = "https://www.betselstack.com";

export function generateStaticParams() {
  return getPublishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  const url = `${SITE}${REPORT.path}/${post.slug}`;
  return {
    title: post.title,
    description: post.summary || REPORT.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.summary,
      url,
      siteName: "Betsel Stack",
      type: "article",
      publishedTime: `${post.date}T13:00:00Z`,
      ...(post.cover ? { images: [post.cover] } : {}),
    },
  };
}

export default async function StackReportPost({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const others = getPublishedPosts().filter((p) => p.slug !== post.slug).slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    datePublished: `${post.date}T13:00:00Z`,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Betsel Stack",
      logo: { "@type": "ImageObject", url: `${SITE}/betsel-logo.png` },
    },
    mainEntityOfPage: `${SITE}${REPORT.path}/${post.slug}`,
    ...(post.cover ? { image: `${SITE}${post.cover}` } : {}),
  };

  return (
    <div className="sr">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <article className="sr-article">
        <div className="container sr-narrow">
          <Link href={REPORT.path} className="sr-back">&larr; {REPORT.name}</Link>
          <h1 className="sr-article-title">{post.title}</h1>
          {post.summary && <p className="lead">{post.summary}</p>}
          <div className="sr-meta sr-article-meta">
            <span>{post.author}</span>
            <span>{formatDate(post.date)}</span>
            <span>{post.readMinutes} min read</span>
            {post.tags.map((t) => (
              <span key={t} className="sr-tag">{t}</span>
            ))}
          </div>
          {post.cover && <img className="sr-article-cover" src={post.cover} alt="" />}
          <div className="sr-prose" dangerouslySetInnerHTML={{ __html: post.html }} />

          <div className="sr-cta sr-cta--inline">
            <div>
              <h2>Try it on your own cases.</h2>
              <p>Betsel Stack generates ranked pallet patterns from your case and pallet dimensions in seconds.</p>
            </div>
            <Link href="/signup" className="btn btn--primary">Start free trial</Link>
          </div>

          {others.length > 0 && (
            <div className="sr-more">
              <h2>More from the Report</h2>
              <div className="sr-grid">
                {others.map((p) => (
                  <Link key={p.slug} href={`${REPORT.path}/${p.slug}`} className="card sr-card">
                    <h3>{p.title}</h3>
                    <div className="sr-meta"><span>{formatDate(p.date)}</span></div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
