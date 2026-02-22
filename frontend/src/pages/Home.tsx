import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "20vh" }}>
      <h1 style={{ color: "var(--accent)", fontSize: "3rem", letterSpacing: "0.2em" }}>
        {t("app.title")}
      </h1>
      <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-md)" }}>
        {t("app.subtitle")}
      </p>
      <button
        onClick={() => navigate("/search")}
        style={{
          marginTop: "var(--space-xl)",
          padding: "var(--space-sm) var(--space-lg)",
          background: "var(--accent)",
          color: "var(--bg-primary)",
          border: "none",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--font-size-md)",
          cursor: "pointer",
          borderRadius: "var(--radius-sm)",
        }}
      >
        {t("nav.search")}
      </button>
    </div>
  );
}
