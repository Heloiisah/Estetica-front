
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../services/pedido.service';

// Define os dados de cada item que faz parte de um pedido.
interface ItemPedido {
  idItem: number;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
}

// Define a estrutura dos dados de um pedido.
interface Pedido {
  idPedido: number;
  idPessoa: number;
  dataPedido: string;
  status: string;
  formaPagamento: string;
  frete: number;
  total: number;
  itens: ItemPedido[];
}

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent implements OnInit {

  // Armazena os pedidos e controla as mensagens da tela.
  pedidos: Pedido[] = [];
  carregando = false;
  mensagem = '';
  erro = '';

  // Lista os status disponíveis para os pedidos.
  statusPermitidos = [
    'Aberto',
    'Em processamento',
    'Concluído',
    'Cancelado'
  ];

  constructor(private pedidoService: PedidoService) {}

  // Executa quando a página é inicializada.
  ngOnInit(): void {
    this.listarPedidos();
  }

  // Busca todos os pedidos cadastrados na API.
  listarPedidos(): void {
    this.carregando = true;
    this.erro = '';

    this.pedidoService.listarTodosPedidos().subscribe({
      next: (dados) => {
        this.pedidos = dados;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar os pedidos.';
        this.carregando = false;
      }
    });
  }

  // Atualiza o status de um pedido selecionado.
  atualizarStatus(pedido: Pedido, novoStatus: string): void {
    this.mensagem = '';
    this.erro = '';

    // Verifica se o novo status foi informado e se é diferente do atual.
    if (!novoStatus || novoStatus === pedido.status) {
      return;
    }

    // Envia o ID do pedido e o novo status para a API.
    this.pedidoService.atualizarStatusPedido(
      pedido.idPedido,
      novoStatus
    ).subscribe({
      next: (resposta) => {
        // Atualiza o status na tela após a confirmação da API.
        pedido.status = resposta.status;
        this.mensagem = `Status do pedido ${pedido.idPedido} atualizado com sucesso!`;
      },
      error: (erro) => {
        this.erro = erro.error?.mensagem ||
          'Não foi possível atualizar o status do pedido.';
      }
    });
  }
}
