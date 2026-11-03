
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
// Serviço responsável pela comunicação com a API de pedidos.
export class PedidoService {

  // Endereço da API responsável pelos pedidos.
  private apiUrl = 'https://localhost:7299/api/Pedido';

  constructor(private http: HttpClient) {}

  // Envia os dados para criar um novo pedido.
  criarPedido(pedido: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, pedido);
  }

  // Busca todos os pedidos cadastrados no sistema.
  listarTodosPedidos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Busca os pedidos realizados por um cliente específico.
  listarPedidosPorCliente(idpessoa: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cliente/${idpessoa}`);
  }

  // Atualiza o status de um pedido pelo seu ID.
  atualizarStatusPedido(id: number, status: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      JSON.stringify(status),
      {
        // Define o formato dos dados enviados para a API.
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
