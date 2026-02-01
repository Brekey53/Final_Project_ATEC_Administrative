// src/utils/stringUtils.ts

/**
 * Remove acentos, converte para minúsculas e remove espaços extra.
 * Ideal para filtros de pesquisa inteligentes.
 */
export const normalizarTexto = (texto: string | null | undefined): string => {
  if (!texto) return "";
  
  return texto
    .normalize("NFD")               // Decompõe os caracteres (á -> a + ´)
    .replace(/[\u0300-\u036f]/g, "") // Remove apenas os acentos
    .toLowerCase()                  // Passa tudo para minúsculas
    .trim();                        // Limpa espaços no início e fim
};