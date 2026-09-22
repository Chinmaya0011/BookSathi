import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BlogShareBar from '@/components/blog/BlogShareBar';
import BlogIcon from '@/components/blog/BlogIcon';
import {
  getBlogPostBySlug,
  getAllBlogSlugs,
  getPreviousAndNextPost,
  getRelatedPosts,
} from '@/lib/blogData';
import { constructMetadata } from '@/lib/metadata';
import {
  Clock,
  Calendar,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  BookOpen,
  User,
  ShieldCheck,
  Tag,
  ChevronLeft,
  Layers,
  FileCode,
} from 'lucide-react';

/**
 * Static params generator for Next.js build pre-rendering
 */
export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Dynamic SEO Metadata per article
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return constructMetadata({
      title: 'Article Not Found | BookSaathi Blog',
      description: 'The requested practice guide could not be found.',
      noIndex: true,
    });
  }

  return constructMetadata({
    title: post.metaTitle || `${post.title} | BookSaathi Blog`,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.tags,
    type: 'article',
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { previous, next } = getPreviousAndNextPost(post.slug);
  const relatedPosts = getRelatedPosts(post.slug, post.category, 3);

  // Article Schema.org JSON-LD
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'BookSaathi',
      url: 'https://booksaathi.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://booksaathi.in/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://booksaathi.in/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  };

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://booksaathi.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://booksaathi.in/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://booksaathi.in/blog/${post.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-900 flex flex-col selection:bg-indigo-600 selection:text-white font-sans">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Header */}
      <Navbar />

      <main className="flex-1">
        {/* Article Header & Breadcrumbs */}
        <header className="pt-8 pb-10 sm:pt-12 sm:pb-14 bg-white border-b border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            
            {/* Back Button & Breadcrumb Navigation */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to all guides</span>
              </Link>

              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Link href="/" className="hover:text-indigo-600 transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <Link href="/blog" className="hover:text-indigo-600 transition-colors">
                  Blog
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-slate-900 font-bold">{post.categoryLabel}</span>
              </nav>
            </div>

            {/* Category Badge & Metadata */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {post.categoryLabel}
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {post.readTime}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Updated {new Date(post.updatedAt || post.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.18]">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              {post.description}
            </p>

            {/* Author Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {post.author.initials || 'BS'}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{post.author.name}</div>
                  <div className="text-xs text-slate-500">{post.author.role}</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </header>

        {/* Large Featured Image / Topic Header Banner */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-6 relative z-10">
          <div className={`w-full h-48 sm:h-64 rounded-3xl bg-gradient-to-tr ${post.coverGradient} shadow-xl flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden`}>
            <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-3 border border-white/20">
              <BlogIcon name={post.iconName} className="w-10 h-10 text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-100">
              BookSaathi Practice Guide
            </span>
            <span className="text-sm sm:text-base font-bold text-white max-w-lg mt-1 line-clamp-2">
              {post.title}
            </span>
          </div>
        </section>

        {/* Article Body Content */}
        <article className="py-10 sm:py-14 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-slate-200/90 shadow-xs space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
            
            {/* Formatted Content Renderer */}
            {post.content.split('\n\n').map((block, idx) => {
              const trimmed = block.trim();
              if (!trimmed) return null;

              // Section Heading H2
              if (trimmed.startsWith('## ')) {
                return (
                  <h2
                    key={idx}
                    className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 pt-6 pb-2 border-b border-slate-100 tracking-tight"
                  >
                    {trimmed.replace(/^##\s+/, '')}
                  </h2>
                );
              }

              // Subheading H3
              if (trimmed.startsWith('### ')) {
                return (
                  <h3
                    key={idx}
                    className="text-lg sm:text-xl font-bold text-slate-900 pt-4 pb-1 tracking-tight text-indigo-950"
                  >
                    {trimmed.replace(/^###\s+/, '')}
                  </h3>
                );
              }

              // Code Block
              if (trimmed.startsWith('```')) {
                const codeLines = trimmed.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '');
                return (
                  <div key={idx} className="my-5 rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400 font-sans">
                      <span className="flex items-center gap-1.5 font-bold">
                        <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                        Code / Integration Example
                      </span>
                      <span>HTML / Widget</span>
                    </div>
                    <pre className="whitespace-pre">{codeLines}</pre>
                  </div>
                );
              }

              // Markdown Table
              if (trimmed.startsWith('|')) {
                const rows = trimmed.split('\n').map((r) => r.trim()).filter(Boolean);
                if (rows.length >= 2) {
                  const headers = rows[0].split('|').map((h) => h.trim()).filter(Boolean);
                  const dataRows = rows.slice(2);
                  return (
                    <div key={idx} className="my-6 overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-100/90 text-slate-900 font-bold border-b border-slate-200">
                          <tr>
                            {headers.map((h, i) => (
                              <th key={i} className="p-3 sm:p-4">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {dataRows.map((r, i) => {
                            const cells = r.split('|').map((c) => c.trim()).filter(Boolean);
                            return (
                              <tr key={i} className="hover:bg-slate-50/80">
                                {cells.map((c, j) => (
                                  <td key={j} className="p-3 sm:p-4 text-slate-700">
                                    {c}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                }
              }

              // Unordered Checkmark List
              if (trimmed.startsWith('- ')) {
                const items = trimmed.split('\n').map((item) => item.replace(/^[-\*]\s+/, '').trim());
                return (
                  <ul key={idx} className="space-y-2.5 my-4">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }

              // Numbered Steps List
              if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ')) {
                const items = trimmed.split('\n').map((item) => item.replace(/^\d+\.\s+/, '').trim());
                return (
                  <ol key={idx} className="space-y-3 my-4">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700">
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                          {i + 1}
                        </span>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ol>
                );
              }

              // Horizontal Divider
              if (trimmed === '---') {
                return <hr key={idx} className="my-8 border-slate-100" />;
              }

              // Standard Paragraph
              return (
                <p key={idx} className="leading-relaxed font-normal text-slate-700">
                  {trimmed}
                </p>
              );
            })}

            {/* Social Share Bar */}
            <BlogShareBar title={post.title} url={`https://booksaathi.in/blog/${post.slug}`} />

            {/* Author Box Spotlight */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-lg flex items-center justify-center shrink-0 shadow-2xs">
                {post.author.initials || 'BS'}
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <h4 className="text-base font-bold text-slate-900">{post.author.name}</h4>
                  <span className="text-xs font-semibold text-indigo-600 sm:border-l sm:border-slate-300 sm:pl-3">
                    {post.author.role}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {post.author.bio ||
                    'Authored by practice management specialists at BookSaathi. We help Indian doctors, chartered accountants, advocates, and tutors streamline appointments, accept direct UPI payments, and manage live token queues.'}
                </p>
              </div>
            </div>

            {/* Previous & Next Article Navigation */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {previous ? (
                <Link
                  href={`/blog/${previous.slug}`}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 transition-all flex flex-col justify-between space-y-1 group"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ChevronLeft className="w-3 h-3" /> Previous Guide
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {previous.title}
                  </span>
                </Link>
              ) : (
                <div className="hidden sm:block" />
              )}

              {next && (
                <Link
                  href={`/blog/${next.slug}`}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 transition-all flex flex-col justify-between space-y-1 text-right group"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1">
                    Next Guide <ChevronRight className="w-3 h-3" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {next.title}
                  </span>
                </Link>
              )}
            </div>

          </div>

          {/* Bottom Practice CTA Card */}
          <div className="mt-10 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-xl text-center space-y-4">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <Sparkles className="w-3 h-3 text-amber-300" /> Start Free in 2 Minutes
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Ready to automate your practice appointments?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed font-normal">
              Create your custom booking link, print your tabletop QR standee, and collect direct 0% commission UPI fees starting today.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <span>Create Free Practice Page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </article>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="py-12 sm:py-16 bg-white border-t border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Related Practice Guides
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    More articles in {post.categoryLabel}
                  </p>
                </div>

                <Link
                  href="/blog"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>View all guides</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {relatedPosts.map((related) => (
                  <article
                    key={related.slug}
                    className="rounded-3xl bg-slate-50/70 border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:bg-white transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      <div className={`h-28 bg-gradient-to-tr ${related.coverGradient} flex items-center justify-center relative`}>
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/25">
                          <BlogIcon name={related.iconName} className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-bold text-indigo-600">{related.categoryLabel}</span>
                          <span>{related.readTime}</span>
                        </div>
                        <Link href={`/blog/${related.slug}`}>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                            {related.title}
                          </h4>
                        </Link>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                          {related.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100">
                      <Link
                        href={`/blog/${related.slug}`}
                        className="text-xs font-bold text-indigo-600 flex items-center gap-1"
                      >
                        <span>Read Guide</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
