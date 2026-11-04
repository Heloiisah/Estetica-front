
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-painel-administrativo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './painel-administrativo.component.html',
  styleUrl: './painel-administrativo.component.css'
})
export class PainelAdministrativoComponent implements OnInit {
  resumo = { clientes: 0, produtos: 0, servicos: 0, pedidos: 0, estoque: 0 };
  aviso = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const api = `http://${window.location.hostname}:5206/api/`;
    this.http.get<any[]>(api + 'PessoaEndereco').subscribe({next: dados => this.resumo.clientes = dados.length, error: () => this.aviso = 'Alguns dados do painel não puderam ser carregados.'});
    this.http.get<any[]>(api + 'ProdutoItem').subscribe({next: dados => this.resumo.produtos = dados.length, error: () => this.aviso = 'Alguns dados do painel não puderam ser carregados.'});
    this.http.get<any[]>(api + 'ItemServico').subscribe({next: dados => this.resumo.servicos = dados.length, error: () => this.aviso = 'Alguns dados do painel não puderam ser carregados.'});
    this.http.get<any[]>(api + 'Pedido').subscribe({next: dados => this.resumo.pedidos = dados.length, error: () => this.aviso = 'Alguns dados do painel não puderam ser carregados.'});
    this.http.get<any[]>(api + 'Estoque').subscribe({next: dados => this.resumo.estoque = dados.reduce((total, item) => total + Number(item.quantidadeEstoque || 0), 0), error: () => this.aviso = 'Alguns dados do painel não puderam ser carregados.'});
  }
  opcoes = [
    {
      titulo: 'Início',
      descricao: 'Voltar para a página inicial da loja.',
      rota: '/inicio'
    },
    {
      titulo: 'Clientes',
      descricao: 'Consultar os clientes cadastrados.',
      rota: '/clientes'
    },
    { titulo: 'Funcionários', descricao: 'Cadastrar e consultar funcionários.', rota: '/funcionarios' },
    { titulo: 'Atendimentos', descricao: 'Registrar e consultar atendimentos.', rota: '/atendimentos' },
    {
      titulo: 'Categorias',
      descricao: 'Organizar as categorias dos itens.',
      rota: '/categorias'
    },
    {
      titulo: 'Produtos',
      descricao: 'Cadastrar e consultar produtos.',
      rota: '/gerenciamento-produtos'
    },
    {
      titulo: 'Serviços',
      descricao: 'Cadastrar e consultar serviços.',
      rota: '/gerenciamento-servicos'
    },
    {
      titulo: 'Pedidos',
      descricao: 'Consultar pedidos e acompanhar seus status.',
      rota: '/pedidos'
    },
    {
      titulo: 'Entrada de produtos',
      descricao: 'Registrar a entrada de produtos no estoque.',
      rota: '/entrada-produtos'
    },
    {
      titulo: 'Estoque',
      descricao: 'Consultar quantidades e disponibilidade dos itens.',
      rota: '/estoque'
    }
  ];
}
