import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug, blogPosts } from "@/data/blogPosts";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSEO } from "@/hooks/useSEO";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  useSEO({
    title: post.title,
    description: post.excerpt,
    image: post.thumbnail,
    url: `/blog/${post.slug}`,
    type: "article",
    keywords: `${post.category}, Islamic blog, Quran, Muslim community`,
  });

  // Get related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PageBreadcrumb
              items={[
                { label: t.header.blog, href: "/blog" },
                { label: post.title },
              ]}
            />

            <Link to="/blog">
              <Button variant="ghost" className="mb-6 -ms-4">
                <ArrowLeft className="w-4 h-4 me-2 rtl:rotate-180" />
                {t.blog.backToBlog}
              </Button>
            </Link>

            <article>
              {/* Header */}
              <header className="mb-8">
                <span className="inline-block text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                  {post.category}
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                  {post.title}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </span>
                </div>
              </header>

              {/* Featured Image */}
              <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-10">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
                {post.content.split("\n\n").map((paragraph, index) => {
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2
                        key={index}
                        className="text-2xl font-semibold text-foreground mt-8 mb-4"
                      >
                        {paragraph.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith("**") && paragraph.includes("**:")) {
                    const parts = paragraph.split("\n");
                    return (
                      <div key={index} className="my-4">
                        {parts.map((part, i) => {
                          const match = part.match(/\*\*(.+?)\*\*:(.+)/);
                          if (match) {
                            return (
                              <p key={i} className="text-muted-foreground mb-2">
                                <strong className="text-foreground">{match[1]}:</strong>
                                {match[2]}
                              </p>
                            );
                          }
                          return (
                            <p key={i} className="text-muted-foreground">
                              {part}
                            </p>
                          );
                        })}
                      </div>
                    );
                  }
                  return (
                    <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-16 pt-12 border-t border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-8">
                  {t.blog.relatedArticles}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="group"
                    >
                      <article className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-[16/10] overflow-hidden">
                          <img
                            src={relatedPost.thumbnail}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            {relatedPost.readTime}
                          </p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
