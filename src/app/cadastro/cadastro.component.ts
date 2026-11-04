
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PessoaEnderecoService } from '../services/pessoa-endereco.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
// Cria a classe responsável pelas funcionalidades do cadastro de clientes.
export class CadastroComponent {

  // Cria um objeto para armazenar os dados pessoais e de endereço do cliente.
  cliente = {

    // Armazena o nome completo do cliente.
    nome: '',

    // Armazena o CPF informado no formulário.
    cpf: '',

    // Armazena a data de nascimento do cliente.
    dataNascimento: '',

    // Armazena o sexo selecionado pelo cliente.
    sexo: '',

    // Armazena o endereço de e-mail do cliente.
    email: '',

    // Armazena o número de telefone do cliente.
    telefone: '',

    // Armazena o CEP do endereço do cliente.
    cep: '',

    // Armazena o nome da rua ou avenida.
    logradouro: '',

    // Armazena o número da residência.
    numero: '',

    // Armazena informações adicionais do endereço.
    complemento: '',

    // Armazena o bairro do cliente.
    bairro: '',

    // Armazena a cidade do cliente.
    cidade: '',

    // Armazena a sigla do estado.
    uf: ''
  };

  // Armazena as mensagens de sucesso ou erro exibidas na tela.
  mensagemCliente = '';

  // Armazena o código identificador da pessoa cadastrada.
  // O valor pode ser um número ou null quando ainda não existe cadastro.
  idPessoaCadastrada: number | null = null;

  // Injeta o serviço PessoaEnderecoService para permitir a comunicação com a API.
  constructor(private pessoaEnderecoService: PessoaEnderecoService) {}

  // Método responsável por realizar o cadastro do cliente.
  cadastrarCliente(): void {

    // Limpa qualquer mensagem anterior antes de iniciar um novo cadastro.
    this.mensagemCliente = '';

    // Cria uma lista com os campos obrigatórios que precisam ser preenchidos.
    const camposObrigatorios = [

      // Verifica se o nome foi informado.
      this.cliente.nome,

      // Verifica se o CPF foi informado.
      this.cliente.cpf,

      // Verifica se a data de nascimento foi informada.
      this.cliente.dataNascimento,

      // Verifica se o sexo foi selecionado.
      this.cliente.sexo,

      // Verifica se o e-mail foi informado.
      this.cliente.email,

      // Verifica se o telefone foi informado.
      this.cliente.telefone,

      // Verifica se o CEP foi informado.
      this.cliente.cep,

      // Verifica se o número da residência foi informado.
      this.cliente.numero
    ];

    // Verifica se algum dos campos obrigatórios está vazio.
    if (camposObrigatorios.some(campo => !String(campo).trim())) {

      // Exibe uma mensagem solicitando o preenchimento dos campos obrigatórios.
      this.mensagemCliente = 'Preencha todos os campos obrigatórios.';

      // Interrompe a execução para não enviar dados incompletos.
      return;
    }

    if (!/^\d{11}$/.test(this.cliente.cpf.replace(/\D/g, '')) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.cliente.email.trim()) ||
        !/^\d{8}$/.test(this.cliente.cep.replace(/\D/g, ''))) {
      this.mensagemCliente = 'Confira CPF, e-mail e CEP informados.';
      return;
    }

    // Remove os caracteres especiais do CPF e converte o resultado para número.
    const cpf = Number(this.cliente.cpf.replace(/\D/g, ''));

    // Remove os caracteres especiais do telefone e converte o resultado para número.
    const telefone = Number(this.cliente.telefone.replace(/\D/g, ''));

    // Verifica se CPF e telefone são números inteiros seguros.
    if (!Number.isSafeInteger(cpf) || !Number.isSafeInteger(telefone)) {

      // Exibe uma mensagem caso os dados numéricos sejam inválidos.
      this.mensagemCliente = 'Confira o CPF e o telefone informados.';

      // Interrompe a execução para evitar o envio de dados inválidos.
      return;
    }

