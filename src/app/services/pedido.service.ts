
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
// Serviço responsável pela comunicação com a API de pedidos.
export class PedidoService {

  // Endereço da API responsável pelos pedidos.
  private apiUrl = 'http://localhost:5206/api/Pedido';

  constructor(private http: HttpClient) {}

  // Envia os dados para criar um novo pedido.
  criarPedido(pedido: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, pedido, { withCredentials: true });
  }

  identificarCliente(cpf: number, email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/identificar`, { cpf, email }, { withCredentials: true });
  }

  // Busca todos os pedidos cadastrados no sistema.
  listarTodosPedidos(status = ''): Observable<any[]> {
    const filtro = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.http.get<any[]>(this.apiUrl + filtro);
  }

  consultarPedido(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  atribuirFuncionario(idPedido: number, idPedidoItem: number, idFuncionario: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idPedido}/funcionario`, { idPedidoItem, idFuncionario });
  }

  // Busca os pedidos realizados por um cliente específico.
  listarPedidosPorCliente(idpessoa: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cliente/${idpessoa}`, { withCredentials: true });
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
