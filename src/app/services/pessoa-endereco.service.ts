
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
// Serviço responsável pela comunicação com a API de pessoas e endereços.
export class PessoaEnderecoService {

  // Endereço da API responsável pelos dados dos clientes.
  private apiUrl = 'http://localhost:5206/api/PessoaEndereco';

  constructor(private http: HttpClient) {}

  // Envia os dados para cadastrar uma nova pessoa e seu endereço.
  cadastrarPessoa(dados: any): Observable<any> {
    return this.http.post(this.apiUrl, dados, { withCredentials: true });
  }

  // Busca todas as pessoas cadastradas no sistema.
  listarPessoas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Consulta uma pessoa específica utilizando seu ID.
  consultarPessoaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  editarPessoa(id: number, dados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dados);
  }
}
