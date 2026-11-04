
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
// Cria a classe CarrinhoComponent e implementa OnInit.
export class CarrinhoComponent implements OnInit {

  // Cria um signal que armazena os produtos adicionados ao carrinho.
  // O signal permite atualizar os dados e refletir as mudanças na tela.
  carrinho = signal<any[]>([]);

  // Armazena mensagens de sucesso, erro ou informações para o usuário.
  mensagem = '';

  // Armazena o CEP informado pelo usuário para calcular o frete.
  cep = '';

  // Armazena a forma de pagamento selecionada pelo cliente.
  formaPagamento = '';

  // Define o valor padrão do frete como cinco reais.
  frete = 5;

  // Controla se o pedido está sendo enviado para a API.
  // Quando true, impede que o usuário envie o mesmo pedido novamente.
  enviando = false;

  // Injeta os serviços necessários para a navegação e comunicação com a API.
  constructor(
    // Injeta o Router para permitir a navegação entre páginas.
    private router: Router,

    // Injeta o PedidoService para realizar operações relacionadas aos pedidos.
    private pedidoService: PedidoService
  ) {}

  // Método executado automaticamente quando o componente é inicializado.
  ngOnInit(): void {

    // Chama o método responsável por recuperar os produtos do carrinho.
    this.carregarCarrinho();
  }

  // Método responsável por recuperar os produtos armazenados no localStorage.
  carregarCarrinho(): void {

    // Utiliza try para tentar recuperar e interpretar os dados do carrinho.
    try {

      // Recupera os dados do carrinho armazenados no navegador.
      const dados = localStorage.getItem('carrinho');

      // Verifica se existem dados salvos.
      // Caso existam, transforma o texto JSON em um objeto JavaScript.
      // Caso contrário, cria uma lista vazia.
      const itens = dados ? JSON.parse(dados) : [];

      // Verifica se os dados recuperados são realmente uma lista.
      // Também garante que cada produto tenha quantidade mínima igual a um.
      this.carrinho.set(

        // Verifica se o conteúdo recuperado é um array.
        Array.isArray(itens)

          // Percorre os produtos e cria uma cópia de cada objeto.
          ? itens.map(item => ({

              // Copia todas as propriedades originais do produto.
              ...item,

              // Define a quantidade como um número válido e nunca menor que um.
              quantidade: Math.max(1, Number(item.quantidade) || 1)
            }))

          // Caso os dados não sejam uma lista, utiliza um carrinho vazio.
          : []
      );

      // Salva novamente o carrinho com os dados organizados.
      this.salvarCarrinho();

    // Captura qualquer erro ocorrido durante a recuperação dos dados.
    } catch (erro) {

      // Exibe no console o erro ocorrido ao carregar o carrinho.
      console.error('Erro ao carregar carrinho:', erro);

      // Limpa o carrinho caso ocorra algum problema na leitura dos dados.
      this.carrinho.set([]);
    }
  }

  // Método responsável por obter o preço de um produto.
  obterPreco(item: any): number {

    // Procura o preço nas propriedades disponíveis do objeto.
    // Primeiro verifica precoVenda, depois precoItem e por último preco.
    // Caso nenhuma propriedade possua valor, retorna zero.
    return Number(item.precoVenda ?? item.precoItem ?? item.preco ?? 0);
  }

  // Método responsável por calcular o valor do frete.
  obterFrete(): number {

    // Verifica se existe algum produto do tipo P no carrinho.
    return this.carrinho().some(item => item.tipoItem === 'P')

      // Se existir produto do tipo P, retorna o valor do frete.
      ? this.frete

      // Caso contrário, retorna zero.
      : 0;
  }

  // Cria uma propriedade computada que calcula automaticamente o total dos produtos.
  totalCarrinho = computed(() =>

    // Percorre todos os produtos do carrinho e soma seus valores.
    this.carrinho().reduce(

      // Calcula o preço de cada produto multiplicado pela quantidade.
      (total, item) => total + this.obterPreco(item) * item.quantidade,

      // Define zero como valor inicial da soma.
      0
    )
  );

  // Cria uma propriedade computada que calcula o valor total a pagar.
  totalPagar = computed(() =>

    // Soma o valor dos produtos com o valor do frete.
    this.totalCarrinho() + this.obterFrete()
  );

