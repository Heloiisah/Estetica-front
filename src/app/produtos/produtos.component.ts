import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProdutoService } from '../services/produto.service';
import { Categoria, CategoriaService } from '../services/categoria.service';

@Component({
  // Define o nome do componente utilizado no HTML.
  selector: 'app-produtos',

  // Define que o componente é independente.
  standalone: true,

  // Importa o recurso de navegação e os formulários.
  imports: [RouterLink, FormsModule],

  // Define o arquivo HTML do componente.
  templateUrl: './produtos.component.html',

  // Define o arquivo CSS do componente.
  styleUrl: './produtos.component.css'
})

// Componente responsável por exibir os produtos disponíveis.
export class ProdutosComponent implements OnInit {

  // Armazena os produtos disponíveis e controla mensagens de erro.
  produtos = signal<any[]>([]);
  mensagemErro = '';

  // Armazena o nome utilizado na pesquisa de produtos.
  pesquisa = '';

  // Armazena a categoria selecionada no filtro.
  categoriaSelecionada = '';

  // Armazena as categorias disponíveis para pesquisa.
  categorias: Categoria[] = [];

  // Inicializa os serviços de produtos e categorias e o recurso de navegação.
  constructor(
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private router: Router
  ) {}

  // Executa quando a página é inicializada e busca os produtos na API.
  ngOnInit(): void {

    // Chama o serviço para listar os produtos cadastrados.
    this.produtoService.listarProdutos().subscribe({
      // Executa quando a consulta é realizada com sucesso.
      next: (dados) => {

        // Filtra somente os produtos ativos do tipo P.
        this.produtos.set(
          dados.filter(produto =>
            String(produto.tipoItem ?? '').trim().toUpperCase() === 'P' &&
            String(produto.ativoProdutoServico ?? '').trim().toUpperCase() === 'S'
          )
        );

        // Chama o serviço para listar as categorias cadastradas.
        this.categoriaService.listarCategorias().subscribe({

          // Executa quando a consulta é realizada com sucesso.
          next: (dadosCategorias) => {

            // Armazena somente as categorias que possuem produtos ativos.
            this.categorias = dadosCategorias.filter(categoria =>
              this.produtos().some(produto =>
                Number(produto.idCategoria ?? produto.idcategoria) === categoria.idcategoria
              )
            );
          },

          // Executa caso ocorra algum erro ao carregar as categorias.
          error: (erro) => {

            // Exibe os detalhes do erro no console.
            console.error('Erro ao carregar categorias:', erro);
          }
        });
      },

      // Executa caso ocorra algum erro ao carregar os produtos.
      error: (erro) => {

        // Exibe os detalhes do erro no console.
        console.error('Erro ao carregar produtos:', erro);

        // Exibe uma mensagem de erro ao usuário.
        this.mensagemErro = 'Não foi possível carregar os produtos.';
      }
    });
  }

  // Retorna os produtos de acordo com a pesquisa e a categoria selecionada.
  produtosFiltrados(): any[] {

    // Filtra os produtos pelo nome e pela categoria selecionada.
    return this.produtos().filter(produto => {

      // Verifica se o nome do produto corresponde à pesquisa.
      const nomeCorresponde = String(produto.item ?? '')
        .toLowerCase()
        .includes(this.pesquisa.toLowerCase());

      // Verifica se o produto pertence à categoria selecionada.
      const categoriaCorresponde =
        this.categoriaSelecionada === '' ||
        String(produto.idCategoria ?? produto.idcategoria) === this.categoriaSelecionada;

      // Retorna somente os produtos que atendem aos dois filtros.
      return nomeCorresponde && categoriaCorresponde;
    });
  }

  // Obtém o preço do produto verificando os possíveis campos de preço.
  obterPreco(produto: any): number {

    // Converte para número o primeiro campo de preço disponível.
    return Number(
      produto.precoVenda ?? produto.precoItem ?? produto.preco ?? 0
    );
  }

  // Adiciona o produto selecionado ao carrinho.
  adicionarAoCarrinho(produto: any): void {
    try {

      // Recupera os itens que já estão armazenados no navegador.
      const dados = localStorage.getItem('carrinho');

      // Converte os dados armazenados em um objeto ou cria uma lista vazia.
      const carrinho = dados ? JSON.parse(dados) : [];

      // Adiciona o produto ao carrinho com quantidade inicial igual a 1.
      carrinho.push({
        idItem: produto.idItem,
        item: produto.item,
        descricaoItem: produto.descricaoItem,
        precoItem: this.obterPreco(produto),
        tipoItem: 'P',
        quantidade: 1
      });

      // Salva o carrinho atualizado no localStorage.
      localStorage.setItem('carrinho', JSON.stringify(carrinho));

      // Redireciona o usuário para a página do carrinho.
      this.router.navigate(['/carrinho']);

    } catch (erro) {

      // Exibe os detalhes do erro no console.
      console.error('Erro ao adicionar produto ao carrinho:', erro);

      // Exibe uma mensagem caso não seja possível adicionar o produto.
      this.mensagemErro = 'Não foi possível adicionar o produto ao carrinho.';
    }
  }
}