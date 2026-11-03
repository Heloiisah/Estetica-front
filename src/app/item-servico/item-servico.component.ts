
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ItemServicoService } from '../services/item-servico.service';

@Component({
  selector: 'app-item-servico',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './item-servico.component.html',
  styleUrl: './item-servico.component.css'
})
export class ItemServicoComponent implements OnInit {

  // Armazena os serviços disponíveis e controla mensagens de erro.
  servicos = signal<any[]>([]);
  mensagemErro = '';

  constructor(
    private itemServicoService: ItemServicoService,
    private router: Router
  ) {}

  // Executa quando a página é inicializada e busca os serviços na API.
  ngOnInit(): void {
    this.itemServicoService.listarServicos().subscribe({
      next: (dados) => {

        // Filtra somente os serviços ativos do tipo S.
        this.servicos.set(
          dados.filter(servico =>
            String(servico.tipoItem ?? '').trim().toUpperCase() === 'S' &&
            String(servico.ativoProdutoServico ?? '').trim().toUpperCase() === 'S'
          )
        );
      },
      error: (erro) => {
        console.error('Erro ao carregar serviços:', erro);
        this.mensagemErro = 'Não foi possível carregar os serviços.';
      }
    });
  }

  // Retorna o preço do serviço, verificando os possíveis campos de preço.
  obterPreco(servico: any): number {
    return Number(
      servico.preco ?? servico.precoItem ?? servico.precoVenda ?? 0
    );
  }

  // Adiciona o serviço selecionado ao carrinho e redireciona para a página do carrinho.
  agendar(servico: any): void {

    // Recupera os itens que já estão armazenados no carrinho.
    const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');

    // Adiciona o serviço selecionado com quantidade inicial igual a 1.
    carrinho.push({
      idItem: servico.idItem,
      item: servico.item,
      descricaoItem: servico.descricaoItem,
      precoItem: this.obterPreco(servico),
      tipoItem: 'S',
      quantidade: 1
    });

    // Salva o carrinho atualizado no navegador.
    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    // Redireciona o usuário para a página do carrinho.
    this.router.navigate(['/carrinho']);
  }
}
