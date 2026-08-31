import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiClock, FiTag } from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/api/server";
import { formatDate } from "@/lib/utils";

export const revalidate = 120;

type BlogPostPageProps = PageProps<"/blog/[slug]">;

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: `${post.title} | NovaMart Blog`,
      description: post.excerpt,
      images: [post.coverImage],
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  const allPosts = await getBlogPosts(9);
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <Container className="py-6">
      <Breadcrumb
        items={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
      />

      <article className="mx-auto max-w-3xl py-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{post.category}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <FiClock className="h-3.5 w-3.5" aria-hidden />
            {post.readTime} min read
          </span>
          <span className="text-xs text-muted-foreground">
            · {formatDate(post.date)}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>

        <div className="mt-6 flex items-center gap-3 border-b border-border pb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.authorAvatar}
            alt={post.author}
            className="h-11 w-11 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-bold text-foreground">{post.author}</p>
            <p className="text-xs text-muted-foreground">Editor, NovaMart Blog</p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>

        <div className="mt-10 space-y-6">
          {post.content.map((paragraph, i) => (
            <p key={i} className="text-base leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2 border-y border-border py-6">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <FiTag className="h-4 w-4 text-primary" aria-hidden />
            Tags:
          </span>
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${tag}`}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {tag}
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Button href="/blog" variant="outline" leftIcon={<FiArrowLeft className="h-4 w-4" aria-hidden />}>
            Back to blog
          </Button>
        </div>
      </article>

      <section className="mx-auto max-w-4xl pb-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Related articles
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {related.map((relatedPost) => (
            <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group block">
              <Card className="h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="aspect-[16/9] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={relatedPost.coverImage}
                    alt={relatedPost.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <Badge variant="outline">{relatedPost.category}</Badge>
                  <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {relatedPost.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {relatedPost.readTime} min read
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}
