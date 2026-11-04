import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ItemServicoService } from '../services/item-servico.service';
import { Categoria, CategoriaService } from '../services/categoria.service';

@Component({
  selector: 'app-item-servico',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './item-servico.component.html',
  styleUrl: './item-servico.component.css'
})

export class ItemServicoComponent implements OnInit {

  // Armazena os serviços disponíveis.
  servicos = signal<any[]>([]);

  // Armazena mensagens de erro.
  mensagemErro = '';

  // Armazena o nome utilizado na pesquisa.
  pesquisa = '';
  pesquisaId = '';

  // Armazena a categoria selecionada.
  categoriaSelecionada = '';

  // Armazena as categorias disponíveis.
  categorias: Categoria[] = [];

  constructor(
    private itemServicoService: ItemServicoService,
    private categoriaService: CategoriaService,
    private router: Router
  ) {}

  // Inicializa os serviços e categorias.
  ngOnInit(): void {

    // Busca os serviços cadastrados na API.
    this.itemServicoService.listarServicos().subscribe({
      next: (dados) => {

        // Verifica se a API retornou uma lista.
        const lista = Array.isArray(dados)
          ? dados
          : (dados as any)?.dados ?? (dados as any)?.data ?? [];

        // Filtra os serviços cadastrados.
        const listaServicos = lista.filter((servico: any) => {

          const tipo = String(servico.tipoItem ?? '')
            .trim()
            .toUpperCase();

          const ativo = String(servico.ativoProdutoServico ?? '')
            .trim()
            .toUpperCase();

          // Mantém somente serviços e registros ativos.
          return (
            (tipo === 'S' || tipo === 'SERVICO' || tipo === 'SERVIÇO') &&
            (ativo === '' || ativo === 'S' || ativo === 'SIM' || ativo === '1' || ativo === 'TRUE')
          );
        });

        // Armazena os serviços encontrados.
        this.servicos.set(listaServicos);

        // Exibe uma mensagem caso não existam serviços.
        if (listaServicos.length === 0) {
          console.warn('Nenhum serviço foi encontrado na API.', lista);
        }
      },

      error: (erro) => {
        console.error('Erro ao carregar serviços:', erro);
        this.mensagemErro = 'Não foi possível carregar os serviços.';
      }
    });

    // Busca as categorias cadastradas.
    this.categoriaService.listarCategorias().subscribe({
      next: (dados) => {
        this.categorias = dados;
      },

      error: (erro) => {
        console.error('Erro ao carregar categorias:', erro);
      }
    });
  }

  // Filtra os serviços pelo nome e pela categoria.
  servicosFiltrados(): any[] {

    return this.servicos().filter(servico => {

      const nomeCorresponde = String(servico.item ?? '')
        .toLowerCase()
        .includes(this.pesquisa.toLowerCase().trim());

      const categoriaCorresponde =
        this.categoriaSelecionada === '' ||
        String(servico.idCategoria ?? servico.idcategoria ?? '') ===
        String(this.categoriaSelecionada);

      const idCorresponde =
        this.pesquisaId === '' ||
        String(servico.idItem) === this.pesquisaId;

      return nomeCorresponde && categoriaCorresponde && idCorresponde;
    });
  }

  // Retorna o preço do serviço.
  obterPreco(servico: any): number {

    return Number(
      servico.preco ??
      servico.precoItem ??
      servico.precoVenda ??
      0
    );
  }

  // Adiciona o serviço ao carrinho e redireciona.
  agendar(servico: any): void {

    const carrinho = JSON.parse(
      localStorage.getItem('carrinho') || '[]'
    );

    carrinho.push({
      idItem: servico.idItem,
      item: servico.item,
      descricaoItem: servico.descricaoItem,
      precoItem: this.obterPreco(servico),
      tipoItem: 'S',
      quantidade: 1
    });

    localStorage.setItem(
      'carrinho',
      JSON.stringify(carrinho)
    );

    this.router.navigate(['/carrinho']);
  }
}