  // Método responsável por alterar a quantidade de um produto específico.
  alterarQuantidade(index: number, quantidade: number): void {

    // Verifica se a quantidade é um número válido e maior ou igual a um.
    if (!Number.isFinite(quantidade) || quantidade < 1) {

      // Interrompe a execução caso a quantidade seja inválida.
      return;
    }

    // Atualiza o signal do carrinho modificando somente o produto selecionado.
    this.carrinho.update(lista =>

      // Percorre todos os produtos da lista utilizando o método map.
      lista.map((item, i) =>

        // Verifica se o índice atual corresponde ao produto selecionado.
        i === index

          // Cria uma cópia do produto e atualiza sua quantidade.
          // Math.floor garante que a quantidade seja um número inteiro.
          ? { ...item, quantidade: Math.floor(quantidade) }

          // Mantém os demais produtos sem alterações.
          : item
      )
    );

    // Salva as alterações realizadas no carrinho.
    this.salvarCarrinho();

    // Limpa mensagens anteriores após a alteração da quantidade.
    this.mensagem = '';
  }

  // Método responsável por remover um produto do carrinho.
  removerDoCarrinho(index: number): void {

    // Atualiza o carrinho removendo o produto correspondente ao índice informado.
    this.carrinho.update(lista => lista.filter((_, i) => i !== index));

    // Salva o carrinho atualizado no armazenamento do navegador.
    this.salvarCarrinho();

    // Exibe uma mensagem informando que o produto foi removido.
    this.mensagem = 'Item removido do carrinho.';
  }

  // Método responsável por salvar os produtos no localStorage.
  salvarCarrinho(): void {

    // Utiliza try para tentar armazenar os dados no navegador.
    try {

      // Converte a lista de produtos para JSON e salva no localStorage.
      localStorage.setItem('carrinho', JSON.stringify(this.carrinho()));

    // Captura qualquer erro ocorrido durante o armazenamento.
    } catch (erro) {

      // Exibe no console o erro ocorrido ao salvar o carrinho.
      console.error('Erro ao salvar o carrinho:', erro);

      // Informa ao usuário que não foi possível salvar os produtos.
      this.mensagem = 'Não foi possível salvar o carrinho.';
    }
  }

  // Método responsável por redirecionar o usuário para a página de produtos.
  continuarComprando(): void {

    // Utiliza o Router para navegar até a rota de produtos.
    this.router.navigate(['/produtos']);
  }

