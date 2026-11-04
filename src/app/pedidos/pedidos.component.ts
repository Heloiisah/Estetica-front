
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../services/pedido.service';
import { HttpClient } from '@angular/common/http';

// Define os dados de cada item que faz parte de um pedido.
interface ItemPedido {
  idPedidoItem: number;
  idItem: number;
  item?: string;
  idFuncionario?: number;
  funcionario?: string;
  cargo?: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
}

// Define a estrutura dos dados de um pedido.
interface Pedido {
  idPedido: number;
  idPessoa: number;
  cliente?: string;
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
  funcionarios: any[] = [];
  carregando = false;
  busca = 0;
  statusFiltro = '';
  mensagem = '';
  erro = '';

  // Lista os status disponíveis para os pedidos.
  statusPermitidos = [
    'Aberto',
    'Em processamento',
    'Concluído',
    'Cancelado'
  ];

  constructor(private pedidoService: PedidoService, private http: HttpClient) {}

  // Executa quando a página é inicializada.
  ngOnInit(): void {
    this.listarPedidos();
    this.http.get<any[]>('http://localhost:5206/api/Funcionario').subscribe({
      next: dados => this.funcionarios = dados.filter(f => f.pessoa?.ativoPessoa === 'S'),
      error: () => this.erro = 'Não foi possível carregar os funcionários.'
    });
  }

  atribuirFuncionario(pedido: Pedido, item: ItemPedido, idFuncionario: number): void {
    if (!idFuncionario) return;
    this.pedidoService.atribuirFuncionario(pedido.idPedido, item.idPedidoItem, Number(idFuncionario)).subscribe({
      next: () => {
        const funcionario = this.funcionarios.find(f => f.idPessoa === Number(idFuncionario));
        item.idFuncionario = Number(idFuncionario);
        item.funcionario = funcionario?.pessoa?.nome;
        item.cargo = funcionario?.cargo;
        this.mensagem = 'Funcionário atribuído ao pedido.';
      },
      error: () => this.erro = 'Não foi possível atribuir o funcionário.'
    });
  }

  // Busca todos os pedidos cadastrados na API.
  listarPedidos(): void {
    this.carregando = true;
    this.erro = '';

    this.pedidoService.listarTodosPedidos(this.statusFiltro).subscribe({
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

  consultarPorId(): void {
    if (this.busca < 1) { this.erro = 'Informe um ID válido.'; return; }
    this.pedidoService.consultarPedido(this.busca).subscribe({
      next: pedido => { this.pedidos = [pedido]; this.erro = ''; },
      error: () => this.erro = 'Pedido não encontrado.'
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
