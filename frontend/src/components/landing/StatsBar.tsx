import { useTranslation } from "react-i18next";

import { useCountUp } from "@/hooks/useCountUp";

import styles from "./StatsBar.module.css";

interface StatItemProps {
  target: number;
  label: string;
  suffix?: string;
}

function StatItem({ target, label, suffix = "" }: StatItemProps) {
  const { ref, value } = useCountUp(target);

  return (
    <div className={styles.item} ref={ref}>
      <span className={styles.number}>
        {value.toLocaleString()}
        {suffix}
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export function StatsBar() {
  const { t } = useTranslation();

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <StatItem target={56.1} suffix="M" label={t("landing.stats.entities")} />
        <StatItem target={27} suffix="M" label={t("landing.stats.connections")} />
        <StatItem target={4} label={t("landing.stats.dataSources")} />
        <StatItem target={23} label={t("landing.stats.indexes")} />
      </div>
    </div>
  );
}
