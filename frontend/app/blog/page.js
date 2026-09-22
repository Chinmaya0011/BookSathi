'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BlogIcon from '@/components/blog/BlogIcon';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/lib/blogData';
import {
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  Search,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Mail,
  CheckCircle2,
  Filter,
  Layers,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

const POSTS_PER_PAGE = 6;

export default function BlogIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === 'all' || post.category === selectedCategory;
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + POSTS_PER_PAGE);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setNewsletterSubscribed(true);
    toast.success('Thank you for subscribing to BookSaathi Practice Insights!');
  };

  // Schema.org Structured Data for Blog
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'BookSaathi Practice Insights & Growth Blog',
    description:
      'Expert guides, scheduling best practices, and practice management tips for Indian Doctors, Chartered Accountants, Advocates, and Consultants.',
    url: 'https://booksaathi.in/blog',
    publisher: {
      '@type': 'Organization',
      name: 'BookSaathi',
      logo: {
        '@type': 'ImageObject',
        url: 'https://booksaathi.in/logo.png',
      },
    },
    blogPost: BLOG_POSTS.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        '@type': 'Person',
        name: post.author.name,
      },
      url: `https://booksaathi.in/blog/${post.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col selection:bg-indigo-600 selection:text-white font-sans">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      {/* Header / Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-10 pb-12 sm:pt-16 sm:pb-16 bg-white overflow-hidden border-b border-slate-200/70">
          {/* Subtle Background Glowing Blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-indigo-100/40 via-violet-100/30 to-emerald-100/30 blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-indigo-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-900">Blog & Practice Guides</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Practice Management & Scheduling Guides</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
              Master your practice.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600">
                Eliminate chaos.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Actionable guides, real-world case studies, and scheduling frameworks tailored specifically for Indian doctors, chartered accountants, advocates, and independent practitioners.
            </p>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto pt-2">
              <div className="relative shadow-xs rounded-2xl bg-white">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search articles by topic, keyword, or author..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(POSTS_PER_PAGE);
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 font-medium"
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {BLOG_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setVisibleCount(POSTS_PER_PAGE);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* Featured Post Spotlight (When showing all and no search) */}
        {selectedCategory === 'all' && !searchQuery && featuredPost && (
          <section className="py-10 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800 overflow-hidden group">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Left Content */}
                <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-400 text-slate-950 uppercase tracking-wider">
                      Featured Guide
                    </span>
                    <span className="text-xs text-indigo-300 font-semibold">
                      {featuredPost.categoryLabel}
                    </span>
                  </div>

                  <Link href={`/blog/${featuredPost.slug}`}>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white group-hover:text-indigo-200 transition-colors tracking-tight leading-tight">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal line-clamp-3">
                    {featuredPost.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-2 text-slate-200">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/30 text-indigo-200 flex items-center justify-center text-[10px] font-bold border border-indigo-400/30">
                        {featuredPost.author.initials || 'BS'}
                      </span>
                      <span>{featuredPost.author.name}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{featuredPost.readTime}</span>
                    </span>
                    <span>•</span>
                    <span>{new Date(featuredPost.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div className="pt-3">
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <span>Read Full Guide</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Right Visual Box */}
                <div className="lg:col-span-5 p-6 sm:p-8 flex justify-center">
                  <div className={`w-full max-w-sm h-56 sm:h-64 rounded-2xl bg-gradient-to-tr ${featuredPost.coverGradient} flex flex-col items-center justify-center p-6 text-center text-white shadow-lg relative overflow-hidden group-hover:scale-102 transition-transform duration-300`}>
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center mb-3 border border-white/20">
                      <BlogIcon name={featuredPost.iconName} className="w-9 h-9 text-white" />
                    </div>
                    <div className="text-xs uppercase font-black tracking-widest text-indigo-100">
                      BookSaathi Practice Guide
                    </div>
                    <div className="text-sm font-bold text-white mt-1 line-clamp-2">
                      {featuredPost.title}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* Articles Grid Section */}
        <section className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {selectedCategory === 'all'
                  ? 'Latest Articles & Guides'
                  : BLOG_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Articles'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Practical insights to streamline scheduling and grow client retention
              </p>
            </div>

            <span className="text-xs text-slate-600 font-bold bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No articles found matching &ldquo;{searchQuery}&rdquo;</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching with different keywords like doctor, UPI, queue, or reset the category filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displayedPosts.map((post) => (
                <article
                  key={post.slug}
                  className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Visual Card Banner with Topic Icon */}
                    <Link href={`/blog/${post.slug}`}>
                      <div className={`h-36 sm:h-40 bg-gradient-to-tr ${post.coverGradient} flex items-center justify-center relative overflow-hidden group-hover:opacity-95 transition-opacity`}>
                        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 transform group-hover:scale-110 transition-transform duration-200">
                          <BlogIcon name={post.iconName} className="w-7 h-7 text-white" />
                        </div>
                        <div className="absolute bottom-3 left-3 bg-slate-950/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          {post.categoryLabel}
                        </div>
                      </div>
                    </Link>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{post.readTime}</span>
                        </span>
                        <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 font-normal">
                        {post.description}
                      </p>

                      {/* Tag Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Author & Read More */}
                  <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                        {post.author.initials || 'BS'}
                      </span>
                      <span className="font-bold text-slate-800 text-[11px] truncate max-w-[130px]">
                        {post.author.name}
                      </span>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-6">
              <button
                type="button"
                onClick={handleLoadMore}
                className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
              >
                Load More Articles ({filteredPosts.length - visibleCount} remaining)
              </button>
            </div>
          )}

        </section>

        {/* Newsletter & Practice Tips Strip */}
        <section className="py-12 sm:py-16 bg-white border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
              <Mail className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Get Monthly Practice Management Insights
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Join 5,000+ Indian practitioners receiving our monthly digest on clinic automation, tax advisory scheduling, and 0% UPI collection.
              </p>
            </div>

            {!newsletterSubscribed ? (
              <form
                onSubmit={handleNewsletterSubmit}
                className="max-w-md mx-auto flex flex-col sm:flex-row items-center gap-2"
              >
                <input
                  type="email"
                  placeholder="Enter your professional email..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 font-medium"
                  required
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 shadow-sm transition-all"
                >
                  Subscribe Free
                </button>
              </form>
            ) : (
              <div className="inline-flex items-center gap-2 p-3 px-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>You are subscribed! We will send only high-value practice guides.</span>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
