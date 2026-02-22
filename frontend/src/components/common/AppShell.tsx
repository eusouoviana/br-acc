import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import styles from "./AppShell.module.css";

export function AppShell({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === "pt-BR" ? "en" : "pt-BR";
    i18n.changeLanguage(next);
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          {t("app.title")}
        </Link>
        <nav className={styles.nav}>
          <Link to="/search">{t("nav.search")}</Link>
        </nav>
        <button onClick={toggleLang} className={styles.langToggle}>
          {i18n.language === "pt-BR" ? "EN" : "PT"}
        </button>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <span className={styles.disclaimer}>{t("app.disclaimer")}</span>
      </footer>
    </div>
  );
}
