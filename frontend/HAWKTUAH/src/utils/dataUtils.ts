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

export const get1900ISO = (): string => {
  const ano = 1900;
  const mes = 1;
  const dia = 1;
  const data = new Date(ano, mes, dia);
  return data.toISOString().split("T")[0];
};

/**
 * Retorna a data de hoje + 3 anos no formato YYYY-MM-DD para uso em inputs type="date"
 */
export const getMaxDataFimISO = (): string => {
  const hoje = new Date();
  hoje.setFullYear(hoje.getFullYear() + 3);
  return hoje.toISOString().split("T")[0];
};