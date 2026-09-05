import type { TrendItem } from "@/lib/news-trends";
import styles from "./news.module.css";

type Props = { title: string; subtitle: string; trends: TrendItem[] };

export default function TrendsSection({ title, subtitle, trends }: Props) {
  if (!trends.length) return null;
  return (
    <section className={styles.trends} aria-label={title}>
      <h2 className={styles.trendsTitle}>{title}</h2>
      <p className={styles.trendsSubtitle}>{subtitle}</p>
      <ol className={styles.trendsList}>
        {trends.map((t) => (
          <li key={`${t.source}·${t.title}`} className={styles.trendsItem}>
            <h3 className={styles.trendsHeadline}>{t.title}</h3>
            {t.excerpt && <p className={styles.trendsExcerpt}>{t.excerpt}</p>}
            <span className={styles.trendsSource}>via {t.source}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}