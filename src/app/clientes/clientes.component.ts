
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PessoaEnderecoService } from '../services/pessoa-endereco.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
// Declara a classe ClientesComponent e implementa OnInit.
// OnInit permite executar ações automaticamente quando o componente é inicializado.
export class ClientesComponent implements OnInit {

  // Cria uma lista vazia para armazenar os clientes cadastrados.
  clientes: any[] = [];

  // Armazena o ID informado pelo usuário para pesquisar um cliente.
  idBusca = '';

  // Armazena mensagens de sucesso, erro ou informações exibidas na tela.
  mensagem = '';

  // Controla se existe alguma operação de carregamento em andamento.
  carregando = false;

  // Injeta o serviço PessoaEnderecoService para permitir a comunicação com a API.
  constructor(private pessoaEnderecoService: PessoaEnderecoService) {}

  // Método executado automaticamente quando o componente é inicializado.
  ngOnInit(): void {

    // Chama o método responsável por buscar todos os clientes cadastrados.
    this.listarClientes();
  }

  // Método responsável por buscar todos os clientes cadastrados na API.
  listarClientes(): void {

    // Ativa o indicador de carregamento.
    this.carregando = true;

    // Limpa qualquer mensagem anterior.
    this.mensagem = '';

    // Chama o serviço responsável por listar as pessoas cadastradas na API.
    this.pessoaEnderecoService.listarPessoas().subscribe({

      // Executa quando a API retorna os clientes com sucesso.
      next: resposta => {

        // Armazena os clientes recebidos da API na lista.
        this.clientes = resposta;

        // Desativa o indicador de carregamento após receber os dados.
        this.carregando = false;
      },

      // Executa quando ocorre algum erro durante a comunicação com a API.
      error: erro => {

        // Exibe no console os detalhes do erro ocorrido.
        console.error('Erro ao listar clientes:', erro);

        // Exibe uma mensagem informando que não foi possível carregar os clientes.
        this.mensagem = 'Não foi possível carregar os clientes.';

        // Desativa o indicador de carregamento mesmo quando ocorre um erro.
        this.carregando = false;
      }
    });
  }

  // Método responsável por consultar um cliente utilizando seu ID.
  consultarPorId(): void {

    // Converte o ID informado pelo usuário de texto para número.
    const id = Number(this.idBusca);

    // Verifica se o ID é um número inteiro e positivo.
    if (!Number.isInteger(id) || id <= 0) {

      // Exibe uma mensagem solicitando um ID válido.
      this.mensagem = 'Informe um ID válido.';

      // Interrompe a execução caso o ID seja inválido.
      return;
    }

    // Ativa o indicador de carregamento durante a consulta.
    this.carregando = true;

    // Limpa qualquer mensagem anterior.
    this.mensagem = '';

    // Chama o serviço responsável por consultar uma pessoa pelo ID.
    this.pessoaEnderecoService.consultarPessoaPorId(id).subscribe({

      // Executa quando o cliente é encontrado na API.
      next: cliente => {

        // Coloca o cliente encontrado dentro de uma lista.
        // Isso permite manter o mesmo formato utilizado na listagem de clientes.
        this.clientes = [cliente];

        // Desativa o indicador de carregamento após receber o resultado.
        this.carregando = false;

        // Limpa qualquer mensagem anterior após a consulta bem-sucedida.
        this.mensagem = '';
      },

      // Executa quando ocorre algum erro durante a consulta do cliente.
      error: erro => {

        // Exibe no console os detalhes do erro retornado pela API.
        console.error('Erro ao consultar cliente:', erro);

        // Limpa a lista de clientes porque a consulta não foi realizada com sucesso.
        this.clientes = [];

        // Verifica se o código de erro retornado pela API é 404.
        this.mensagem = erro.status === 404

          // Exibe uma mensagem específica quando o cliente não é encontrado.
          ? 'Cliente não encontrado.'

          // Exibe uma mensagem padrão para outros tipos de erro.
          : 'Não foi possível consultar o cliente.';

        // Desativa o indicador de carregamento após a falha na consulta.
        this.carregando = false;
      }
    });
  }

  // Método responsável por limpar a pesquisa e carregar novamente todos os clientes.
  limparBusca(): void {

    // Limpa o campo onde o usuário informa o ID para pesquisa.
    this.idBusca = '';

    // Chama novamente o método que busca todos os clientes cadastrados.
    this.listarClientes();
  }
}