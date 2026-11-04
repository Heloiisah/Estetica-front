
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define a estrutura dos dados de uma entrada de produto.
export interface EntradaProduto {
  idEntradaProduto: number;
  idItem: number;
  dataEntradaProduto: string;
  quantidadeEntrada: number;
  unidade: string;
  valorUnitarioEntrada: number;
  quantidadeEstoque: number;
}

@Injectable({
  providedIn: 'root'
})
// Serviço responsável pela comunicação com a API de entrada de produtos.
export class EntradaProdutoService {

  // Endereço da API responsável pelas entradas de produtos.
  private apiUrl = `http://${window.location.hostname}:5206/api/EntradaProduto`;

  constructor(private http: HttpClient) {}

  // Busca todas as entradas de produtos cadastradas.
  listarEntradas(): Observable<EntradaProduto[]> {
    return this.http.get<EntradaProduto[]>(this.apiUrl);
  }

  // Consulta uma entrada específica pelo ID.
  consultarEntrada(id: number): Observable<EntradaProduto> {
    return this.http.get<EntradaProduto>(`${this.apiUrl}/${id}`);
  }

  // Envia os dados para registrar uma nova entrada de produto.
  cadastrarEntrada(dados: Partial<EntradaProduto>): Observable<EntradaProduto> {
    return this.http.post<EntradaProduto>(this.apiUrl, dados);
  }

  // Atualiza os dados de uma entrada existente.
  editarEntrada(id: number, dados: Partial<EntradaProduto>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dados);
  }

  // Exclui uma entrada utilizando seu ID.
  excluirEntrada(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
