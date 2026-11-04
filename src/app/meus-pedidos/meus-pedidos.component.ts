import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../services/pedido.service';

@Component({
  selector: 'app-meus-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './meus-pedidos.component.html',
  styleUrl: './meus-pedidos.component.css'
})
export class MeusPedidosComponent implements OnInit {
  pedidos: any[] = [];
  mensagem = '';
  identificacaoNecessaria = false;
  cpf = '';
  email = '';

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {
    const id = Number(localStorage.getItem('idpessoa'));

    if (!id) {
      this.identificacaoNecessaria = true;
      return;
    }

    this.carregarPedidos(id);
  }

  carregarPedidos(id: number): void {
    this.pedidoService.listarPedidosPorCliente(id).subscribe({
      next: dados => {
        this.pedidos = dados;
        this.mensagem = dados.length ? '' : 'Você ainda não tem pedidos.';
      },
      error: erro => {
        this.mensagem = erro.status === 401
          ? 'Identifique-se para consultar seus pedidos.'
          : 'Não foi possível consultar seus pedidos.';
        this.identificacaoNecessaria = erro.status === 401;
      }
    });
  }

  identificar(): void {
    const cpf = this.cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || !this.email.includes('@')) {
      this.mensagem = 'Informe CPF e e-mail válidos.';
      return;
    }

    this.pedidoService.identificarCliente(Number(cpf), this.email.trim()).subscribe({
      next: dados => {
        localStorage.setItem('idpessoa', String(dados.idPessoa));
        this.identificacaoNecessaria = false;
        this.mensagem = '';
        this.carregarPedidos(dados.idPessoa);
      },
      error: () => this.mensagem = 'CPF e e-mail não conferem.'
    });
  }
}
