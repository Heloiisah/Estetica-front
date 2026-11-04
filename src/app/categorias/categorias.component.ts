
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
// Cria a classe CategoriasComponent e implementa OnInit.
export class CategoriasComponent implements OnInit {

  // Cria uma lista vazia para armazenar as categorias cadastradas.
  // O tipo Categoria[] indica que a lista recebe objetos do tipo Categoria.
  categorias: Categoria[] = [];

  // Armazena o nome informado pelo usuário no formulário de categoria.
  nomeCategoria = '';

  // Armazena o ID utilizado para pesquisar uma categoria específica.
  // Pode receber um número ou null quando nenhum ID foi informado.
  idBusca: number | null = null;

  // Armazena o ID da categoria que está sendo editada.
  // Quando o valor é null, significa que nenhuma edição está acontecendo.
  idEdicao: number | null = null;

  // Armazena mensagens de sucesso exibidas ao usuário.
  mensagem = '';

  // Armazena mensagens de erro exibidas ao usuário.
  erro = '';

  // Controla o estado de carregamento das operações realizadas na API.
  carregando = false;

  // Injeta o CategoriaService para permitir a comunicação com a API.
  constructor(private categoriaService: CategoriaService) {}

  // Método executado automaticamente quando o componente é inicializado.
  ngOnInit(): void {

    // Chama o método responsável por buscar todas as categorias cadastradas.
    this.listarCategorias();
  }

  // Método responsável por listar todas as categorias cadastradas na API.
  listarCategorias(): void {

    // Ativa o indicador de carregamento.
    this.carregando = true;

    // Limpa qualquer mensagem de erro anterior.
    this.erro = '';

    // Limpa qualquer mensagem de sucesso anterior.
    this.mensagem = '';

    // Chama o serviço para buscar todas as categorias e aguarda a resposta.
    this.categoriaService.listarCategorias().subscribe({

      // Executa quando a API retorna os dados com sucesso.
      next: dados => {

        // Armazena as categorias recebidas da API na lista.
        this.categorias = dados;

        // Desativa o indicador de carregamento após receber os dados.
        this.carregando = false;
      },

      // Executa quando ocorre algum erro na comunicação com a API.
      error: erro => {

        // Exibe no console os detalhes do erro ocorrido.
        console.error('Erro ao listar categorias:', erro);

        // Exibe uma mensagem informando que não foi possível carregar as categorias.
        this.erro = 'Não foi possível carregar as categorias.';

        // Desativa o indicador de carregamento mesmo quando ocorre um erro.
        this.carregando = false;
      }
    });
  }

  // Método responsável por cadastrar uma nova categoria ou atualizar uma existente.
  salvarCategoria(): void {

    // Remove os espaços desnecessários do início e do final do nome informado.
    const nome = this.nomeCategoria.trim();

    // Verifica se o nome da categoria foi preenchido.
    if (!nome) {

      // Exibe uma mensagem solicitando o preenchimento do nome.
      this.erro = 'Informe o nome da categoria.';

      // Limpa qualquer mensagem de sucesso anterior.
      this.mensagem = '';

      // Interrompe a execução caso o nome esteja vazio.
      return;
    }

    // Limpa qualquer mensagem de erro anterior.
    this.erro = '';

    // Limpa qualquer mensagem de sucesso anterior.
    this.mensagem = '';

    // Cria um objeto contendo os dados que serão enviados para a API.
    const dados = { categoria: nome };

    // Verifica se existe um ID de edição.
    // Se existir, chama o método de atualização da categoria.
    // Caso contrário, chama o método de cadastro de uma nova categoria.
    const requisicao = this.idEdicao !== null

      // Envia o ID e os novos dados para atualizar uma categoria existente.
      ? this.categoriaService.editarCategoria(this.idEdicao, dados)

      // Envia os dados para cadastrar uma nova categoria.
      : this.categoriaService.cadastrarCategoria(dados);

    // Executa a requisição e aguarda a resposta da API.
    requisicao.subscribe({

      // Executa quando a operação de cadastro ou edição é realizada com sucesso.
      next: () => {

        // Verifica se a operação realizada foi uma edição ou um cadastro.
        this.mensagem = this.idEdicao !== null

          // Exibe a mensagem de sucesso quando uma categoria é atualizada.
          ? 'Categoria atualizada com sucesso!'

          // Exibe a mensagem de sucesso quando uma categoria é cadastrada.
          : 'Categoria cadastrada com sucesso!';

        // Limpa o campo de nome da categoria após salvar.
        this.nomeCategoria = '';

        // Limpa o ID de edição para voltar ao modo de cadastro.
        this.idEdicao = null;

        // Atualiza a lista de categorias após salvar os dados.
        this.listarCategorias();
      },

      // Executa quando ocorre algum erro durante o cadastro ou a edição.
      error: erro => {

        // Exibe no console os detalhes do erro retornado pela API.
        console.error('Erro ao salvar categoria:', erro);

        // Exibe uma mensagem informando que não foi possível salvar a categoria.
        this.erro = 'Não foi possível salvar a categoria. Confira os dados enviados à API.';
      }
    });
  }

