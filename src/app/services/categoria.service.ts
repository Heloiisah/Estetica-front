
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define a estrutura dos dados de uma categoria.
export interface Categoria {
  idcategoria: number;
  categoria: string;
  items?: any[];
}

@Injectable({
  providedIn: 'root'
})
// Serviço responsável por realizar as operações de categorias na API.
export class CategoriaService {

  // Endereço da API responsável pelas categorias.
  private apiUrl = `http://${window.location.hostname}:5206/api/Categorium`;

  constructor(private http: HttpClient) {}

  // Busca todas as categorias cadastradas.
  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  // Consulta uma categoria específica pelo ID.
  consultarCategoria(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  // Envia os dados para cadastrar uma nova categoria.
  cadastrarCategoria(dados: { categoria: string }): Observable<any> {
    return this.http.post(this.apiUrl, dados);
  }

  // Atualiza os dados de uma categoria existente.
  editarCategoria(id: number, dados: { categoria: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dados);
  }

  // Exclui uma categoria utilizando seu ID.
  excluirCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
