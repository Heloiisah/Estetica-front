
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EntradaProduto, EntradaProdutoService } from '../services/entrada-produto.service';

@Component({
  selector: 'app-entrada-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './entrada-produtos.component.html',
  styleUrl: './entrada-produtos.component.css'
})
// Declara a classe do componente responsável pelo gerenciamento das entradas de produtos.
export class EntradaProdutosComponent implements OnInit {

  // Cria uma lista vazia que armazenará todas as entradas de produtos.
  entradas: EntradaProduto[] = [];

  // Armazena o ID do produto que será relacionado à entrada.
  idItem: number | null = null;

  // Armazena a data em que o produto entrou no estoque.
  dataEntradaProduto = '';

  // Armazena a quantidade de produtos que entraram no estoque.
  quantidadeEntrada: number | null = null;

  // Armazena a unidade de medida do produto, como kg, unidade ou litro.
  unidade = '';

  // Armazena o valor unitário do produto que entrou no estoque.
  valorUnitarioEntrada: number | null = null;

  // Armazena o ID utilizado para pesquisar uma entrada específica.
  idBusca: number | null = null;

  // Armazena o ID da entrada que está sendo editada.
  // Quando for null, significa que nenhuma entrada está sendo editada.
  idEdicao: number | null = null;

  // Armazena mensagens de sucesso que serão exibidas na tela.
  mensagem = '';

  // Armazena mensagens de erro que serão exibidas na tela.
  erro = '';

  // Controla se alguma operação de carregamento está acontecendo.
  // false significa que não está carregando.
  carregando = false;

  // Construtor do componente.
  // Injeta o serviço responsável por realizar as operações com a API.
  constructor(private entradaProdutoService: EntradaProdutoService) {}

  // Método executado automaticamente quando o componente é inicializado.
  ngOnInit(): void {

    // Chama o método responsável por carregar todas as entradas de produtos.
    this.listarEntradas();

  } // Final do método ngOnInit.

  // Método responsável por buscar todas as entradas cadastradas na API.
  listarEntradas(): void {

    // Informa que o carregamento dos dados foi iniciado.
    this.carregando = true;

    // Chama o método listarEntradas do serviço para buscar os registros na API.
    this.entradaProdutoService.listarEntradas().subscribe({

      // Executa quando a API retorna os dados com sucesso.
      next: (dados) => {

        // Armazena os dados recebidos da API na lista de entradas.
        this.entradas = dados;

        // Informa que o carregamento foi finalizado.
        this.carregando = false;

      }, // Final do bloco de sucesso.

      // Executa caso aconteça algum erro durante a requisição.
      error: (erro: unknown) => {

        // Exibe o erro no console do navegador para facilitar a identificação do problema.
        console.error(erro);

        // Define uma mensagem de erro para ser apresentada ao usuário.
        this.erro = 'Não foi possível carregar as entradas de produtos.';

        // Finaliza o estado de carregamento.
        this.carregando = false;

      } // Final do bloco de erro.

    }); // Final da inscrição no Observable.

  } // Final do método listarEntradas.

