import Link from "next/link";
import type { GlobalNewsItem } from "@/lib/global-news";
import styles from "./news.module.css";

type Props = {
  title: string;
  subtitle: string;
  items: GlobalNewsItem[];
  page: number;
  pages: number;
  total: number;
  locale: string;
};

export default function GlobalNewsSection({
  title,
  subtitle,
  items,
  page,
  pages,
  total,
  locale,
}: Props) {
  if (!items.length) return null;
  const base = `/${locale}/news`;
  const prevHref = page > 1 ? `${base}?page=${page - 1}` : null;
  const nextHref = page < pages ? `${base}?page=${page + 1}` : null;

  return (
    <section className={styles.globalNews} aria-label={title}>
      <h2 className={styles.globalNewsTitle}>{title}</h2>
      <p className={styles.globalNewsSubtitle}>{subtitle}</p>
      <ol className={styles.globalNewsList}>
        {items.map((item) => (
          <li key={`${item.source}·${item.slug}`} className={styles.globalNewsItem}>
            <Link href={`/${locale}/news/${item.slug}`} className={styles.globalNewsLink}>
              <h3 className={styles.globalNewsHeadline}>{item.title}</h3>
              {item.excerpt && <p className={styles.globalNewsExcerpt}>{item.excerpt}</p>}
              <span className={styles.globalNewsSource}>
                {item.source} · {item.category}
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {pages > 1 && (
        <nav className={styles.pagination} aria-label="Global news pages">
          {prevHref ? (
            <Link href={prevHref} className={styles.paginationBtn}>
              ← Newer
            </Link>
          ) : (
            <span className={`${styles.paginationBtn} ${styles.paginationBtnDisabled}`} aria-disabled="true">
              ← Newer
            </span>
          )}
          <span className={styles.paginationInfo}>
            Page {page} of {pages} · {total} articles
          </span>
          {nextHref ? (
            <Link href={nextHref} className={styles.paginationBtn}>
              Older →
            </Link>
          ) : (
            <span className={`${styles.paginationBtn} ${styles.paginationBtnDisabled}`} aria-disabled="true">
              Older →
            </span>
          )}
        </nav>
      )}
    </section>
  );
}