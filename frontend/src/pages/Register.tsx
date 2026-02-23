import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { useAuthStore } from "@/stores/auth";

import styles from "./Register.module.css";

export function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await register(email, password, inviteCode);
    if (useAuthStore.getState().token) {
      navigate("/app");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t("auth.registerTitle")}</h1>
          <p className={styles.subtitle}>{t("auth.loginSubtitle")}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{t(error)}</div>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-email">
              {t("auth.email")}
            </label>
            <input
              id="reg-email"
              className={styles.input}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-password">
              {t("auth.password")}
            </label>
            <input
              id="reg-password"
              className={styles.input}
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-invite">
              {t("auth.inviteCode")}
            </label>
            <input
              id="reg-invite"
              className={styles.input}
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? t("common.loading") : t("auth.register")}
          </button>
        </form>

        <div className={styles.footer}>
          <Link to="/login" className={styles.switchLink}>
            {t("auth.switchToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
