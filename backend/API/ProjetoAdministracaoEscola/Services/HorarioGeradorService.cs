using Microsoft.AspNetCore.Http.HttpResults;
using ProjetoAdministracaoEscola.Controllers;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Horario;

namespace ProjetoAdministracaoEscola.Services
{
    public class HorarioGeradorService
    {
        /*
         * Pseudocódigo:
         * O que tenho de agendar? -> Modulos (lista?)
         * Quem dá o que e a quem? -> Alocaçoes, que me diz o curso, formador e turma
         * Onde posso colocar? -> salas de aula (Lista)
         * O que está ocupado? -> Horarios de outras turmas (ter lista de horários) e !disponibilidade formadores
         * 
         */

        // TODO: disponibilidade formadores, para já só tem em conta os horários ocupados, mas pode haver outras razões para um formador não estar disponível (ex: férias, doença, etc)
        // TODO: Melhorar lógica de escolha de sala, para que filtre a area do modulo e tipo de sala
        // TODO: 
        public async Task<List<Horario>> GerarHorario(Turma turma, List<CursosModulo> cursoModulos, List<TurmaAlocaco> turmaAlocacao, List<Sala> salas, HashSet<Horario> horariosOcupados)
        {
            // Ordendar modulos
            var cursomodulosOrdenadosPrioridade = cursoModulos.OrderBy(mo => mo.Prioridade).ToList();

            // Cursor dataInicio
            DateOnly cursorData = turma.DataInicio;

            // Guardar horarios novos
            List<Horario> novosHorarios = new List<Horario>();

            /* Definir horario da manha e tarde (para já estático) */
            TimeOnly inicioManha = new TimeOnly(9, 0);
            TimeOnly fimManha = new TimeOnly(12, 0); // 3h

            TimeOnly inicioTarde = new TimeOnly(13, 0);
            TimeOnly fimTarde = new TimeOnly(16, 0); // 3h

            TimeOnly inicioTarde2 = new TimeOnly(16, 0);
            TimeOnly fimTarde2 = new TimeOnly(19, 0); // 3h

            TimeOnly inicioNoite = new TimeOnly(20, 0);
            TimeOnly fimNoite = new TimeOnly(23, 0); // 3h



            // Loop de modulos por cada curso
            foreach (var modulo in cursomodulosOrdenadosPrioridade)
            {
                // Horas totais de cada modulo
                int horasRestantes = modulo.IdModuloNavigation.HorasTotais;

                var formadorModulo = turmaAlocacao.FirstOrDefault(ta => ta.IdModulo == modulo.IdModulo);

                // Se não houver formador atribuido devolve erro
                if (formadorModulo == null)
                {
                    Console.WriteLine($"Erro: Módulo {modulo.IdModuloNavigation.Nome} sem formador.");
                    break;
                    //return (new {message = $"Modulo {modulo.IdModuloNavigation.Nome} não tem formador atribuido" });
                }

                while (horasRestantes >= 0)
                {
                    // Validar fim de semana
                    if (cursorData.DayOfWeek == DayOfWeek.Sunday || cursorData.DayOfWeek == DayOfWeek.Saturday)
                    {
                        cursorData = cursorData.AddDays(1);
                        continue; // volta ao início do loop para validar a nova data
                    }

                    // Tentar alocar na manhã
                    if (horasRestantes >= 3)
                    {
                        // Conflito de sala
                        var salaManha = EncontrarSalaLivre(salas, horariosOcupados, modulo, cursorData, inicioManha, fimManha);
                        var turmaDisponivelManha = TurmaDisponivel(turma.IdTurma, horariosOcupados, cursorData, inicioManha, fimManha);
                        var formadorDisponivelManha = FormadorDisponivel(formadorModulo.IdFormador, horariosOcupados, cursorData, inicioManha, fimManha);

                        if (salaManha != null && turmaDisponivelManha && turmaDisponivelManha)
                        {
                            // Criar horário
                            var horarioManha = CriarHorario(turma.IdTurma, modulo.IdCursoModulo, formadorModulo.IdFormador, salaManha.IdSala, cursorData, inicioManha, fimManha);

                            novosHorarios.Add(horarioManha);
                            horariosOcupados.Add(horarioManha); // atualiza horarios ocupados para próximas iterações
                            horasRestantes -= 3;
                        }
                    }

                    // Tentar alocar na tarde
                    if (horasRestantes >= 3)
                    {
                        // Conflito de sala
                        var salaTarde = EncontrarSalaLivre(salas, horariosOcupados, modulo, cursorData, inicioTarde, fimTarde);
                        var turmaDisponivelTarde = TurmaDisponivel(turma.IdTurma, horariosOcupados, cursorData, inicioTarde, fimTarde);
                        var formadorDisponivelTarde = FormadorDisponivel(formadorModulo.IdFormador, horariosOcupados, cursorData, inicioTarde, fimTarde);

                        if (salaTarde != null && turmaDisponivelTarde && formadorDisponivelTarde)
                        {
                            // Criar horário
                            var horarioTarde = CriarHorario(turma.IdTurma, modulo.IdCursoModulo, formadorModulo.IdFormador, salaTarde.IdSala, cursorData, inicioTarde, fimTarde);

                            novosHorarios.Add(horarioTarde);
                            horariosOcupados.Add(horarioTarde); // atualiza horarios ocupados para próximas iterações
                            horasRestantes -= 3;
                        }

                    }

                    // Fim da manha e tarde, passar para o próximo dia
                    cursorData = cursorData.AddDays(1);

                }
            }

            return novosHorarios;
        }

