export const dataColors = {
  person: "#4EA8DE",
  company: "#E07A5F",
  election: "#81B29A",
  contract: "#F2CC8F",
  sanction: "#E56B6F",
  amendment: "#B8A9C9",
} as const;

export type DataEntityType = keyof typeof dataColors;

export const relationshipColors: Record<string, string> = {
  SOCIO_DE: "#4EA8DE",
  DOOU: "#81B29A",
  CANDIDATO_EM: "#81B29A",
  VENCEU: "#F2CC8F",
  AUTOR_EMENDA: "#F2CC8F",
  SANCIONADA: "#E56B6F",
};

export const semanticColors = {
  success: "#22c55e",
  warning: "#eab308",
  danger: "#ef4444",
  info: "#3b82f6",
} as const;

// Backward compat: entityColors maps old types to new data palette
export const entityColors: Record<string, string> = {
  person: dataColors.person,
  company: dataColors.company,
  contract: dataColors.contract,
  election: dataColors.election,
  sanction: dataColors.sanction,
  amendment: dataColors.amendment,
  finance: "#3B82F6",
  legal: "#CA8A04",
  health: "#EC4899",
  environment: "#0D9488",
  labor: "#64748B",
  education: "#A855F7",
  regulatory: "#2DD4BF",
  property: "#8B5CF6",
};

export type EntityType = keyof typeof entityColors;