  // Método responsável por carregar os dados de uma categoria para edição.
  editar(categoria: Categoria): void {

    // Armazena o ID da categoria que será editada.
    this.idEdicao = categoria.idcategoria;

    // Preenche o campo de nome com o nome atual da categoria selecionada.
    this.nomeCategoria = categoria.categoria;

    // Limpa qualquer mensagem de sucesso anterior.
    this.mensagem = '';

    // Limpa qualquer mensagem de erro anterior.
    this.erro = '';
  }

  // Método responsável por excluir uma categoria após a confirmação do usuário.
  excluir(categoria: Categoria): void {

    // Exibe uma janela de confirmação perguntando se o usuário deseja excluir.
    // O nome da categoria é apresentado na mensagem.
    const confirmar = window.confirm(
      `Deseja excluir a categoria "${categoria.categoria}"?`
    );

    // Verifica se o usuário cancelou a operação de exclusão.
    if (!confirmar) {

      // Interrompe a execução caso o usuário não confirme a exclusão.
      return;
    }

    // Limpa qualquer mensagem de erro anterior.
    this.erro = '';

    // Limpa qualquer mensagem de sucesso anterior.
    this.mensagem = '';

    // Chama o serviço responsável por excluir a categoria utilizando seu ID.
    this.categoriaService.excluirCategoria(categoria.idcategoria).subscribe({

      // Executa quando a categoria é excluída com sucesso.
      next: () => {

        // Exibe uma mensagem confirmando que a categoria foi excluída.
        this.mensagem = 'Categoria excluída com sucesso!';

        // Atualiza a lista após a exclusão da categoria.
        this.listarCategorias();
      },

      // Executa quando ocorre algum erro durante a exclusão.
      error: erro => {

        // Exibe no console os detalhes do erro retornado pela API.
        console.error('Erro ao excluir categoria:', erro);

        // Informa que a categoria não pôde ser excluída.
        // Isso pode acontecer quando existem itens vinculados a ela.
        this.erro = 'Não foi possível excluir. Verifique se existem itens vinculados a essa categoria.';
      }
    });
  }

  // Método responsável por pesquisar uma categoria utilizando seu ID.
  consultarPorId(): void {

    // Verifica se o ID foi informado, se é um número inteiro e se é positivo.
    if (this.idBusca === null || !Number.isInteger(Number(this.idBusca)) || Number(this.idBusca) <= 0) {

      // Exibe uma mensagem solicitando um ID válido.
      this.erro = 'Informe um ID válido.';

      // Limpa qualquer mensagem de sucesso anterior.
      this.mensagem = '';

      // Interrompe a execução caso o ID seja inválido.
      return;
    }

    // Ativa o indicador de carregamento durante a consulta.
    this.carregando = true;

    // Limpa qualquer mensagem de erro anterior.
    this.erro = '';

    // Limpa qualquer mensagem de sucesso anterior.
    this.mensagem = '';

    // Chama o serviço para consultar uma categoria pelo ID informado.
    this.categoriaService.consultarCategoria(Number(this.idBusca)).subscribe({

      // Executa quando a categoria é encontrada na API.
      next: categoria => {

        // Coloca a categoria encontrada dentro de uma lista.
        // Isso permite utilizar a mesma estrutura de exibição das demais categorias.
        this.categorias = [categoria];

        // Desativa o indicador de carregamento após receber o resultado.
        this.carregando = false;
      },

      // Executa quando ocorre algum erro durante a consulta.
      error: erro => {

        // Exibe no console os detalhes do erro retornado pela API.
        console.error('Erro ao consultar categoria:', erro);

        // Limpa a lista porque nenhuma categoria foi encontrada.
        this.categorias = [];

        // Verifica se o código de erro retornado pela API é 404.
        this.erro = erro.status === 404

          // Exibe uma mensagem específica quando a categoria não é encontrada.
          ? 'Categoria não encontrada.'

          // Exibe uma mensagem padrão para outros tipos de erro.
          : 'Não foi possível consultar a categoria.';

        // Desativa o indicador de carregamento após a falha na consulta.
        this.carregando = false;
      }
    });
  }

  // Método responsável por cancelar uma edição e limpar os campos do formulário.
  cancelarEdicao(): void {

    // Limpa o ID da categoria que estava sendo editada.
    this.idEdicao = null;

    // Limpa o campo utilizado para informar o nome da categoria.
    this.nomeCategoria = '';

    // Limpa qualquer mensagem de erro exibida na tela.
    this.erro = '';

    // Limpa qualquer mensagem de sucesso exibida na tela.
    this.mensagem = '';
  }
}