        // Função para encontrar uma sala livre, considerando os horários ocupados
        private Sala? EncontrarSalaLivre(List<Sala> salas, HashSet<Horario> horariosOcupados, CursosModulo cursosModulo, DateOnly dia, TimeOnly inicio, TimeOnly fim)
        {

            var IdSalasOcupada = horariosOcupados
                .Where(h => h.Data == dia && (h.HoraInicio < fim && h.HoraFim > inicio)) // Lógica de Sobreposição: (InicioA < FimB) E (FimA > InicioB)
                .Select(h => h.IdSala)
                .ToHashSet();

            var tipoSalasPermitidas = cursosModulo.IdModuloNavigation.IdTipoMateriaNavigation.IdTipoSalas;

            return salas.FirstOrDefault(s => !IdSalasOcupada.Contains(s.IdSala) && tipoSalasPermitidas.Any(tsp  =>  tsp.IdTipoSala == s.IdTipoSala)); 
        }

        // Função para verificar se o formador está disponível, considerando os horários ocupados
        private bool FormadorDisponivel(int idFormador, HashSet<Horario> horariosOcupados, DateOnly dia, TimeOnly inicio, TimeOnly fim)
        {
            var formadorOcupado = horariosOcupados.Any(h => h.IdFormador == idFormador &&
                        h.Data == dia && (h.HoraInicio < fim && h.HoraFim > inicio)); // Lógica de Sobreposição: (InicioA < FimB) E (FimA > InicioB)
            // Logica da disponibildiadeaasds

            return !formadorOcupado;

        }

        // Função para verificar se a turma está disponível, considerando os horários ocupados
        private bool TurmaDisponivel(int idTurma, HashSet<Horario> horariosOcupados, DateOnly dia, TimeOnly inicio, TimeOnly fim)
        {
            var turmaOcupada = horariosOcupados.Any(h =>
                h.IdTurma == idTurma &&
                h.Data == dia && (h.HoraInicio < fim && h.HoraFim > inicio) // Lógica de Sobreposição: (InicioA < FimB) E (FimA > InicioB)
            );
            return !turmaOcupada;
        }

        // Função para criar um horário
        private Horario CriarHorario(int idTurma, int idCursoModulo, int idFormador, int idSala, DateOnly data, TimeOnly inicio, TimeOnly fim)
        {
            return new Horario
            {
                IdTurma = idTurma,
                IdCursoModulo = idCursoModulo,
                IdFormador = idFormador,
                IdSala = idSala,
                Data = data,
                HoraInicio = inicio,
                HoraFim = fim
            };
        }
    }
}
