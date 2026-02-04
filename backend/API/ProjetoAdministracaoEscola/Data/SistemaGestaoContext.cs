using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;
using ProjetoAdministracaoEscola.Models;

namespace ProjetoAdministracaoEscola.Data;

public partial class SistemaGestaoContext : DbContext
{
    public SistemaGestaoContext()
    {
    }

    public SistemaGestaoContext(DbContextOptions<SistemaGestaoContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Area> Areas { get; set; }

    public virtual DbSet<Avaliacao> Avaliacoes { get; set; }

    public virtual DbSet<Curso> Cursos { get; set; }

    public virtual DbSet<CursosModulo> CursosModulos { get; set; }

    public virtual DbSet<DisponibilidadeFormador> DisponibilidadeFormadores { get; set; }

    public virtual DbSet<Escolaridade> Escolaridades { get; set; }

    public virtual DbSet<Formador> Formadores { get; set; }
    public virtual DbSet<FormadorTipoMateria> FormadoresTipoMaterias { get; set; }

    public virtual DbSet<Formando> Formandos { get; set; }

    public virtual DbSet<Horario> Horarios { get; set; }

    public virtual DbSet<Inscrico> Inscricoes { get; set; }

    public virtual DbSet<Modulo> Modulos { get; set; }

    public virtual DbSet<Sala> Salas { get; set; }
    public virtual DbSet<TipoMateria> TipoMaterias { get; set; }

    public virtual DbSet<TipoUtilizadore> TipoUtilizadores { get; set; }

    public virtual DbSet<TipoSala> TipoSala { get; set; }

    public virtual DbSet<Turma> Turmas { get; set; }

    public virtual DbSet<TurmaAlocaco> TurmaAlocacoes { get; set; }

    public virtual DbSet<Utilizador> Utilizadores { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Area>(entity =>
        {
            entity.HasKey(e => e.IdArea).HasName("PRIMARY");

            entity.ToTable("areas");

            entity.Property(e => e.IdArea).HasColumnName("id_area");
            entity.Property(e => e.Nome)
                .HasMaxLength(50)
                .HasColumnName("nome");
        });

        modelBuilder.Entity<Avaliacao>(entity =>
        {
            entity.HasKey(e => e.IdAvaliacao).HasName("PRIMARY");

            entity.ToTable("avaliacoes");

            entity.HasIndex(e => e.IdInscricao, "id_inscricao");

            entity.HasIndex(e => e.IdModulo, "id_modulo");

            entity.Property(e => e.IdAvaliacao).HasColumnName("id_avaliacao");
            entity.Property(e => e.DataAvaliacao).HasColumnName("data_avaliacao");
            entity.Property(e => e.IdInscricao).HasColumnName("id_inscricao");
            entity.Property(e => e.IdModulo).HasColumnName("id_modulo");
            entity.Property(e => e.Nota)
                .HasPrecision(4, 2)
                .HasColumnName("nota");

            entity.HasOne(d => d.IdInscricaoNavigation).WithMany(p => p.Avaliacos)
                .HasForeignKey(d => d.IdInscricao)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("avaliacoes_ibfk_1");

            entity.HasOne(d => d.IdModuloNavigation).WithMany(p => p.Avaliacos)
                .HasForeignKey(d => d.IdModulo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("avaliacoes_ibfk_2");
        });

        modelBuilder.Entity<Curso>(entity =>
        {
            entity.HasKey(e => e.IdCurso).HasName("PRIMARY");

            entity.ToTable("cursos");

            entity.HasIndex(e => e.IdArea, "id_area");

            entity.Property(e => e.IdCurso).HasColumnName("id_curso");
            entity.Property(e => e.Descricao)
                .HasMaxLength(255)
                .HasColumnName("descricao");
            entity.Property(e => e.IdArea).HasColumnName("id_area");
            entity.Property(e => e.Nome)
                .HasMaxLength(100)
                .HasColumnName("nome");

            entity.HasOne(d => d.IdAreaNavigation).WithMany(p => p.Cursos)
                .HasForeignKey(d => d.IdArea)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("cursos_ibfk_1");
            entity.Property(e => e.Ativo)
                .HasDefaultValueSql("true")
                .HasColumnName("ativo");

            entity.Property(e => e.DataDesativacao)
                .HasColumnName("data_desativacao");

        });

        modelBuilder.Entity<CursosModulo>(entity =>
        {
            entity.HasKey(e => e.IdCursoModulo).HasName("PRIMARY");

            entity.ToTable("cursos_modulos");

            entity.HasIndex(e => e.IdCurso, "id_curso");

            entity.HasIndex(e => e.IdModulo, "id_modulo");

            entity.Property(e => e.IdCursoModulo).HasColumnName("id_curso_modulo");
            entity.Property(e => e.IdCurso).HasColumnName("id_curso");
            entity.Property(e => e.IdModulo).HasColumnName("id_modulo");
            entity.Property(e => e.Prioridade).HasColumnName("prioridade");

            entity.HasOne(d => d.IdCursoNavigation).WithMany(p => p.CursosModulos)
                .HasForeignKey(d => d.IdCurso)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("cursos_modulos_ibfk_1");

            entity.HasOne(d => d.IdModuloNavigation).WithMany(p => p.CursosModulos)
                .HasForeignKey(d => d.IdModulo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("cursos_modulos_ibfk_2");
        });

        modelBuilder.Entity<DisponibilidadeFormador>(entity =>
        {
            entity.HasKey(e => e.IdDispFormador).HasName("PRIMARY");

            entity.ToTable("disponibilidade_formadores");

            entity.HasIndex(e => e.IdFormador, "id_formador");

            entity.Property(e => e.IdDispFormador).HasColumnName("id_disp_formador");
            entity.Property(e => e.DataDisponivel).HasColumnName("data_disponivel");
            entity.Property(e => e.HoraFim)
                .HasColumnType("time")
                .HasColumnName("hora_fim");
            entity.Property(e => e.HoraInicio)
                .HasColumnType("time")
                .HasColumnName("hora_inicio");
            entity.Property(e => e.IdFormador).HasColumnName("id_formador");

            entity.HasOne(d => d.IdFormadorNavigation).WithMany(p => p.DisponibilidadeFormadores)
                .HasForeignKey(d => d.IdFormador)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("disponibilidade_formadores_ibfk_1");
        });

        modelBuilder.Entity<Escolaridade>(entity =>
        {
            entity.HasKey(e => e.IdEscolaridade).HasName("PRIMARY");

            entity.ToTable("escolaridades");

            entity.Property(e => e.IdEscolaridade).HasColumnName("id_escolaridade");
            entity.Property(e => e.Nivel)
                .HasMaxLength(100)
                .HasColumnName("nivel");
        });

        modelBuilder.Entity<Formador>(entity =>
        {
            entity.HasKey(e => e.IdFormador).HasName("PRIMARY");

            entity.ToTable("formadores");

            entity.HasIndex(e => e.IdUtilizador, "id_utilizador");

            entity.Property(e => e.IdFormador).HasColumnName("id_formador");
            entity.Property(e => e.AnexoFicheiro)
                .HasColumnType("mediumblob")
                .HasColumnName("anexo_ficheiro");
            entity.Property(e => e.Fotografia)
                .HasColumnType("mediumblob")
                .HasColumnName("fotografia");
            entity.Property(e => e.Iban)
                .HasMaxLength(20)
                .HasColumnName("iban");
            entity.Property(e => e.IdUtilizador).HasColumnName("id_utilizador");
            entity.Property(e => e.Qualificacoes)
                .HasMaxLength(255)
                .HasColumnName("qualificacoes");

            entity.HasOne(d => d.IdUtilizadorNavigation).WithMany(p => p.Formadores)
                .HasForeignKey(d => d.IdUtilizador)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("formadores_ibfk_1");
            entity.Property(e => e.Ativo)
                .HasDefaultValueSql("true")
                .HasColumnName("ativo");

            entity.Property(e => e.DataDesativacao)
                .HasColumnName("data_desativacao");

        });

        modelBuilder.Entity<FormadorTipoMateria>(entity =>
        {
            entity.HasKey(e => new { e.IdFormador, e.IdTipoMateria })
                .HasName("PRIMARY");

            entity.ToTable("formadores_tipo_materias");

            entity.Property(e => e.IdFormador).HasColumnName("id_formador");
            entity.Property(e => e.IdTipoMateria).HasColumnName("id_tipo_materia");

            entity.HasOne(d => d.Formador)
                .WithMany(p => p.FormadoresTipoMaterias)
                .HasForeignKey(d => d.IdFormador)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.TipoMateria)
                .WithMany(p => p.FormadoresTipoMaterias)
                .HasForeignKey(d => d.IdTipoMateria)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });


        modelBuilder.Entity<Formando>(entity =>
        {
            entity.HasKey(e => e.IdFormando).HasName("PRIMARY");

            entity.ToTable("formandos");

            entity.HasIndex(e => e.IdEscolaridade, "id_escolaridade");

            entity.HasIndex(e => e.IdUtilizador, "id_utilizador");

            entity.Property(e => e.IdFormando).HasColumnName("id_formando");
            entity.Property(e => e.AnexoFicheiro)
                .HasColumnType("mediumblob")
                .HasColumnName("anexo_ficheiro");
            entity.Property(e => e.Fotografia)
                .HasColumnType("mediumblob")
                .HasColumnName("fotografia");
            entity.Property(e => e.IdEscolaridade).HasColumnName("id_escolaridade");
            entity.Property(e => e.IdUtilizador).HasColumnName("id_utilizador");

            entity.HasOne(d => d.IdEscolaridadeNavigation).WithMany(p => p.Formandos)
                .HasForeignKey(d => d.IdEscolaridade)
                .HasConstraintName("formandos_ibfk_2");

            entity.HasOne(d => d.IdUtilizadorNavigation).WithMany(p => p.Formandos)
                .HasForeignKey(d => d.IdUtilizador)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("formandos_ibfk_1");
            entity.Property(e => e.Ativo)
                .HasDefaultValueSql("true")
                .HasColumnName("ativo");

            entity.Property(e => e.DataDesativacao)
                .HasColumnName("data_desativacao");

        });

        modelBuilder.Entity<Horario>(entity =>
        {
            entity.HasKey(e => e.IdHorario).HasName("PRIMARY");

            entity.ToTable("horarios");

            entity.HasIndex(e => e.IdCursoModulo, "id_curso_modulo");

            entity.HasIndex(e => new { e.IdFormador, e.Data, e.HoraInicio }, "id_formador").IsUnique();

            entity.HasIndex(e => new { e.IdSala, e.Data, e.HoraInicio }, "id_sala").IsUnique();

            entity.HasIndex(e => e.IdTurma, "id_turma");

            entity.Property(e => e.IdHorario).HasColumnName("id_horario");
            entity.Property(e => e.Data).HasColumnName("data");
            entity.Property(e => e.HoraFim)
                .HasColumnType("time")
                .HasColumnName("hora_fim");
            entity.Property(e => e.HoraInicio)
                .HasColumnType("time")
                .HasColumnName("hora_inicio");
            entity.Property(e => e.IdCursoModulo).HasColumnName("id_curso_modulo");
            entity.Property(e => e.IdFormador).HasColumnName("id_formador");
            entity.Property(e => e.IdSala).HasColumnName("id_sala");
            entity.Property(e => e.IdTurma).HasColumnName("id_turma");

            entity.HasOne(d => d.IdCursoModuloNavigation).WithMany(p => p.Horarios)
                .HasForeignKey(d => d.IdCursoModulo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("horarios_ibfk_2");

            entity.HasOne(d => d.IdFormadorNavigation).WithMany(p => p.Horarios)
                .HasForeignKey(d => d.IdFormador)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("horarios_ibfk_3");

            entity.HasOne(d => d.IdSalaNavigation).WithMany(p => p.Horarios)
                .HasForeignKey(d => d.IdSala)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("horarios_ibfk_4");

            entity.HasOne(d => d.IdTurmaNavigation).WithMany(p => p.Horarios)
                .HasForeignKey(d => d.IdTurma)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("horarios_ibfk_1");
        });

        modelBuilder.Entity<Inscrico>(entity =>
        {
            entity.HasKey(e => e.IdInscricao).HasName("PRIMARY");

            entity.ToTable("inscricoes");

            entity.HasIndex(e => e.IdFormando, "id_formando");

            entity.HasIndex(e => e.IdTurma, "id_turma");

            entity.Property(e => e.IdInscricao).HasColumnName("id_inscricao");
            entity.Property(e => e.DataInscricao)
                .HasDefaultValueSql("curdate()")
                .HasColumnName("data_inscricao");
            entity.Property(e => e.Estado)
                .HasDefaultValueSql("'Suspenso'")
                .HasColumnType("enum('Ativo','Concluido','Desistente','Congelado','Suspenso')")
                .HasColumnName("estado");
            entity.Property(e => e.IdFormando).HasColumnName("id_formando");
            entity.Property(e => e.IdTurma).HasColumnName("id_turma");
            entity.Property(e => e.NotaFinal)
                .HasPrecision(4, 2)
                .HasColumnName("nota_final");

            entity.HasOne(d => d.IdFormandoNavigation).WithMany(p => p.Inscricos)
                .HasForeignKey(d => d.IdFormando)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("inscricoes_ibfk_1");

            entity.HasOne(d => d.IdTurmaNavigation).WithMany(p => p.Inscricos)
                .HasForeignKey(d => d.IdTurma)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("inscricoes_ibfk_2");
        });

        modelBuilder.Entity<Modulo>(entity =>
        {
            entity.HasKey(e => e.IdModulo).HasName("PRIMARY");

            entity.ToTable("modulos");

            entity.HasIndex(e => e.CodigoIdentificacao, "codigo_identificacao").IsUnique();

            entity.Property(e => e.IdModulo).HasColumnName("id_modulo");
            entity.Property(e => e.CodigoIdentificacao)
                .HasMaxLength(20)
                .HasColumnName("codigo_identificacao");
            entity.Property(e => e.Creditos)
                .HasPrecision(4, 2)
                .HasColumnName("creditos");
            entity.Property(e => e.HorasTotais).HasColumnName("horas_totais");
            entity.Property(e => e.Nome)
                .HasMaxLength(100)
                .HasColumnName("nome");
            entity.Property(e => e.IdTipoMateria)
                .HasColumnName("id_tipo_materia");

            entity.Property(e => e.Ativo)
                .HasDefaultValueSql("true")
                .HasColumnName("ativo");

            entity.Property(e => e.DataDesativacao)
                .HasColumnName("data_desativacao");

            entity.HasOne(d => d.IdTipoMateriaNavigation)
                .WithMany(p => p.Modulos)
                .HasForeignKey(d => d.IdTipoMateria)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("modulos_ibfk_tipo_materia");

        });

        modelBuilder.Entity<Sala>(entity =>
        {
            entity.HasKey(e => e.IdSala).HasName("PRIMARY");

            entity.ToTable("salas");

            entity.Property(e => e.IdSala)
                .HasColumnName("id_sala");

            entity.Property(e => e.Descricao)
                .HasMaxLength(50)
                .HasColumnName("descricao");

            entity.Property(e => e.NumMaxAlunos)
                .HasColumnName("num_max_alunos");

            entity.Property(e => e.IdTipoSala)
                .HasColumnName("id_tipo_sala");

            entity.HasIndex(e => e.IdTipoSala, "idx_sala_tipo_sala");

            entity.HasOne(s => s.IdTipoSalaNavigation)
                .WithMany(ts => ts.Salas)
                .HasForeignKey(s => s.IdTipoSala)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("salas_ibfk_tipo_sala");
        });

        modelBuilder.Entity<TipoMateria>(entity =>
        {
            entity.HasKey(e => e.IdTipoMateria).HasName("PRIMARY");

            entity.ToTable("tipo_materias");

            entity.Property(e => e.IdTipoMateria).HasColumnName("id_tipo_materia");
            entity.Property(e => e.Tipo)
                .HasMaxLength(100)
                .HasColumnName("tipo");
        });


        modelBuilder.Entity<TipoUtilizadore>(entity =>
        {
            entity.HasKey(e => e.IdTipoUtilizador).HasName("PRIMARY");

            entity.ToTable("tipo_utilizadores");

            entity.Property(e => e.IdTipoUtilizador).HasColumnName("id_tipo_utilizador");
            entity.Property(e => e.TipoUtilizador)
                .HasMaxLength(50)
                .HasColumnName("tipo_utilizador");
        });

        modelBuilder.Entity<TipoSala>(entity =>
        {
            entity.ToTable("tipo_salas");

            entity.HasKey(e => e.IdTipoSala).HasName("PRIMARY");

            entity.Property(e => e.IdTipoSala)
                .HasColumnName("id_tipo_sala");

            entity.Property(e => e.Nome)
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnName("nome");
        });

        modelBuilder.Entity<Turma>(entity =>
        {
            entity.HasKey(e => e.IdTurma).HasName("PRIMARY");

            entity.ToTable("turmas");

            entity.HasIndex(e => e.IdCurso, "id_curso");

            entity.Property(e => e.IdTurma).HasColumnName("id_turma");
            entity.Property(e => e.DataFim).HasColumnName("data_fim");
            entity.Property(e => e.DataInicio).HasColumnName("data_inicio");
            entity.Property(e => e.IdCurso).HasColumnName("id_curso");
            entity.Property(e => e.NomeTurma)
                .HasMaxLength(50)
                .HasColumnName("nome_turma");

            entity.HasOne(d => d.IdCursoNavigation).WithMany(p => p.Turmas)
                .HasForeignKey(d => d.IdCurso)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("turmas_ibfk_1");
            entity.Property(e => e.Ativo)
                .HasDefaultValueSql("true")
                .HasColumnName("ativo");

            entity.Property(e => e.DataDesativacao)
                .HasColumnName("data_desativacao");

        });

        modelBuilder.Entity<TurmaAlocaco>(entity =>
        {
            entity.HasKey(e => e.IdAlocacao).HasName("PRIMARY");

            entity.ToTable("turma_alocacoes");

            entity.HasIndex(e => e.IdFormador, "id_formador");

            entity.HasIndex(e => e.IdModulo, "id_modulo");

            entity.HasIndex(e => e.IdTurma, "id_turma");

            entity.Property(e => e.IdAlocacao).HasColumnName("id_alocacao");
            entity.Property(e => e.IdFormador).HasColumnName("id_formador");
            entity.Property(e => e.IdModulo).HasColumnName("id_modulo");
            entity.Property(e => e.IdTurma).HasColumnName("id_turma");

            entity.HasOne(d => d.IdFormadorNavigation).WithMany(p => p.TurmaAlocacos)
                .HasForeignKey(d => d.IdFormador)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("turma_alocacoes_ibfk_3");

            entity.HasOne(d => d.IdModuloNavigation).WithMany(p => p.TurmaAlocacos)
                .HasForeignKey(d => d.IdModulo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("turma_alocacoes_ibfk_2");

            entity.HasOne(d => d.IdTurmaNavigation).WithMany(p => p.TurmaAlocacos)
                .HasForeignKey(d => d.IdTurma)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("turma_alocacoes_ibfk_1");
        });

        modelBuilder.Entity<Utilizador>(entity =>
        {
            entity.HasKey(e => e.IdUtilizador).HasName("PRIMARY");

            entity.ToTable("utilizadores");

            entity.HasIndex(e => e.Email, "email").IsUnique();

            entity.HasIndex(e => e.IdTipoUtilizador, "id_tipo_utilizador");

            entity.HasIndex(e => e.Nif, "nif").IsUnique();

            entity.Property(e => e.IdUtilizador).HasColumnName("id_utilizador");
            entity.Property(e => e.DataNascimento).HasColumnName("data_nascimento");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.IdFacebook)
                .HasMaxLength(255)
                .HasColumnName("id_facebook");
            entity.Property(e => e.IdGoogle)
                .HasMaxLength(255)
                .HasColumnName("id_google");
            entity.Property(e => e.IdTipoUtilizador)
                .HasDefaultValueSql("'5'")
                .HasColumnName("id_tipo_utilizador");
            entity.Property(e => e.Morada)
                .HasMaxLength(255)
                .HasColumnName("morada");
            entity.Property(e => e.Nif)
                .HasMaxLength(9)
                .HasColumnName("nif");
            entity.Property(e => e.Nome)
                .HasMaxLength(100)
                .HasColumnName("nome");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .HasColumnName("password_hash");
            entity.Property(e => e.StatusAtivacao)
                .HasDefaultValueSql("'0'")
                .HasColumnName("status_ativacao");
            entity.Property(e => e.Telefone)
                .HasMaxLength(20)
                .HasColumnName("telefone");
            entity.Property(e => e.TokenAtivacao)
                .HasMaxLength(255)
                .HasColumnName("token_ativacao");
            entity.Property(e => e.Ativo)
                .HasDefaultValueSql("true")
                .HasColumnName("ativo");

            entity.Property(e => e.DataDesativacao)
                .HasColumnName("data_desativacao");

            entity.HasOne(d => d.IdTipoUtilizadorNavigation).WithMany(p => p.Utilizadores)
                .HasForeignKey(d => d.IdTipoUtilizador)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("utilizadores_ibfk_1");

        });

        modelBuilder.Entity<Utilizador>().HasQueryFilter(e => e.Ativo);
        modelBuilder.Entity<Formador>().HasQueryFilter(e => e.Ativo);
        modelBuilder.Entity<Formando>().HasQueryFilter(e => e.Ativo);
        modelBuilder.Entity<Curso>().HasQueryFilter(e => e.Ativo);
        modelBuilder.Entity<Modulo>().HasQueryFilter(e => e.Ativo);
        modelBuilder.Entity<Turma>().HasQueryFilter(e => e.Ativo);

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
