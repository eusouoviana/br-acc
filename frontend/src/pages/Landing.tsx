import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { FeatureCard } from "@/components/landing/FeatureCard";
import { NetworkAnimation } from "@/components/landing/NetworkAnimation";
import { StatsBar } from "@/components/landing/StatsBar";

import styles from "./Landing.module.css";

const DATA_SOURCES = [
  { nameKey: "CNPJ", descKey: "landing.sources.cnpj" },
  { nameKey: "TSE", descKey: "landing.sources.tse" },
  { nameKey: "Transparencia", descKey: "landing.sources.transparencia" },
  { nameKey: "CEIS/CNEP", descKey: "landing.sources.sanctions" },
] as const;

export function Landing() {
  const { t } = useTranslation();

  return (
    <>
      <section className={styles.hero}>
        <NetworkAnimation />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{t("app.title")}</h1>
          <p className={styles.subtitle}>{t("landing.hero")}</p>
          <Link to="/login" className={styles.cta}>
            {t("landing.cta")}
          </Link>
          <p className={styles.lastUpdated}>
            {t("landing.lastUpdated", { date: "2026-02-23" })}
          </p>
        </div>
      </section>

      <StatsBar />

      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          <FeatureCard
            icon={<span className={styles.dot} data-color="cyan" />}
            title={t("landing.features.graph")}
            description={t("landing.features.graphDesc")}
          />
          <FeatureCard
            icon={<span className={styles.dot} data-color="accent" />}
            title={t("landing.features.patterns")}
            description={t("landing.features.patternsDesc")}
          />
          <FeatureCard
            icon={<span className={styles.dot} data-color="person" />}
            title={t("landing.features.investigations")}
            description={t("landing.features.investigationsDesc")}
          />
        </div>
      </section>

      <section className={styles.sources}>
        <h2 className={styles.sourcesTitle}>{t("landing.sources.title")}</h2>
        <div className={styles.sourcesGrid}>
          {DATA_SOURCES.map((source) => (
            <div key={source.nameKey} className={styles.sourceItem}>
              <span className={styles.sourceName}>{source.nameKey}</span>
              <span className={styles.sourceDesc}>{t(source.descKey)}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLinks}>
            <span className={styles.footerLink}>
              {t("landing.footer.methodology")}
            </span>
            <span className={styles.licenseBadge}>
              {t("landing.footer.license")}
            </span>
          </div>
          <p className={styles.disclaimer}>{t("app.disclaimer")}</p>
        </div>
      </footer>
    </>
  );
}
