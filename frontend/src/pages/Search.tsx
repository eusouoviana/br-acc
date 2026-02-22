import { useState } from "react";
import { useTranslation } from "react-i18next";

export function Search() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect to API
    console.log("Search:", query);
  };

  return (
    <div>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "var(--space-sm)" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          style={{
            flex: 1,
            padding: "var(--space-sm) var(--space-md)",
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--font-size-sm)",
            borderRadius: "var(--radius-sm)",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "var(--space-sm) var(--space-lg)",
            background: "var(--accent)",
            color: "var(--bg-primary)",
            border: "none",
            fontFamily: "var(--font-mono)",
            cursor: "pointer",
            borderRadius: "var(--radius-sm)",
          }}
        >
          {t("search.button")}
        </button>
      </form>
    </div>
  );
}
