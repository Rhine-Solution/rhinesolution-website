import Link from "next/link";
import type { NewsItem } from "@/lib/news";
import styles from "./news.module.css";

type Props = {
  item: NewsItem;
  locale: string;
  labels: Record<string, string>;
  readMore: string;
};

export default function NewsCard({ item, locale, labels, readMore }: Props) {
  const badge = labels[item.category] || item.category;
  return (
    <div className={styles.card}>
      <div className={styles.cardMeta}>
        <span className={styles.date}>{item.dateLabel}</span>
        <span className={styles.badge}>{badge}</span>
      </div>
      <h2 className={styles.cardTitle}>
        <Link href={`/${locale}/news/${item.slug}`}>{item.title}</Link>
      </h2>
      <p className={styles.cardExcerpt}>{item.excerpt}</p>
      <Link className={styles.cardMore} href={`/${locale}/news/${item.slug}`}>
        {readMore} →
      </Link>
    </div>
  );
}