  // Método responsável por cadastrar uma nova entrada ou atualizar uma entrada existente.
  salvarEntrada(): void {

    // Limpa qualquer mensagem de sucesso que tenha sido exibida anteriormente.
    this.mensagem = '';

    // Limpa qualquer mensagem de erro anterior.
    this.erro = '';

    // Verifica se algum dos campos obrigatórios não foi preenchido.
    if (

      // Verifica se o ID do produto não foi informado.
      this.idItem === null ||

      // Verifica se a data de entrada está vazia.
      !this.dataEntradaProduto ||

      // Verifica se a quantidade não foi informada.
      this.quantidadeEntrada === null ||

      // Verifica se a unidade está vazia ou contém apenas espaços.
      !this.unidade.trim() ||

      // Verifica se o valor unitário não foi informado.
      this.valorUnitarioEntrada === null

    ) {

      // Define uma mensagem informando que todos os campos são obrigatórios.
      this.erro = 'Preencha todos os campos obrigatórios.';

      // Interrompe a execução do método para impedir o envio de dados incompletos.
      return;

    } // Final da validação dos campos obrigatórios.

    // Verifica se os valores informados são válidos e positivos.
    if (

      // Verifica se o ID do produto é menor ou igual a zero.
      this.idItem <= 0 ||

      // Verifica se a quantidade é menor ou igual a zero.
      this.quantidadeEntrada <= 0 ||

      // Verifica se o valor unitário é menor ou igual a zero.
      this.valorUnitarioEntrada <= 0 ||

      // Verifica se a unidade possui mais de 10 caracteres.
      this.unidade.trim().length > 10

    ) {

      // Exibe uma mensagem informando que os valores precisam ser corrigidos.
      this.erro = 'Confira os valores informados. A unidade deve ter até 10 caracteres.';

      // Interrompe a execução para impedir o envio de informações inválidas.
      return;

    } // Final da validação dos valores.

    // Cria um objeto contendo os dados que serão enviados para a API.
    // Partial permite que as propriedades de EntradaProduto sejam opcionais.
    const dados: Partial<EntradaProduto> = {

      // Informa o ID do produto relacionado à entrada.
      idItem: this.idItem,

      // Informa a data em que o produto entrou no estoque.
      dataEntradaProduto: this.dataEntradaProduto,

      // Informa a quantidade de produtos recebidos.
      quantidadeEntrada: this.quantidadeEntrada,

      // Informa a unidade de medida, removendo os espaços desnecessários.
      unidade: this.unidade.trim(),

      // Informa o valor unitário do produto.
      valorUnitarioEntrada: this.valorUnitarioEntrada

    }; // Final da criação do objeto dados.

    // Verifica se existe um ID de edição.
    // Se existir, significa que o usuário deseja atualizar uma entrada.
    if (this.idEdicao !== null) {

      // Armazena o ID da entrada que será atualizada.
      const id = this.idEdicao;

      // Chama o método editarEntrada do serviço, enviando o ID e os novos dados.
      this.entradaProdutoService.editarEntrada(id, dados).subscribe({

        // Executa quando a atualização é realizada com sucesso.
        next: () => {

          // Exibe uma mensagem confirmando que a entrada foi atualizada.
          this.mensagem = 'Entrada atualizada com sucesso!';

          // Limpa os campos do formulário e remove o ID de edição.
          this.limparFormulario();

          // Atualiza a lista para mostrar os dados modificados.
          this.listarEntradas();

        }, // Final do bloco de sucesso.

        // Executa caso aconteça algum erro durante a atualização.
        error: (erro: unknown) => {

          // Exibe o erro no console do navegador.
          console.error(erro);

          // Exibe uma mensagem informando que a atualização não foi realizada.
          this.erro = 'Não foi possível atualizar a entrada. Verifique os dados informados.';

        } // Final do bloco de erro.

      }); // Final da inscrição no Observable de edição.

    } else {

      // Caso não exista um ID de edição, significa que será realizado um novo cadastro.

      // Chama o método cadastrarEntrada do serviço, enviando os dados para a API.
      this.entradaProdutoService.cadastrarEntrada(dados).subscribe({

        // Executa quando o cadastro é realizado com sucesso.
        next: () => {

          // Exibe uma mensagem confirmando o registro da entrada.
          this.mensagem = 'Entrada registrada com sucesso!';

          // Limpa todos os campos do formulário.
          this.limparFormulario();

          // Atualiza a lista de entradas para exibir o novo registro.
          this.listarEntradas();

        }, // Final do bloco de sucesso.

        // Executa caso aconteça algum erro durante o cadastro.
        error: (erro: unknown) => {

          // Exibe o erro no console do navegador.
          console.error(erro);

          // Exibe uma mensagem informando que o cadastro não foi realizado.
          this.erro = 'Não foi possível registrar a entrada. Verifique se o produto possui estoque cadastrado.';

        } // Final do bloco de erro.

      }); // Final da inscrição no Observable de cadastro.

    } // Final da condição que diferencia cadastro e edição.

  } // Final do método salvarEntrada.

  // Método responsável por consultar uma entrada específica pelo seu ID.
  consultarPorId(): void {

    // Limpa a mensagem de sucesso anterior.
    this.mensagem = '';

    // Limpa a mensagem de erro anterior.
    this.erro = '';

    // Verifica se o ID informado é inválido.
    if (this.idBusca === null || this.idBusca <= 0) {

      // Exibe uma mensagem solicitando um ID válido.
      this.erro = 'Informe um ID de entrada válido.';

      // Interrompe a execução caso o ID seja inválido.
      return;

    } // Final da validação do ID.

    // Chama o método consultarEntrada do serviço, enviando o ID informado.
    this.entradaProdutoService.consultarEntrada(this.idBusca).subscribe({

      // Executa quando a entrada é encontrada na API.
      next: (entrada) => {

        // Substitui a lista atual por uma lista contendo somente a entrada encontrada.
        this.entradas = [entrada];

        // Exibe uma mensagem confirmando que a entrada foi localizada.
        this.mensagem = 'Entrada encontrada.';

      }, // Final do bloco de sucesso.

      // Executa caso a entrada não seja encontrada ou aconteça algum erro.
      error: (erro: unknown) => {

        // Exibe o erro no console do navegador.
        console.error(erro);

        // Exibe uma mensagem informando que a entrada não foi encontrada.
        this.erro = 'Entrada não encontrada.';

      } // Final do bloco de erro.

    }); // Final da inscrição no Observable de consulta.

  } // Final do método consultarPorId.

