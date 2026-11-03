
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define a estrutura dos dados de um serviço.
export interface ItemServico {
  idItem: number;
  idCategoria: number;
  item: string;
  descricaoItem: string;
  preco: number;
  tipoItem: string;
  ativoProdutoServico: string;
}

@Injectable({
  providedIn: 'root'
})
// Serviço responsável pela comunicação com a API de serviços.
export class ItemServicoService {

  // Endereço da API responsável pelos serviços.
  private apiUrl = 'https://localhost:7299/api/ItemServico';

  constructor(private http: HttpClient) {}

  // Busca todos os serviços cadastrados.
  listarServicos(): Observable<ItemServico[]> {
    return this.http.get<ItemServico[]>(this.apiUrl);
  }

  // Consulta um serviço específico pelo ID.
  consultarServico(id: number): Observable<ItemServico> {
    return this.http.get<ItemServico>(`${this.apiUrl}/${id}`);
  }

  // Envia os dados para cadastrar um novo serviço.
  cadastrarServico(dados: Partial<ItemServico>): Observable<ItemServico> {
    return this.http.post<ItemServico>(this.apiUrl, dados);
  }

  // Atualiza os dados de um serviço existente.
  editarServico(id: number, dados: Partial<ItemServico>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dados);
  }

  // Exclui um serviço utilizando seu ID.
  excluirServico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