    // Cria o objeto com os dados organizados que serão enviados para a API.
    const dados = {

      // Remove espaços desnecessários do início e do final do nome.
      nome: this.cliente.nome.trim(),

      // Envia o CPF convertido para número.
      cpf,

      // Mantém os 11 dígitos para validar CPF iniciado em zero.
      cpfTexto: this.cliente.cpf.replace(/\D/g, ''),

      // Envia a data de nascimento informada no formulário.
      dataNascimento: this.cliente.dataNascimento,

      // Envia o sexo selecionado pelo cliente.
      sexo: this.cliente.sexo,

      // Remove espaços desnecessários do e-mail.
      email: this.cliente.email.trim(),

      // Envia o telefone convertido para número.
      telefone,

      // Define a pessoa como ativa no sistema.
      ativoPessoa: 'S',

      // Cria uma lista contendo os endereços vinculados à pessoa.
      enderecos: [

        // Cria o objeto com as informações do endereço do cliente.
        {

          // Remove os caracteres especiais do CEP, mantendo somente os números.
          cep: this.cliente.cep.replace(/\D/g, ''),

          // Remove espaços desnecessários do número da residência.
          numero: this.cliente.numero.trim(),

          // Remove espaços desnecessários do complemento.
          complemento: this.cliente.complemento.trim()
        }
      ]
    };

    // Chama o serviço responsável por enviar os dados do cliente para a API.
    this.pessoaEnderecoService.cadastrarPessoa(dados).subscribe({

      // Executa esta função quando a API retorna uma resposta de sucesso.
      next: (resposta) => {

        // Recupera o identificador da pessoa retornado pela API.
        // Primeiro verifica idpessoa e, caso não exista, utiliza idPessoa.
        const id = Number(resposta?.idpessoa ?? resposta?.idPessoa);

        // Verifica se o ID é um número inteiro positivo.
        // Caso seja válido, armazena o ID; caso contrário, define null.
        this.idPessoaCadastrada =
          Number.isInteger(id) && id > 0 ? id : null;

        // Verifica se o cadastro retornou um ID válido.
        if (this.idPessoaCadastrada !== null) {

          // Salva o ID da pessoa no armazenamento local do navegador.
          localStorage.setItem(

            // Define o nome da chave utilizada para armazenar o ID.
            'idpessoa',

            // Converte o ID para texto antes de armazenar.
            String(this.idPessoaCadastrada)
          );
        }

        // Chama o método responsável por limpar os campos do formulário.
        this.limparCliente();

        // Verifica se o ID foi retornado para montar a mensagem de sucesso.
        this.mensagemCliente = this.idPessoaCadastrada !== null

          // Exibe a mensagem de sucesso acompanhada do código do cliente.
          ? `Cadastro realizado com sucesso! Código do cliente: ${this.idPessoaCadastrada}`

          // Exibe uma mensagem de sucesso caso o ID não tenha sido retornado.
          : 'Cadastro realizado com sucesso!';
      },

      // Executa esta função quando ocorre algum erro na comunicação com a API.
      error: erro => {

        // Exibe no console do navegador o erro completo recebido.
        console.error('Erro ao cadastrar cliente:', erro);

        // Exibe os detalhes retornados pelo servidor da API.
        console.error('Detalhes retornados pela API:', erro.error);

        // Verifica se o erro retornado é um texto ou um objeto.
        this.mensagemCliente =
          typeof erro.error === 'string'

            // Se for texto, utiliza diretamente a mensagem retornada pela API.
            ? erro.error

            // Se for objeto, tenta utilizar a propriedade message.
            : erro.error?.message ||

              // Caso não exista uma mensagem específica, apresenta uma mensagem padrão.
              'Não foi possível realizar o cadastro. Confira o terminal da API.';
      }
    });
  }

  // Método responsável por limpar os campos do formulário de cadastro.
  limparCliente(): void {

    // Reinicializa o objeto cliente, deixando todos os campos vazios.
    this.cliente = {

      // Limpa o nome do cliente.
      nome: '',

      // Limpa o CPF.
      cpf: '',

      // Limpa a data de nascimento.
      dataNascimento: '',

      // Limpa o sexo selecionado.
      sexo: '',

      // Limpa o e-mail.
      email: '',

      // Limpa o telefone.
      telefone: '',

      // Limpa o CEP.
      cep: '',

      // Limpa o logradouro.
      logradouro: '',

      // Limpa o número da residência.
      numero: '',

      // Limpa o complemento.
      complemento: '',

      // Limpa o bairro.
      bairro: '',

      // Limpa a cidade.
      cidade: '',

      // Limpa o estado.
      uf: ''
    };

    // Limpa a mensagem exibida na tela.
    this.mensagemCliente = '';
  }
}
