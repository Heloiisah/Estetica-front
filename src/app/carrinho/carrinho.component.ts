
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PedidoService } from '../services/pedido.service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './carrinho.component.html',
  styleUrl: './carrinho.component.css'
})
export class CarrinhoComponent implements OnInit {

  // Variáveis utilizadas para controlar o carrinho.
  carrinho = signal<any[]>([]);
  mensagem = '';
  cep = '';
  formaPagamento = '';
  frete = 5;
  enviando = false;

  constructor(
    private router: Router,
    private pedidoService: PedidoService
  ) {}

  // Executa quando a página é inicializada.
  ngOnInit(): void {
    this.carregarCarrinho();
  }

  // Recupera os produtos salvos no localStorage.
  carregarCarrinho(): void {
    try {
      const dados = localStorage.getItem('carrinho');
      const itens = dados ? JSON.parse(dados) : [];

      // Verifica se os dados são uma lista e garante quantidade mínima de 1.
      this.carrinho.set(
        Array.isArray(itens)
          ? itens.map(item => ({
              ...item,
              quantidade: Math.max(1, Number(item.quantidade) || 1)
            }))
          : []
      );

      this.salvarCarrinho();
    } catch (erro) {
      console.error('Erro ao carregar carrinho:', erro);
      this.carrinho.set([]);
    }
  }

  // Obtém o preço do produto, procurando em diferentes propriedades.
  obterPreco(item: any): number {
    return Number(item.precoVenda ?? item.precoItem ?? item.preco ?? 0);
  }

  // Calcula o frete: cobra R$ 5 se existir produto do tipo P.
  obterFrete(): number {
    return this.carrinho().some(item => item.tipoItem === 'P')
      ? this.frete
      : 0;
  }

  // Calcula automaticamente o valor total dos produtos.
  totalCarrinho = computed(() =>
    this.carrinho().reduce(
      (total, item) => total + this.obterPreco(item) * item.quantidade,
      0
    )
  );

  // Soma o valor dos produtos com o frete.
  totalPagar = computed(() => this.totalCarrinho() + this.obterFrete());

  // Altera a quantidade de um produto específico.
  alterarQuantidade(index: number, quantidade: number): void {
    if (!Number.isFinite(quantidade) || quantidade < 1) {
      return;
    }

    // map() percorre a lista e modifica somente o produto selecionado.
    this.carrinho.update(lista =>
      lista.map((item, i) =>
        i === index
          ? { ...item, quantidade: Math.floor(quantidade) }
          : item
      )
    );

    this.salvarCarrinho();
    this.mensagem = '';
  }

  // Remove um produto do carrinho usando seu índice.
  removerDoCarrinho(index: number): void {
    this.carrinho.update(lista => lista.filter((_, i) => i !== index));
    this.salvarCarrinho();
    this.mensagem = 'Item removido do carrinho.';
  }

  // Salva os produtos no armazenamento do navegador.
  salvarCarrinho(): void {
    try {
      localStorage.setItem('carrinho', JSON.stringify(this.carrinho()));
    } catch (erro) {
      console.error('Erro ao salvar o carrinho:', erro);
      this.mensagem = 'Não foi possível salvar o carrinho.';
    }
  }

  // Redireciona o usuário para a página de produtos.
  continuarComprando(): void {
    this.router.navigate(['/produtos']);
  }

  // Método responsável por validar e finalizar o pedido.
  finalizarAgendamento(): void {

    // Impede o envio de pedidos duplicados.
    if (this.enviando) {
      return;
    }

    // Verifica se o carrinho possui produtos.
    if (this.carrinho().length === 0) {
      this.mensagem = 'Seu carrinho está vazio.';
      return;
    }

    // Exige CEP com 8 números quando existe produto do tipo P.
    if (
      this.carrinho().some(item => item.tipoItem === 'P') &&
      !/^[0-9]{8}$/.test(this.cep.replace(/\D/g, ''))
    ) {
      this.mensagem = 'Informe um CEP válido com 8 números.';
      return;
    }

    // Verifica se a forma de pagamento foi selecionada.
    if (!this.formaPagamento) {
      this.mensagem = 'Selecione uma forma de pagamento.';
      return;
    }

    // Recupera o ID do cliente salvo no localStorage.
    const idpessoa = Number(localStorage.getItem('idpessoa'));

    if (!Number.isInteger(idpessoa) || idpessoa <= 0) {
      this.mensagem = 'Não foi possível identificar o cliente.';
      return;
    }

    // Map agrupa os produtos pelo ID e soma suas quantidades.
    const itensAgrupados = new Map<number, number>();

    for (const item of this.carrinho()) {
      const iditem = Number(item.iditem ?? item.idItem ?? item.id);
      const quantidade = Number(item.quantidade);

      // Verifica se o ID e a quantidade são números inteiros positivos.
      if (
        !Number.isInteger(iditem) ||
        iditem <= 0 ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
      ) {
        this.mensagem = 'Há itens no carrinho com identificadores inválidos.';
        return;
      }

      // Adiciona o produto ao Map ou soma sua quantidade se já existir.
      itensAgrupados.set(
        iditem,
        (itensAgrupados.get(iditem) ?? 0) + quantidade
      );
    }

    // Transforma o Map em uma lista de produtos com ID e quantidade.
    const itens = Array.from(
      itensAgrupados,
      ([iditem, quantidade]) => ({
        iditem,
        quantidade
      })
    );

    // Monta o objeto que será enviado para a API.
    const pedido = {
      idpessoa,
      formaPagamento: this.formaPagamento,
      frete: this.obterFrete(),
      itens
    };

    // Indica que o pedido está sendo enviado.
    this.enviando = true;
    this.mensagem = 'Enviando pedido...';

    // Envia o pedido para o serviço e aguarda a resposta da API.
    this.pedidoService.criarPedido(pedido).subscribe({

      // Executa quando o pedido é cadastrado com sucesso.
      next: resposta => {
        this.mensagem =
          `Pedido realizado com sucesso! Número: ${resposta.idPedido}. Total: R$ ${Number(resposta.total).toFixed(2).replace('.', ',')}`;

        // Limpa o carrinho após a confirmação do pedido.
        this.carrinho.set([]);
        this.salvarCarrinho();
        this.enviando = false;
      },

      // Executa caso ocorra algum erro na requisição.
      error: erro => {
        console.error('Erro ao criar pedido:', erro);

        // Exibe a mensagem retornada pela API ou uma mensagem padrão.
        this.mensagem =
          erro.error?.mensagem ||
          (typeof erro.error === 'string' ? erro.error : null) ||
          'Não foi possível finalizar o pedido.';

        this.enviando = false;
      }
    });
  }
}
