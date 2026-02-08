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
        // CursoModulos tem de conter .Include(IdTipoSala)
        // turmaAlocacao tem de conter .Include(IdFormadorNavigation).ThenInclude(DisponibilidadeFormadores)
        // turmas tem de conter .Include(IdMetodologiaNavigation) para ter acesso ao horário da metodologia (ex: se tem pausa para refeição ou não, para gerar os slots possíveis)
        public async Task<List<Horario>> GerarHorario(Turma turma, List<CursosModulo> cursoModulos, List<TurmaAlocaco> turmaAlocacao, List<Sala> salas, HashSet<Horario> horariosOcupados) 
        {

            // Ordendar modulos
            var cursomodulosOrdenadosPrioridade = cursoModulos.OrderBy(mo => mo.Prioridade).ToList();

            // Cursor dataInicio
            DateOnly cursorData = turma.DataInicio;

            // Guardar horarios novos
            List<Horario> novosHorarios = new List<Horario>();

            // Gerar slots de aulas possíveis de acordo com a metodologia da turma
            var metodologia = turma.IdMetodologiaNavigation;


            // Definir limites de blocos de aulas
            int maxBloco = 3; 
            int minBloco = 1; // minimo aceitavel para uma aula


            // Loop de modulos por cada curso
            foreach (var modulo in cursomodulosOrdenadosPrioridade)
            {
                // Horas totais de cada modulo
                int horasRestantes = modulo.IdModuloNavigation.HorasTotais;

                // Formador alocado na turma para o modulo do loop
                var formadorModulo = turmaAlocacao.FirstOrDefault(ta => ta.IdModulo == modulo.IdModulo);
                // Se não houver formador atribuido devolve erro
                if (formadorModulo == null)
                {
                    Console.WriteLine($"Erro: Módulo {modulo.IdModuloNavigation.Nome} sem formador.");
                    break;
                }

                while (horasRestantes > 0) // enquanto houver horas para alocar
                {
                    // Validar fim de semana
                    if (cursorData.DayOfWeek == DayOfWeek.Sunday || cursorData.DayOfWeek == DayOfWeek.Saturday)
                    {
                        cursorData = cursorData.AddDays(1);
                        continue; // volta ao início do loop para validar a nova data
                    }


                    // Obter slots possíveis para o dia atual, de acordo com a metodologia da turma
                    var slotsPossiveis = GerarSlotsPossiveis(metodologia, maxBloco); // Gerar slots para o número de horas restantes, limitado ao maxBloco

                    foreach(var slot in slotsPossiveis)
                    {
                        if (horasRestantes == 0)
                        {
                            break; // Se já alocou todas as horas necessárias, sai do loop de slots
                        }

                        // Qual é o máximo que posso agendar AGORA?
                        // É o menor valor entre: 
                        // A) O que falta do módulo (ex: falta 1h, não vou marcar 3h)
                        // B) O tamanho do slot (ex: 3h)

                        int duracaoSlot = (slot.Fim - slot.Inicio).Hours;
                        int tetoTentativa = Math.Min(horasRestantes, Math.Min(duracaoSlot, maxBloco));

                        // Tentar alocar o maior bloco possível dentro do slot, se não conseguir tentar um bloco menor, até chegar ao minBloco
                        for (int duracao = tetoTentativa; duracao >= minBloco; duracao--)
                        {
                            TimeOnly inicio = slot.Inicio;
                            TimeOnly fimCalculado = slot.Inicio.AddHours(duracao);

                            // Validar tudo com este tamanho de bloco
                            var salaLivre = EncontrarSalaLivre(salas, horariosOcupados, modulo, cursorData, inicio, fimCalculado);
                            var turmaDisponivel = TurmaDisponivel(turma.IdTurma, horariosOcupados, cursorData, inicio, fimCalculado);
                            var formadorDisponivel = FormadorDisponivel(formadorModulo, horariosOcupados, cursorData, inicio, fimCalculado);

                            if(salaLivre != null && turmaDisponivel && formadorDisponivel)
                            {
                                var novoBlocoHorario = CriarHorario(turma.IdTurma, modulo.IdCursoModulo, formadorModulo.IdFormador, salaLivre.IdSala, cursorData, inicio, fimCalculado);

                                novosHorarios.Add(novoBlocoHorario);
                                horariosOcupados.Add(novoBlocoHorario); // atualiza horarios ocupados para próximas iterações
                                horasRestantes -= duracao;
                            
                                break; // seja qual for o resultado, não tenta blocos menores dentro do mesmo slot, para evitar fragmentação (ex: marcar 1h num slot de 3h, e depois não conseguir marcar as outras 2h restantes do módulo em nenhum outro slot)
                            }

                            // Se falhar o loop roda denovo para tentar o próximo slot possível no mesmo dia, para tentar evitar passar dias sem marcar nada, caso haja disponibilidade
                        }

                    }


                    // passar para o próximo dia
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

            var materia = cursosModulo.IdModuloNavigation?.IdTipoMateriaNavigation;

            var tiposPermitidos = materia?.IdTipoSalas;

            return salas.FirstOrDefault(s => !IdSalasOcupada.Contains(s.IdSala) && // sala livre
            (tiposPermitidos == null || !tiposPermitidos.Any() || tiposPermitidos.Any(tsp => tsp.IdTipoSala == s.IdTipoSala))); // Compatibilidade para caso de null
        }

        // Função para verificar se o formador está disponível, considerando os horários ocupados
        private bool FormadorDisponivel(TurmaAlocaco formadorModulo, HashSet<Horario> horariosOcupados, DateOnly dia, TimeOnly inicio, TimeOnly fim)
        {
            var disponibilidadeFormador = formadorModulo.IdFormadorNavigation.DisponibilidadeFormadores
                                            .Any(f => f.DataDisponivel == dia &&
                                                f.HoraInicio <= inicio && // O formador tem de estar disponível antes do início da aula
                                                f.HoraFim >= fim); // O formador tem de estar disponível depois do fim da aula (para estar disponivel a aula toda)

            if (!disponibilidadeFormador)
            {
                return false; // Se o formador não estiver disponível, não é necessário verificar os horários ocupados (performance)
            }

            var horarioComConflito = horariosOcupados.Any(h => h.IdFormador == formadorModulo.IdFormador &&
                                                            h.Data == dia &&
                                                            (h.HoraInicio < fim && h.HoraFim > inicio)); // Lógica de Sobreposição: (InicioA < FimB) E (FimA > InicioB)

            return !horarioComConflito;

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

        // Função para gerar os slots possíveis de acordo com a metodologia da turma
        private List<(TimeOnly Inicio, TimeOnly Fim)> GerarSlotsPossiveis(MetodologiasHorario metodologia, int duracaoHoras)
        {
            var slots = new List<(TimeOnly, TimeOnly)>();
            TimeSpan duracao = TimeSpan.FromHours(duracaoHoras);

            // Tentar encaixar blocos na MANHÃ (Do início do dia até ao início do almoço)
            // Ex: 09:00 -> +3h = 12:00. 12:00 <= 13:00? Sim. Adiciona.
            TimeOnly cursor = metodologia.HorarioInicio;
            while (cursor.Add(duracao) <= metodologia.PausaRefeicaoInicio)
            {
                slots.Add((cursor, cursor.Add(duracao)));
                cursor = cursor.Add(duracao); // Avança para ver se cabe mais um bloco antes de almoço
            }

            // Tentar encaixar blocos na TARDE (Do fim do almoço até ao fim do dia)
            cursor = metodologia.PausaRefeicaoFim;
            while (cursor.Add(duracao) <= metodologia.HorarioFim)
            {
                slots.Add((cursor, cursor.Add(duracao)));
                cursor = cursor.Add(duracao);
            }

            return slots;
        }
    }
}
