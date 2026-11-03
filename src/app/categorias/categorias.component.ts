
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Categoria, CategoriaService } from '../services/categoria.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent implements OnInit {

  // Variáveis utilizadas para armazenar e controlar as categorias.
  categorias: Categoria[] = [];
  nomeCategoria = '';
  idBusca: number | null = null;
  idEdicao: number | null = null;
  mensagem = '';
  erro = '';
  carregando = false;

  constructor(private categoriaService: CategoriaService) {}

  // Executa quando a página é inicializada.
  ngOnInit(): void {
    this.listarCategorias();
  }

  // Busca todas as categorias cadastradas na API.
  listarCategorias(): void {
    this.carregando = true;
    this.erro = '';
    this.mensagem = '';

    this.categoriaService.listarCategorias().subscribe({
      next: dados => {
        this.categorias = dados;
        this.carregando = false;
      },
      error: erro => {
        console.error('Erro ao listar categorias:', erro);
        this.erro = 'Não foi possível carregar as categorias.';
        this.carregando = false;
      }
    });
  }

  // Cadastra uma nova categoria ou atualiza uma existente.
  salvarCategoria(): void {
    const nome = this.nomeCategoria.trim();

    // Verifica se o nome foi preenchido.
    if (!nome) {
      this.erro = 'Informe o nome da categoria.';
      this.mensagem = '';
      return;
    }

    this.erro = '';
    this.mensagem = '';

    // Monta os dados que serão enviados para a API.
    const dados = { categoria: nome };

    // Se existir um ID de edição, atualiza; caso contrário, cadastra.
    const requisicao = this.idEdicao !== null
      ? this.categoriaService.editarCategoria(this.idEdicao, dados)
      : this.categoriaService.cadastrarCategoria(dados);

    requisicao.subscribe({
      next: () => {
        // Exibe uma mensagem conforme a operação realizada.
        this.mensagem = this.idEdicao !== null
          ? 'Categoria atualizada com sucesso!'
          : 'Categoria cadastrada com sucesso!';

        this.nomeCategoria = '';
        this.idEdicao = null;

        // Atualiza a lista após salvar.
        this.listarCategorias();
      },
      error: erro => {
        console.error('Erro ao salvar categoria:', erro);
        this.erro = 'Não foi possível salvar a categoria. Confira os dados enviados à API.';
      }
    });
  }

  // Carrega os dados da categoria selecionada nos campos de edição.
  editar(categoria: Categoria): void {
    this.idEdicao = categoria.idcategoria;
    this.nomeCategoria = categoria.categoria;
    this.mensagem = '';
    this.erro = '';
  }

  // Exclui uma categoria após a confirmação do usuário.
  excluir(categoria: Categoria): void {

    // confirm() exibe uma janela perguntando se o usuário deseja excluir.
    const confirmar = window.confirm(
      `Deseja excluir a categoria "${categoria.categoria}"?`
    );

    // Se o usuário cancelar, interrompe a exclusão.
    if (!confirmar) {
      return;
    }

    this.erro = '';
    this.mensagem = '';

    this.categoriaService.excluirCategoria(categoria.idcategoria).subscribe({
      next: () => {
        this.mensagem = 'Categoria excluída com sucesso!';
        this.listarCategorias();
      },
      error: erro => {
        console.error('Erro ao excluir categoria:', erro);
        this.erro = 'Não foi possível excluir. Verifique se existem itens vinculados a essa categoria.';
      }
    });
  }

  // Pesquisa uma categoria utilizando seu ID.
  consultarPorId(): void {

    // Verifica se o ID foi informado e se é um número inteiro positivo.
    if (this.idBusca === null || !Number.isInteger(Number(this.idBusca)) || Number(this.idBusca) <= 0) {
      this.erro = 'Informe um ID válido.';
      this.mensagem = '';
      return;
    }

    this.carregando = true;
    this.erro = '';
    this.mensagem = '';

    this.categoriaService.consultarCategoria(Number(this.idBusca)).subscribe({
      next: categoria => {
        // Coloca a categoria encontrada dentro de uma lista.
        this.categorias = [categoria];
        this.carregando = false;
      },
      error: erro => {
        console.error('Erro ao consultar categoria:', erro);
        this.categorias = [];

        // Verifica se o erro foi 404 (categoria não encontrada).
        this.erro = erro.status === 404
          ? 'Categoria não encontrada.'
          : 'Não foi possível consultar a categoria.';

        this.carregando = false;
      }
    });
  }

  // Cancela a edição e limpa os campos e mensagens.
  cancelarEdicao(): void {
    this.idEdicao = null;
    this.nomeCategoria = '';
    this.erro = '';
    this.mensagem = '';
  }
}
