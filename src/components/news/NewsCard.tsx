import BrainMarkdown from "@/components/brain/BrainMarkdown";
import type { NewsItem } from "@/lib/news";
import styles from "./news.module.css";

type Props = {
  item: NewsItem;
  labels: Record<string, string>;
};

export default function NewsCard({ item, labels }: Props) {
  const badge = labels[item.category] || item.category;
  return (
    <article className={styles.card}>
      <div className={styles.cardMeta}>
        <span className={styles.date}>{item.dateLabel}</span>
        <span className={styles.badge}>{badge}</span>
      </div>
      <h2 className={styles.cardTitle}>{item.title}</h2>
      <p className={styles.cardExcerpt}>{item.excerpt}</p>
      <div className={styles.cardBody}>
        <BrainMarkdown content={item.body} />
      </div>
    </article>
  );
}