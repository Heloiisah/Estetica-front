
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProdutoService } from '../services/produto.service';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.css'
})
export class ProdutosComponent implements OnInit {

  // Armazena os produtos disponíveis e controla mensagens de erro.
  produtos = signal<any[]>([]);
  mensagemErro = '';

  constructor(
    private produtoService: ProdutoService,
    private router: Router
  ) {}

  // Executa quando a página é inicializada e busca os produtos na API.
  ngOnInit(): void {
    this.produtoService.listarProdutos().subscribe({
      next: (dados) => {

        // Filtra somente os produtos ativos do tipo P.
        this.produtos.set(
          dados.filter(produto =>
            String(produto.tipoItem ?? '').trim().toUpperCase() === 'P' &&
            String(produto.ativoProdutoServico ?? '').trim().toUpperCase() === 'S'
          )
        );
      },
      error: (erro) => {
        console.error('Erro ao carregar produtos:', erro);
        this.mensagemErro = 'Não foi possível carregar os produtos.';
      }
    });
  }

  // Obtém o preço do produto verificando os possíveis campos de preço.
  obterPreco(produto: any): number {
    return Number(
      produto.precoVenda ?? produto.precoItem ?? produto.preco ?? 0
    );
  }

  // Adiciona o produto selecionado ao carrinho.
  adicionarAoCarrinho(produto: any): void {
    try {
      // Recupera os itens que já estão armazenados no navegador.
      const dados = localStorage.getItem('carrinho');
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
      console.error('Erro ao adicionar produto ao carrinho:', erro);
      this.mensagemErro = 'Não foi possível adicionar o produto ao carrinho.';
    }
  }
}