  // Método responsável por carregar os dados de uma entrada no formulário para edição.
  editar(entrada: EntradaProduto): void {

    // Armazena o ID da entrada selecionada para identificar qual registro será atualizado.
    this.idEdicao = entrada.idEntradaProduto;

    // Preenche o campo ID do produto com o valor da entrada selecionada.
    this.idItem = entrada.idItem;

    // Preenche a data da entrada.
    // O substring(0, 10) pega somente os primeiros 10 caracteres da data.
    // Isso permite utilizar a data no formato esperado pelo input date do HTML.
    this.dataEntradaProduto = entrada.dataEntradaProduto.substring(0, 10);

    // Preenche o campo de quantidade com a quantidade já cadastrada.
    this.quantidadeEntrada = entrada.quantidadeEntrada;

    // Preenche o campo de unidade com a unidade já cadastrada.
    this.unidade = entrada.unidade;

    // Preenche o campo de valor unitário com o valor já cadastrado.
    this.valorUnitarioEntrada = entrada.valorUnitarioEntrada;

    // Limpa qualquer mensagem de sucesso anterior.
    this.mensagem = '';

    // Limpa qualquer mensagem de erro anterior.
    this.erro = '';

  } // Final do método editar.

  // Método responsável por excluir uma entrada de produto.
  excluir(id: number): void {

    // Abre uma caixa de confirmação perguntando se o usuário deseja excluir a entrada.
    if (!confirm('Deseja realmente excluir esta entrada?')) {

      // Caso o usuário clique em cancelar, interrompe a execução do método.
      return;

    } // Final da confirmação de exclusão.

    // Limpa a mensagem de sucesso anterior.
    this.mensagem = '';

    // Limpa a mensagem de erro anterior.
    this.erro = '';

    // Chama o método excluirEntrada do serviço, enviando o ID da entrada que será excluída.
    this.entradaProdutoService.excluirEntrada(id).subscribe({

      // Executa quando a exclusão é realizada com sucesso.
      next: () => {

        // Exibe uma mensagem confirmando que a entrada foi excluída.
        this.mensagem = 'Entrada excluída com sucesso!';

        // Atualiza a lista para remover da tela o registro excluído.
        this.listarEntradas();

      }, // Final do bloco de sucesso.

      // Executa caso aconteça algum erro durante a exclusão.
      error: (erro: unknown) => {

        // Exibe o erro no console do navegador.
        console.error(erro);

        // Exibe uma mensagem informando que não foi possível excluir a entrada.
        this.erro = 'Não foi possível excluir a entrada ou atualizar o estoque.';

      } // Final do bloco de erro.

    }); // Final da inscrição no Observable de exclusão.

  } // Final do método excluir.

  // Método responsável por limpar os campos do formulário.
  limparFormulario(): void {

    // Limpa o ID do produto.
    this.idItem = null;

    // Limpa a data de entrada.
    this.dataEntradaProduto = '';

    // Limpa a quantidade de entrada.
    this.quantidadeEntrada = null;

    // Limpa a unidade de medida.
    this.unidade = '';

    // Limpa o valor unitário.
    this.valorUnitarioEntrada = null;

    // Remove o ID de edição.
    // Dessa forma, o próximo salvamento será interpretado como um novo cadastro.
    this.idEdicao = null;

  } // Final do método limparFormulario.

  // Método responsável por cancelar uma edição em andamento.
  cancelarEdicao(): void {

    // Limpa os campos do formulário e remove o ID da entrada que estava sendo editada.
    this.limparFormulario();

    // Limpa a mensagem de sucesso.
    this.mensagem = '';

    // Limpa a mensagem de erro.
    this.erro = '';

  } // Final do método cancelarEdicao.

  // Método responsável por limpar a pesquisa e voltar a exibir todas as entradas cadastradas.
  voltarLista(): void {

    // Limpa o ID utilizado na pesquisa.
    this.idBusca = null;

    // Limpa a mensagem de sucesso.
    this.mensagem = '';

    // Limpa a mensagem de erro.
    this.erro = '';

    // Busca novamente todas as entradas cadastradas na API.
    this.listarEntradas();

  } 

} 