  // Método responsável por validar os dados e finalizar o pedido.
  finalizarAgendamento(): void {

    // Verifica se já existe um pedido sendo enviado para a API.
    if (this.enviando) {

      // Interrompe a execução para impedir o envio duplicado.
      return;
    }

    // Verifica se o carrinho possui pelo menos um produto.
    if (this.carrinho().length === 0) {

      // Informa ao usuário que o carrinho está vazio.
      this.mensagem = 'Seu carrinho está vazio.';

      // Interrompe a execução porque não existe pedido para finalizar.
      return;
    }

    // Verifica se existe produto do tipo P e se o CEP possui oito números.
    if (
      this.carrinho().some(item => item.tipoItem === 'P') &&
      !/^[0-9]{8}$/.test(this.cep.replace(/\D/g, ''))
    ) {

      // Informa ao usuário que precisa preencher um CEP válido.
      this.mensagem = 'Informe um CEP válido com 8 números.';

      // Interrompe a execução caso o CEP seja inválido.
      return;
    }

    // Verifica se o cliente selecionou uma forma de pagamento.
    if (!this.formaPagamento) {

      // Exibe uma mensagem solicitando a escolha do pagamento.
      this.mensagem = 'Selecione uma forma de pagamento.';

      // Interrompe a execução enquanto não houver forma de pagamento.
      return;
    }

    // Recupera o ID da pessoa armazenado no localStorage.
    // O valor é convertido de texto para número.
    const idpessoa = Number(localStorage.getItem('idpessoa'));

    // Verifica se o ID da pessoa é um número inteiro positivo.
    if (!Number.isInteger(idpessoa) || idpessoa <= 0) {

      // Informa que não foi possível identificar o cliente.
      this.mensagem = 'Cadastre-se ou identifique-se em Meus pedidos antes de comprar.';

      // Interrompe a execução porque o pedido precisa estar vinculado a uma pessoa.
      return;
    }

    // Cria um Map para agrupar os produtos pelo identificador.
    // A chave representa o ID do produto e o valor representa sua quantidade.
    const itensAgrupados = new Map<number, number>();

    // Percorre todos os produtos que estão armazenados no carrinho.
    for (const item of this.carrinho()) {

      // Recupera o ID do produto verificando diferentes nomes de propriedades.
      const iditem = Number(item.iditem ?? item.idItem ?? item.id);

      // Recupera a quantidade do produto e converte para número.
      const quantidade = Number(item.quantidade);

      // Verifica se o ID e a quantidade são números inteiros positivos.
      if (
        !Number.isInteger(iditem) ||
        iditem <= 0 ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
      ) {

        // Informa que existem produtos com identificadores ou quantidades inválidas.
        this.mensagem = 'Há itens no carrinho com identificadores inválidos.';

        // Interrompe a execução para impedir o envio de dados incorretos.
        return;
      }

      // Adiciona o produto ao Map ou soma sua quantidade caso ele já exista.
      itensAgrupados.set(

        // Utiliza o ID do produto como chave do Map.
        iditem,

        // Recupera a quantidade anterior e soma com a quantidade atual.
        // Caso o produto ainda não exista, considera a quantidade anterior como zero.
        (itensAgrupados.get(iditem) ?? 0) + quantidade
      );
    }

    // Transforma o Map em uma lista de objetos contendo ID e quantidade.
    const itens = Array.from(

      // Utiliza os dados agrupados dos produtos.
      itensAgrupados,

      // Percorre cada registro do Map e cria um objeto para a API.
      ([iditem, quantidade]) => ({

        // Define o identificador do produto.
        iditem,

        // Define a quantidade do produto.
        quantidade
      })
    );

    // Cria o objeto que será enviado para a API ao finalizar o pedido.
    const pedido = {

      // Informa o identificador do cliente responsável pelo pedido.
      idpessoa,

      // Informa a forma de pagamento selecionada.
      formaPagamento: this.formaPagamento,

      // Informa o valor do frete calculado.
      frete: this.obterFrete(),

      // Envia a lista de produtos e suas respectivas quantidades.
      itens
    };

    // Define enviando como true para indicar que existe uma requisição em andamento.
    this.enviando = true;

    // Exibe uma mensagem informando que o pedido está sendo enviado.
    this.mensagem = 'Enviando pedido...';

    // Chama o serviço responsável por enviar o pedido para a API.
    this.pedidoService.criarPedido(pedido).subscribe({

      // Executa esta função quando a API retorna uma resposta de sucesso.
      next: resposta => {

        // Exibe o número do pedido e o valor total retornados pela API.
        this.mensagem =
          `Pedido realizado com sucesso! Número: ${resposta.idPedido}. Total: R$ ${Number(resposta.total).toFixed(2).replace('.', ',')}`;

        // Limpa todos os produtos do carrinho após a confirmação do pedido.
        this.carrinho.set([]);

        // Salva o carrinho vazio no localStorage.
        this.salvarCarrinho();

        // Informa que o envio do pedido foi finalizado.
        this.enviando = false;
      },

      // Executa esta função caso ocorra algum erro durante a requisição.
      error: erro => {

        // Exibe no console os detalhes do erro retornado pela API.
        console.error('Erro ao criar pedido:', erro);

        // Tenta recuperar a mensagem específica retornada pela API.
        this.mensagem = erro.status === 401
          ? 'Identifique-se em Meus pedidos antes de comprar.'
          :

          // Primeiro verifica se a API retornou a propriedade mensagem.
          erro.error?.mensagem ||

          // Caso o erro seja um texto, utiliza diretamente esse texto.
          (typeof erro.error === 'string' ? erro.error : null) ||

          // Caso não exista uma mensagem específica, apresenta uma mensagem padrão.
          'Não foi possível finalizar o pedido.';

        // Informa que o envio do pedido foi finalizado, mesmo com erro.
        this.enviando = false;
      }
    });
  }
}
