// src/utils/stringUtils.ts

/**
 * Remove acentos, converte para minúsculas e remove espaços extra.
 * Ideal para filtros de pesquisa inteligentes.
 *
 * @param texto - O texto a normalizar.
 * @returns O texto normalizado (sem acentos, minúsculo, trimado) ou string vazia se o input for nulo/indefinido.
 */
export const normalizarTexto = (texto: string | null | undefined): string => {
  if (!texto) return "";

  return texto
    .normalize("NFD") // Decompõe os caracteres (á -> a + ´)
    .replace(/[\u0300-\u036f]/g, "") // Remove apenas os acentos
    .toLowerCase() // Passa tudo para minúsculas
    .trim(); // Limpa espaços no início e fim
};
