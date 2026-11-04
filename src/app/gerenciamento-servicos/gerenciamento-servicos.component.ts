
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ItemServico, ItemServicoService } from '../services/item-servico.service';

@Component({
  selector: 'app-gerenciamento-servicos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './gerenciamento-servicos.component.html',
  styleUrl: './gerenciamento-servicos.component.css'
})
export class GerenciamentoServicosComponent implements OnInit {

  // Armazena os serviços e os dados utilizados no formulário.
  servicos: ItemServico[] = [];
  idCategoria: number | null = 3;
  nomeServico = '';
  descricaoServico = '';
  preco: number | null = null;
  ativoProdutoServico = 'S';
  idBusca: number | null = null;
  idEdicao: number | null = null;
  mensagem = '';
  erro = '';
  carregando = false;

  constructor(private itemServicoService: ItemServicoService) {}

  // Executa quando a página é inicializada.
  ngOnInit(): void {
    this.listarServicos();
  }

  // Busca os serviços cadastrados na API.
  listarServicos(): void {
    this.carregando = true;
    this.erro = '';
    this.mensagem = '';

    this.itemServicoService.listarServicos().subscribe({
      next: dados => {
        // Filtra somente os itens do tipo S (serviços).
        this.servicos = dados.filter(
          servico => servico.tipoItem?.trim().toUpperCase() === 'S'
        );
        this.carregando = false;
      },
      error: erro => {
        console.error('Erro ao listar serviços:', erro);
        this.erro = 'Não foi possível carregar os serviços.';
        this.carregando = false;
      }
    });
  }

  // Valida os campos e realiza o cadastro ou a edição do serviço.
  salvarServico(): void {
    const nome = this.nomeServico.trim();
    const descricao = this.descricaoServico.trim();

    // Verifica se os dados foram preenchidos corretamente.
    if (
      !nome ||
      !descricao ||
      this.idCategoria === null ||
      !Number.isInteger(Number(this.idCategoria)) ||
      Number(this.idCategoria) <= 0 ||
      this.preco === null ||
      !Number.isFinite(Number(this.preco)) ||
      Number(this.preco) < 0
    ) {
      this.erro = 'Preencha corretamente o nome, a descrição, a categoria e o preço.';
      this.mensagem = '';
      return;
    }

    // Monta o objeto com os dados que serão enviados para a API.
    const dados: Partial<ItemServico> = {
      idCategoria: Number(this.idCategoria),
      item: nome,
      descricaoItem: descricao,
      preco: Number(this.preco),
      tipoItem: 'S',
      ativoProdutoServico: this.ativoProdutoServico
    };

    this.erro = '';
    this.mensagem = '';

    // Guarda se a operação atual é uma edição.
    const estavaEditando = this.idEdicao !== null;

    // Função executada quando o cadastro ou a edição dá certo.
    const tratarSucesso = (): void => {
      this.mensagem = estavaEditando
        ? 'Serviço atualizado com sucesso!'
        : 'Serviço cadastrado com sucesso!';

      this.cancelarEdicao();
      this.listarServicos();
    };

    // Função responsável por tratar erros ao salvar.
    const tratarErro = (erro: unknown): void => {
      console.error('Erro ao salvar serviço:', erro);
      this.erro = 'Não foi possível salvar o serviço. Confira os dados enviados à API.';
    };

    // Se estiver editando, atualiza; caso contrário, cadastra.
    if (estavaEditando) {
      this.itemServicoService
        .editarServico(this.idEdicao!, dados)
        .subscribe({
          next: tratarSucesso,
          error: tratarErro
        });
    } else {
      this.itemServicoService
        .cadastrarServico(dados)
        .subscribe({
          next: tratarSucesso,
          error: tratarErro
        });
    }
  }

  // Pesquisa um serviço utilizando seu ID.
  consultarPorId(): void {

    // Verifica se o ID informado é um número inteiro positivo.
    if (
      this.idBusca === null ||
      !Number.isInteger(Number(this.idBusca)) ||
      Number(this.idBusca) <= 0
    ) {
      this.erro = 'Informe um ID válido.';
      this.mensagem = '';
      return;
    }

    this.carregando = true;
    this.erro = '';
    this.mensagem = '';

    this.itemServicoService.consultarServico(Number(this.idBusca)).subscribe({
      next: servico => {
        // Verifica se o item encontrado é realmente um serviço.
        this.servicos =
          servico.tipoItem?.trim().toUpperCase() === 'S'
            ? [servico]
            : [];

        this.carregando = false;

        if (this.servicos.length === 0) {
          this.erro = 'O ID informado não corresponde a um serviço.';
        }
      },
      error: erro => {
        console.error('Erro ao consultar serviço:', erro);
        this.servicos = [];

        // Verifica se o erro é 404 (serviço não encontrado).
        this.erro = erro.status === 404
          ? 'Serviço não encontrado.'
          : 'Não foi possível consultar o serviço.';

        this.carregando = false;
      }
    });
  }

  // Carrega os dados do serviço selecionado nos campos de edição.
  editar(servico: ItemServico): void {
    this.idEdicao = servico.idItem;
    this.idCategoria = servico.idCategoria;
    this.nomeServico = servico.item;
    this.descricaoServico = servico.descricaoItem;
    this.preco = Number(servico.preco);
    this.ativoProdutoServico = servico.ativoProdutoServico;
    this.mensagem = '';
    this.erro = '';
  }

  // Desativa um serviço após a confirmação do usuário.
  desativar(servico: ItemServico): void {
    const confirmar = window.confirm(
      `Deseja desativar o serviço "${servico.item}"?`
    );

    if (!confirmar) {
      return;
    }

    this.erro = '';
    this.mensagem = '';

    this.itemServicoService.desativarServico(servico.idItem).subscribe({
      next: () => {
        this.mensagem = 'Serviço desativado com sucesso!';
        this.listarServicos();
      },
      error: erro => {
        console.error('Erro ao desativar serviço:', erro);

        this.erro = 'Não foi possível desativar o serviço.';
      }
    });
  }

  // Cancela a edição e restaura os campos para os valores iniciais.
  cancelarEdicao(): void {
    this.idEdicao = null;
    this.idCategoria = 3;
    this.nomeServico = '';
    this.descricaoServico = '';
    this.preco = null;
    this.ativoProdutoServico = 'S';
  }
}
