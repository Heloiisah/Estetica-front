
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Estoque, EstoqueService } from '../services/estoque.service';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './estoque.component.html',
  styleUrl: './estoque.component.css'
})
export class EstoqueComponent implements OnInit {

  // Armazena a lista de estoques e controla as mensagens da tela.
  estoques: Estoque[] = [];
  mensagem = '';
  erro = '';
  carregando = false;

  constructor(private estoqueService: EstoqueService) {}

  // Executa quando a página é inicializada.
  ngOnInit(): void {
    this.listarEstoques();
  }

  // Busca todos os registros de estoque na API.
  listarEstoques(): void {
    this.carregando = true;
    this.mensagem = '';
    this.erro = '';

    this.estoqueService.listarEstoques().subscribe({
      // Executa quando a consulta é realizada com sucesso.
      next: (dados) => {
        this.estoques = dados;
        this.carregando = false;
      },

      // Executa caso ocorra algum erro na requisição.
      error: (erro: unknown) => {
        console.error(erro);
        this.erro = 'Não foi possível carregar os dados do estoque.';
        this.carregando = false;
      }
    });
  }
}
