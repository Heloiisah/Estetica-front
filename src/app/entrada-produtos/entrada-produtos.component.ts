
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EntradaProduto, EntradaProdutoService } from '../services/entrada-produto.service';

@Component({
  selector: 'app-entrada-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './entrada-produtos.component.html',
  styleUrl: './entrada-produtos.component.css'
})
export class EntradaProdutosComponent implements OnInit {

  // Variáveis para armazenar as entradas e os dados do formulário.
  entradas: EntradaProduto[] = [];

  idItem: number | null = null;
  dataEntradaProduto = '';
  quantidadeEntrada: number | null = null;
  unidade = '';
  valorUnitarioEntrada: number | null = null;

  idBusca: number | null = null;
  idEdicao: number | null = null;

  mensagem = '';
  erro = '';
  carregando = false;

  constructor(private entradaProdutoService: EntradaProdutoService) {}

  // Executa quando a página é inicializada.
  ngOnInit(): void {
    this.listarEntradas();
  }

  // Busca todas as entradas de produtos cadastradas na API.
  listarEntradas(): void {
    this.carregando = true;

    this.entradaProdutoService.listarEntradas().subscribe({
      next: (dados) => {
        this.entradas = dados;
        this.carregando = false;
      },
      error: (erro: unknown) => {
        console.error(erro);
        this.erro = 'Não foi possível carregar as entradas de produtos.';
        this.carregando = false;
      }
    });
  }

  // Valida os campos e realiza o cadastro ou a edição de uma entrada.
  salvarEntrada(): void {
    this.mensagem = '';
    this.erro = '';

    // Verifica se todos os campos obrigatórios foram preenchidos.
    if (
      this.idItem === null ||
      !this.dataEntradaProduto ||
      this.quantidadeEntrada === null ||
      !this.unidade.trim() ||
      this.valorUnitarioEntrada === null
    ) {
      this.erro = 'Preencha todos os campos obrigatórios.';
      return;
    }

    // Verifica se os valores são positivos e se a unidade possui até 10 caracteres.
    if (
      this.idItem <= 0 ||
      this.quantidadeEntrada <= 0 ||
      this.valorUnitarioEntrada <= 0 ||
      this.unidade.trim().length > 10
    ) {
      this.erro = 'Confira os valores informados. A unidade deve ter até 10 caracteres.';
      return;
    }

    // Monta o objeto com os dados que serão enviados para a API.
    const dados: Partial<EntradaProduto> = {
      idItem: this.idItem,
      dataEntradaProduto: this.dataEntradaProduto,
      quantidadeEntrada: this.quantidadeEntrada,
      unidade: this.unidade.trim(),
      valorUnitarioEntrada: this.valorUnitarioEntrada
    };

    // Verifica se existe um ID de edição para decidir entre atualizar ou cadastrar.
    if (this.idEdicao !== null) {
      const id = this.idEdicao;

      this.entradaProdutoService.editarEntrada(id, dados).subscribe({
        next: () => {
          this.mensagem = 'Entrada atualizada com sucesso!';
          this.limparFormulario();
          this.listarEntradas();
        },
        error: (erro: unknown) => {
          console.error(erro);
          this.erro = 'Não foi possível atualizar a entrada. Verifique os dados informados.';
        }
      });
    } else {
      // Se não estiver editando, realiza um novo cadastro.
      this.entradaProdutoService.cadastrarEntrada(dados).subscribe({
        next: () => {
          this.mensagem = 'Entrada registrada com sucesso!';
          this.limparFormulario();
          this.listarEntradas();
        },
        error: (erro: unknown) => {
          console.error(erro);
          this.erro = 'Não foi possível registrar a entrada. Verifique se o produto possui estoque cadastrado.';
        }
      });
    }
  }

  // Consulta uma entrada específica utilizando seu ID.
  consultarPorId(): void {
    this.mensagem = '';
    this.erro = '';

    // Verifica se o ID informado é válido.
    if (this.idBusca === null || this.idBusca <= 0) {
      this.erro = 'Informe um ID de entrada válido.';
      return;
    }

    this.entradaProdutoService.consultarEntrada(this.idBusca).subscribe({
      next: (entrada) => {
        // Coloca a entrada encontrada dentro de uma lista.
        this.entradas = [entrada];
        this.mensagem = 'Entrada encontrada.';
      },
      error: (erro: unknown) => {
        console.error(erro);
        this.erro = 'Entrada não encontrada.';
      }
    });
  }

  // Carrega os dados da entrada selecionada nos campos do formulário.
  editar(entrada: EntradaProduto): void {
    this.idEdicao = entrada.idEntradaProduto;
    this.idItem = entrada.idItem;
    this.dataEntradaProduto = entrada.dataEntradaProduto.substring(0, 10);
    this.quantidadeEntrada = entrada.quantidadeEntrada;
    this.unidade = entrada.unidade;
    this.valorUnitarioEntrada = entrada.valorUnitarioEntrada;

    this.mensagem = '';
    this.erro = '';
  }

  // Exclui uma entrada após a confirmação do usuário.
  excluir(id: number): void {
    if (!confirm('Deseja realmente excluir esta entrada?')) {
      return;
    }

    this.mensagem = '';
    this.erro = '';

    this.entradaProdutoService.excluirEntrada(id).subscribe({
      next: () => {
        this.mensagem = 'Entrada excluída com sucesso!';
        this.listarEntradas();
      },
      error: (erro: unknown) => {
        console.error(erro);
        this.erro = 'Não foi possível excluir a entrada ou atualizar o estoque.';
      }
    });
  }

  // Limpa todos os campos do formulário e o ID de edição.
  limparFormulario(): void {
    this.idItem = null;
    this.dataEntradaProduto = '';
    this.quantidadeEntrada = null;
    this.unidade = '';
    this.valorUnitarioEntrada = null;
    this.idEdicao = null;
  }

  // Cancela a edição e limpa as mensagens da tela.
  cancelarEdicao(): void {
    this.limparFormulario();
    this.mensagem = '';
    this.erro = '';
  }

  // Limpa a pesquisa e volta a exibir todas as entradas.
  voltarLista(): void {
    this.idBusca = null;
    this.mensagem = '';
    this.erro = '';
    this.listarEntradas();
  }
}
