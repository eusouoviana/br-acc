import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  "pt-BR": {
    translation: {
      app: {
        title: "ICARUS",
        subtitle: "Ferramenta de análise de dados públicos brasileiros",
        disclaimer:
          "Dados de registros públicos. Não constitui acusação.",
      },
      nav: {
        search: "Buscar",
        graph: "Grafo",
        investigations: "Investigações",
      },
      search: {
        placeholder: "CPF, CNPJ ou nome...",
        button: "Buscar",
        noResults: "Nenhum resultado encontrado.",
      },
      entity: {
        person: "Pessoa",
        company: "Empresa",
        contract: "Contrato",
        finance: "Financeiro",
        sanction: "Sanção",
        election: "Eleição",
        publicOffice: "Cargo Público",
      },
      common: {
        source: "Fonte",
        confidence: "Confiança",
        connections: "conexões",
        sources: "fontes",
        loading: "Carregando...",
      },
    },
  },
  en: {
    translation: {
      app: {
        title: "ICARUS",
        subtitle: "Brazilian public data analysis tool",
        disclaimer:
          "Data patterns from public records. Not accusations.",
      },
      nav: {
        search: "Search",
        graph: "Graph",
        investigations: "Investigations",
      },
      search: {
        placeholder: "CPF, CNPJ, or name...",
        button: "Search",
        noResults: "No results found.",
      },
      entity: {
        person: "Person",
        company: "Company",
        contract: "Contract",
        finance: "Finance",
        sanction: "Sanction",
        election: "Election",
        publicOffice: "Public Office",
      },
      common: {
        source: "Source",
        confidence: "Confidence",
        connections: "connections",
        sources: "sources",
        loading: "Loading...",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "pt-BR",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
