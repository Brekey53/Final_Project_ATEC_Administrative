/**
 * Valida se a data de fim é maior ou igual à data de início.
 * Formato esperado: YYYY-MM-DD (ISO)
 */
export const isDataFimValida = (
  dataInicio: string,
  dataFim: string,
): boolean => {
  if (!dataInicio || !dataFim) return true;
  return new Date(dataFim) >= new Date(dataInicio);
};

/**
 * Retorna a data de hoje no formato YYYY-MM-DD para uso em inputs type="date"
 */
export const getHojeISO = (): string => {
  const hoje = new Date();
  return hoje.toISOString().split("T")[0];
};
