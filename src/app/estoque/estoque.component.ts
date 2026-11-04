
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Estoque, EstoqueService } from '../services/estoque.service';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './estoque.component.html',
  styleUrl: './estoque.component.css'
})

export class EstoqueComponent implements OnInit {

  // Declara uma lista vazia que armazenará os registros de estoque.
  // Estoque[] indica que a lista poderá conter vários objetos do tipo Estoque.
  estoques: Estoque[] = [];
  idBusca = 0;

  consultarPorId(): void {
    if (this.idBusca < 1) { this.erro = 'Informe um ID válido.'; return; }
    this.estoqueService.consultarEstoque(this.idBusca).subscribe({
      next: estoque => { this.estoques = [estoque]; this.erro = ''; },
      error: () => this.erro = 'Produto não encontrado no estoque.'
    });
  }

  // Declara uma variável para armazenar mensagens de sucesso exibidas na tela.
  // Inicialmente, ela começa vazia.
  mensagem = '';

  // Declara uma variável para armazenar mensagens de erro exibidas na tela.
  // Inicialmente, ela começa vazia.
  erro = '';

  // Declara uma variável booleana para controlar o carregamento dos dados.
  // false significa que não está carregando.
  // true significa que está realizando uma operação de carregamento.
  carregando = false;

  // Construtor da classe.
  // Injeta o EstoqueService para permitir que o componente utilize seus métodos.
  // O private permite acessar o serviço dentro da própria classe.
  constructor(private estoqueService: EstoqueService) {}

  // Método executado automaticamente quando o componente é inicializado.
  ngOnInit(): void {

    // Chama o método listarEstoques para buscar os registros na API
    // assim que a página for carregada.
    this.listarEstoques();

  } // Final do método ngOnInit.

  // Método responsável por buscar todos os registros de estoque cadastrados na API.
  listarEstoques(): void {

    // Altera a variável carregando para true.
    // Isso indica que a aplicação está buscando os dados.
    this.carregando = true;

    // Limpa qualquer mensagem de sucesso que tenha sido exibida anteriormente.
    this.mensagem = '';

    // Limpa qualquer mensagem de erro anterior.
    this.erro = '';

    // Acessa o serviço de estoque e chama o método listarEstoques.
    // Esse método realiza a requisição para buscar os registros na API.
    // O subscribe permite receber e tratar a resposta da requisição.
    this.estoqueService.listarEstoques().subscribe({

      // O next é executado quando a requisição é realizada com sucesso.
      // A variável dados recebe as informações retornadas pela API.
      next: (dados) => {

        // Armazena os dados recebidos da API na lista de estoques.
        // Dessa forma, os registros ficam disponíveis para serem exibidos na tela.
        this.estoques = dados;

        // Altera carregando para false, indicando que a busca foi finalizada.
        this.carregando = false;

      }, // Final do bloco next.

      // O error é executado caso aconteça algum problema durante a requisição.
      // O tipo unknown indica que o erro pode ser de qualquer tipo.
      error: (erro: unknown) => {

        // Exibe os detalhes do erro no console do navegador.
        // Isso ajuda o desenvolvedor a identificar o motivo da falha.
        console.error(erro);

        // Armazena uma mensagem informando ao usuário que não foi possível
        // carregar os dados do estoque.
        this.erro = 'Não foi possível carregar os dados do estoque.';

        // Altera carregando para false, pois a requisição foi finalizada,
        // mesmo que tenha ocorrido um erro.
        this.carregando = false;

      } 

    }); 

  } 

}
