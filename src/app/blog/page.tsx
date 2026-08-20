import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowRight, FiClock, FiUser } from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getBlogPosts } from "@/lib/api/server";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The NovaMart Blog",
  description:
    "Guides, inspiration, and expert advice on the latest in tech, fashion, home, and beauty.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const [featured, ...rest] = posts.length > 0 ? posts : [];
  if (!featured) {
    return (
      <Container className="py-6">
        <Breadcrumb items={[{ label: "Blog" }]} />
        <div className="max-w-2xl py-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            The NovaMart blog
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Ideas & inspiration
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Practical buying guides, trend reports, and lifestyle tips from our editors.
          </p>
          <p className="mt-8 text-sm text-muted-foreground">
            No articles published yet. Check back soon.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Blog" }]} />

      <div className="max-w-2xl py-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          The NovaMart blog
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Ideas & inspiration
        </h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Practical buying guides, trend reports, and lifestyle tips from our
          editors.
        </p>
      </div>

      <Link href={`/blog/${featured.slug}`} className="group block">
        <Card className="overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <div className="grid lg:grid-cols-2">
            <div className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.coverImage}
                alt={featured.title}
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105 lg:h-full"
              />
              <Badge variant="accent" className="absolute left-4 top-4">
                Featured
              </Badge>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{featured.category}</Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <FiClock className="h-3.5 w-3.5" aria-hidden />
                  {featured.readTime} min read
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {featured.excerpt}
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featured.authorAvatar}
                    alt={featured.author}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {featured.author}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(featured.date)}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Read more
                  <FiArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
            <Card className="h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="relative aspect-[16/10] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{post.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FiClock className="h-3.5 w-3.5" aria-hidden />
                    {post.readTime} min
                  </span>
                </div>
                <h2 className="mt-3 font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <FiUser className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {post.author}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    · {formatDate(post.date)}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
