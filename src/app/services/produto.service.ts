
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define a estrutura dos dados de um produto.
export interface Produto {
  idItem: number;
  idcategoria: number;
  item: string;
  descricaoItem: string;
  precoItem: number;
  tipoItem: string;
  ativoProdutoServico: string;
  codigoPreco: string;
  precoVenda: number;
  unidade: string;
}

@Injectable({
  providedIn: 'root'
})
// Serviço responsável pela comunicação com a API de produtos.
export class ProdutoService {

  // Endereço da API responsável pelos produtos.
  private apiUrl = `http://${window.location.hostname}:5206/api/ProdutoItem`;

  constructor(private http: HttpClient) {}

  // Busca todos os produtos cadastrados.
  listarProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl);
  }

  // Consulta um produto específico pelo ID.
  consultarProduto(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/${id}`);
  }

  // Envia os dados para cadastrar um novo produto.
  cadastrarProduto(dados: Partial<Produto>): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, dados);
  }

  // Atualiza os dados de um produto existente.
  editarProduto(id: number, dados: Partial<Produto>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dados);
  }

  // Exclui um produto utilizando seu ID.
  desativarProduto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
