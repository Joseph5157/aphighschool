import Link from "next/link";
import Badge from "./Badge";
import GoirBadge from "./GoirBadge";
import Card from "./Card";
import { formatDate } from "@/lib/dates";

type UpcomingActionPost = {
  id: string;
  slug: string;
  titleEn: string;
  actionDeadline: Date;
  goReference: string | null;
  sourceDept: string | null;
  verifiedAgainstGoir: boolean;
};

type UpcomingActionDatesProps = {
  posts: UpcomingActionPost[];
};

/** A compact, factual discovery surface for explicitly recorded action dates. */
export default function UpcomingActionDates({ posts }: UpcomingActionDatesProps) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="upcoming-action-dates-heading" className="space-y-4">
      <div className="border-l-2 border-turmeric pl-3">
        <h2 id="upcoming-action-dates-heading" className="text-lg font-semibold tracking-tight text-ink">
          Upcoming action dates
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-inkSoft">
          Published documents with a recorded action date. Confirm details in the document.
        </p>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Card key={post.id} hoverable className="p-4 sm:p-5">
            <article className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <time
                    dateTime={post.actionDeadline.toISOString()}
                    className="font-mono text-xs font-semibold uppercase tracking-wider text-turmericDeep"
                  >
                    Action date · {formatDate(post.actionDeadline)}
                  </time>
                  <GoirBadge verified={post.verifiedAgainstGoir} />
                </div>

                <Link href={`/posts/${post.slug}`} className="group mt-2 block w-fit focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turmericDeep">
                  <h3 className="text-card-title text-ink transition-colors group-hover:text-turmericDeep group-focus-visible:text-turmericDeep">
                    {post.titleEn}
                  </h3>
                </Link>

                {(post.goReference || post.sourceDept) && (
                  <p className="mt-2 font-mono text-xs leading-relaxed text-inkSoft">
                    {[post.goReference, post.sourceDept].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>

              <Link
                href={`/posts/${post.slug}`}
                aria-label={`View document: ${post.titleEn}`}
                className="shrink-0 text-sm font-semibold text-turmericDeep underline-offset-4 hover:underline focus:outline-none focus-visible:underline"
              >
                View document
              </Link>
            </article>
          </Card>
        ))}
      </div>
    </section>
  );
}
