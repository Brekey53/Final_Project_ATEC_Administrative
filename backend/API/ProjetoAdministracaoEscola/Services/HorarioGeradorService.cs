using Microsoft.AspNetCore.Http.HttpResults;
using ProjetoAdministracaoEscola.Controllers;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Horario;
using ProjetoAdministracaoEscola.ModelsDTO.Horario.Requests;
using ProjetoAdministracaoEscola.ModelsDTO.Horario.Responses;

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

        /// <summary>
        /// Para a função gerar hórarios sem conflitos, é necessário: <br/> <br/>
        /// CursoModulos -> tem de conter .Include(cm => cm.IdModuloNavigation).ThenInclude(m => m.IdTipoMateriaNavigation).ThenInclude(tm => tm.IdTipoSalas) e .OrderBy(x => x.Prioridade) <br/>
        /// TurmaAlocacao -> tem de conter .Include(ta => ta.IdFormadorNavigation).ThenInclude(f => f.DisponibilidadeFormadores) <br/>
        /// Turma -> tem de conter .Include(t => t.IdMetodologiaNavigation) <br/>
        /// </summary>
        /// <returns>
        /// Gera o horário de uma turma, encaixando os módulos de acordo com a disponibilidade dos formadores e salas,
        ///  e respeitando a metodologia (diurno ou pós-laboral) da turma.
        ///  Retorna um objeto com os horários gerados e um resumo do processo.
        /// </returns>
        public async Task<HorarioGeradorResultado> GerarHorario(
            Turma turma,
            List<CursosModulo> cursoModulos,
            List<TurmaAlocaco> turmaAlocacao,
            List<Sala> salas,
            HashSet<Horario> horariosOcupados,
            DateOnly? dataInicioMinima = null,
            Dictionary<int, int>? horasJaLeccionadas = null)
        {

            //// Ordendar modulos
            //var cursomodulosOrdenadosPrioridade = cursoModulos.OrderBy(mo => mo.Prioridade).ToList();

            // Criamos uma fila (queue) com os modulos ordenados por prioridade, quando retirar um da fila o seguinte fica como "Ativo"
            var filaModulosPendentes = new Queue<CursosModulo>(cursoModulos.OrderBy(mo => mo.Prioridade));

            // Dicionario para controlar as horas restantes de cada módulo
            var horasRestantesPorModulo = cursoModulos.ToDictionary(cm => cm.IdModulo, cm => {
                int total = cm.IdModuloNavigation.HorasTotais;
                if (horasJaLeccionadas != null && horasJaLeccionadas.TryGetValue(cm.IdModulo, out int jaDado))
                {
                    return Math.Max(0, total - jaDado);
                }
                return total;
            });

            // Cursor dataInicio
            DateOnly cursorData = turma.DataInicio;
            if (dataInicioMinima.HasValue && dataInicioMinima.Value > cursorData)
            {
                cursorData = dataInicioMinima.Value;
            }

            // Guardar resultados
            var resultado = new HorarioGeradorResultado();

            // Gerar slots de aulas possíveis de acordo com a metodologia da turma
            var metodologia = turma.IdMetodologiaNavigation;


            // Definir limites de blocos de aulas
            int maxBloco = 3;
            int minBloco = 1; // minimo aceitavel para uma aula

            int maxModulosSimultaneos = 3; // Para evitar tentar alocar muitos módulos ao mesmo tempo.
            List<CursosModulo> modulosAtivos = new List<CursosModulo>();


            AtualizarModulosAtivos(modulosAtivos, maxModulosSimultaneos, filaModulosPendentes);

            // Feriados para os anos que a turma vai decorrer
            int anoInicio = turma.DataInicio.Year;
            int anoFim = turma.DataFim.Year;

            var feriados = GetFeriados(anoInicio);
            if (anoFim > anoInicio)
            {
                feriados.UnionWith(GetFeriados(anoFim));
            }

            while (modulosAtivos.Count > 0) // Enquanto houver módulos ativos para alocar
            {
                // Validar fim de semana e passa o dia à frente
                if (cursorData.DayOfWeek == DayOfWeek.Saturday || cursorData.DayOfWeek == DayOfWeek.Sunday)
                {
                    cursorData = cursorData.AddDays(1);
                    continue;
                }

                // Validar feriados e passa o dia à frente
                if (feriados.Contains(cursorData))
                {
                    cursorData = cursorData.AddDays(1);
                    continue;
                }

                // Verificar se já passou a data de fim da turma
                if (cursorData > turma.DataFim)
                {
                    break;
                }

                // Obter blocos de horario do Dia
                var slotsDoDia = GerarSlotsPossiveis(metodologia, maxBloco);

                foreach (var slot in slotsDoDia)
                {
                    if (modulosAtivos.Count == 0)
                    {
                        break; // Se já não houver nada para alocar, paramos
                    }

                    bool conseguiuAgendarNesteSlot = false;

                    // Percorremos os módulos ativos para tentar encaixar um neste slot.
                    // .ToList() para poder alterar a lista original se necessário dentro do loop (remoção)

                    foreach (var modulo in modulosAtivos.ToList())
                    {
                        int horasFaltam = horasRestantesPorModulo[modulo.IdModulo];

                        // Se o módulo já acabou (por alguma razão de iteração anterior), remove e avança
                        if (horasFaltam <= 0)
                        {
                            modulosAtivos.Remove(modulo);
                            AtualizarModulosAtivos(modulosAtivos, maxModulosSimultaneos, filaModulosPendentes); // Vai buscar o próximo
                            continue;
                        }

                        // Obter formador
                        var formadorAlocado = turmaAlocacao.FirstOrDefault(ta => ta.IdModulo == modulo.IdModulo);
                        if (formadorAlocado == null)
                        {
                            Console.WriteLine($"Erro: Módulo {modulo.IdModulo} - {modulo.IdModuloNavigation.Nome} sem formador.");
                            modulosAtivos.Remove(modulo); // Remove para não bloquear o loop
                            continue;
                        }

                        // Qual é o máximo que posso agendar AGORA?
                        // É o menor valor entre: 
                        // A) O que falta do módulo (ex: falta 1h, não vou marcar 3h) -  B) O tamanho do slot (ex: 3h)

                        int duracaoSlot = (slot.Fim - slot.Inicio).Hours;
                        int tetoTentativa = Math.Min(horasFaltam, Math.Min(duracaoSlot, maxBloco));

                        for (int duracao = tetoTentativa; duracao >= minBloco; duracao--)
                        {
                            TimeOnly inicio = slot.Inicio;
                            TimeOnly fimCalculado = slot.Inicio.AddHours(duracao);

                            var salaLivre = EncontrarSalaLivre(salas, horariosOcupados, modulo, cursorData, inicio, fimCalculado);
                            bool turmaLivre = TurmaDisponivel(turma.IdTurma, horariosOcupados, cursorData, inicio, fimCalculado);
                            bool formadorLivre = FormadorDisponivel(formadorAlocado, horariosOcupados, cursorData, inicio, fimCalculado);

                            if (salaLivre != null && turmaLivre && formadorLivre)
                            {
                                // SUCESSO!
                                var novoBlocoHorario = CriarHorario(turma.IdTurma, modulo.IdCursoModulo, formadorAlocado.IdFormador, salaLivre.IdSala, cursorData, inicio, fimCalculado);

                                resultado.HorariosGerados.Add(novoBlocoHorario);
                                horariosOcupados.Add(novoBlocoHorario);

                                // Atualiza as horas restantes no Dicionário
                                horasRestantesPorModulo[modulo.IdModulo] -= duracao;

                                // Flag de sucesso
                                conseguiuAgendarNesteSlot = true;

                                // Movemos este módulo para o fim da lista de ativos.
                                // Assim, no próximo slot (Tarde), o algoritmo vai tentar PRIMEIRO o outro módulo.
                                // Isto garante: Manhã=Mod A, Tarde=Mod B.
                                modulosAtivos.Remove(modulo);

                                // Se ainda sobrarem horas, volta para a fila de ativos (no fim)
                                if (horasRestantesPorModulo[modulo.IdModulo] > 0)
                                {
                                    modulosAtivos.Add(modulo);
                                }
                                else
                                {
                                    // Se acabou, vai buscar um novo à fila principal (ex: P3)
                                    AtualizarModulosAtivos(modulosAtivos, maxModulosSimultaneos, filaModulosPendentes);
                                }

                                break; // Sai do loop de duração (já agendou)
                            }
                        }

                        // Se conseguiu agendar um módulo neste slot, paramos de procurar OUTROS módulos para ESTE MESMO slot.
                        // (Não podemos ter duas aulas ao mesmo tempo na mesma turma)
                        if (conseguiuAgendarNesteSlot) break;
                    }
                }

                // Avançar Dia
                cursorData = cursorData.AddDays(1);

                // Proteção contra loop infinito (caso acabem as datas ou erro lógico, ou ultrapasse muito a data fim prevista)
                if (cursorData > turma.DataFim.AddMonths(6)) break;
            }

            // Geração do Resumo
            foreach (var cm in cursoModulos)
            {
                var formador = turmaAlocacao.FirstOrDefault(ta => ta.IdModulo == cm.IdModulo)?.IdFormadorNavigation;

                var resumo = new ResumoAgendamentoModulo
                {
                    NomeModulo = cm.IdModuloNavigation.Nome,
                    NomeFormador = formador?.IdUtilizadorNavigation?.Nome ?? "Sem Formador",
                    HorasTotais = cm.IdModuloNavigation.HorasTotais,
                    HorasAgendadas = cm.IdModuloNavigation.HorasTotais - horasRestantesPorModulo[cm.IdModulo],
                    Prioridades = cm.Prioridade,
                    ConcluidoComSucesso = horasRestantesPorModulo[cm.IdModulo] == 0
                };

                if (resumo.ConcluidoComSucesso)
                {
                    resumo.DescricaoDetalhada = "Done";
                }
                else
                {
                    // Diagnóstico de falha - Priorizar problemas de Formador
                    if (formador == null)
                    {
                        resumo.DescricaoDetalhada = "Módulo sem formador alocado";
                    }
                    else
                    {
                        var ultimaDisponibilidade = formador.DisponibilidadeFormadores.OrderByDescending(d => d.DataDisponivel).FirstOrDefault();

                        if (!formador.DisponibilidadeFormadores.Any())
                        {
                            resumo.DescricaoDetalhada = "Formador sem qualquer disponibilidade registada";
                        }
                        else if (ultimaDisponibilidade != null && ultimaDisponibilidade.DataDisponivel < turma.DataFim)
                        {
                            resumo.DescricaoDetalhada = $"Formador sem disponibilidades marcadas além de {ultimaDisponibilidade.DataDisponivel:dd/MM/yyyy}";
                        }
                        else if (cursorData > turma.DataFim)
                        {
                            resumo.DescricaoDetalhada = "A data de fim da turma foi atingida antes de concluir o módulo";
                        }
                        else
                        {
                            resumo.DescricaoDetalhada = "Não foi possível encontrar slots compatíveis: verifique compatibilidade de horários, salas ou feriados";
                        }
                    }
                }

                resultado.ResumoModulos.Add(resumo);
            }

            return resultado;
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

        // Função para atualizar a lista de módulos ativos, retirando da fila de pendentes e adicionando à lista de ativos, respeitando o limite máximo de simultaneidade
        void AtualizarModulosAtivos(List<CursosModulo> modulosAtivos, int maxModulosSimultaneos, Queue<CursosModulo> filaModulosPendentes)
        {
            // Enquanto houver espaço na janela de ativos E houver módulos na fila de espera
            while (modulosAtivos.Count < maxModulosSimultaneos && filaModulosPendentes.Count > 0)
            {
                modulosAtivos.Add(filaModulosPendentes.Dequeue());
            }
        }

        public static HashSet<DateOnly> GetFeriados(int ano)
        {
            var feriados = new HashSet<DateOnly>
        {
            new(ano, 1, 1),   // Ano Novo
            new(ano, 4, 25),  // 25 de Abril
            new(ano, 5, 1),   // Dia do Trabalhador
            new(ano, 6, 10),  // Dia de Portugal
            new(ano, 8, 15),  // Assunção de Nossa Senhora
            new(ano, 10, 5),  // Implantação da República
            new(ano, 11, 1),  // Todos os Santos
            new(ano, 12, 1),  // Restauração da Independência
            new(ano, 12, 8),  // Imaculada Conceição
            new(ano, 12, 25)  // Natal
        };

            return feriados;
        }

    }
}
