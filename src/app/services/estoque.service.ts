
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define a estrutura dos dados do estoque.
export interface Estoque {
  idItem: number;
  quantidadeEstoque: number;
}

@Injectable({
  providedIn: 'root'
})
// Serviço responsável pela comunicação com a API de estoque.
export class EstoqueService {

  // Endereço da API responsável pelo estoque.
  private apiUrl = 'https://localhost:7299/api/Estoque';

  constructor(private http: HttpClient) {}

  // Busca todos os registros de estoque cadastrados.
  listarEstoques(): Observable<Estoque[]> {
    return this.http.get<Estoque[]>(this.apiUrl);
  }
}
