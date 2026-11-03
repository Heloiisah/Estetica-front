
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
// Componente responsável pelo cadastro de clientes.
export class CadastroComponent {

  // Armazena os dados pessoais e de endereço do cliente.
  cliente = {
    nome: '',
    cpf: '',
    dataNascimento: '',
    sexo: '',
    email: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  };

  // Controla a mensagem exibida e o ID do cliente cadastrado.
  mensagemCliente = '';
  idPessoaCadastrada: number | null = null;

  constructor(private pessoaEnderecoService: PessoaEnderecoService) {}

  // Realiza o cadastro do cliente após validar os dados informados.
  cadastrarCliente(): void {
    this.mensagemCliente = '';

    // Verifica se os campos obrigatórios foram preenchidos.
    const camposObrigatorios = [
      this.cliente.nome,
      this.cliente.cpf,
      this.cliente.dataNascimento,
      this.cliente.sexo,
      this.cliente.email,
      this.cliente.telefone,
      this.cliente.cep,
      this.cliente.numero
    ];

    if (camposObrigatorios.some(campo => !String(campo).trim())) {
      this.mensagemCliente = 'Preencha todos os campos obrigatórios.';
      return;
    }

    // Remove caracteres especiais do CPF e telefone e converte para número.
    const cpf = Number(this.cliente.cpf.replace(/\D/g, ''));
    const telefone = Number(this.cliente.telefone.replace(/\D/g, ''));

    // Verifica se CPF e telefone possuem valores numéricos válidos.
    if (!Number.isSafeInteger(cpf) || !Number.isSafeInteger(telefone)) {
      this.mensagemCliente = 'Confira o CPF e o telefone informados.';
      return;
    }

    // Organiza os dados que serão enviados para a API.
    const dados = {
      nome: this.cliente.nome.trim(),
      cpf,
      dataNascimento: this.cliente.dataNascimento,
      sexo: this.cliente.sexo,
      email: this.cliente.email.trim(),
      telefone,
      ativoPessoa: 'S',
      enderecos: [
        {
          cep: this.cliente.cep.replace(/\D/g, ''),
          numero: this.cliente.numero.trim(),
          complemento: this.cliente.complemento.trim()
        }
      ]
    };

    // Envia os dados para cadastrar o cliente na API.
    this.pessoaEnderecoService.cadastrarPessoa(dados).subscribe({
      next: (resposta) => {

        // Recupera o ID do cliente retornado pela API.
        const id = Number(resposta?.idpessoa ?? resposta?.idPessoa);

        this.idPessoaCadastrada =
          Number.isInteger(id) && id > 0 ? id : null;

        // Armazena o ID do cliente no navegador.
        if (this.idPessoaCadastrada !== null) {
          localStorage.setItem(
            'idpessoa',
            String(this.idPessoaCadastrada)
          );
        }

        // Limpa os campos após o cadastro.
        this.limparCliente();

        // Exibe a mensagem de sucesso.
        this.mensagemCliente = this.idPessoaCadastrada !== null
          ? `Cadastro realizado com sucesso! Código do cliente: ${this.idPessoaCadastrada}`
          : 'Cadastro realizado com sucesso!';
      },
      error: erro => {
        // Exibe os detalhes caso ocorra algum erro no cadastro.
        console.error('Erro ao cadastrar cliente:', erro);
        console.error('Detalhes retornados pela API:', erro.error);

        this.mensagemCliente =
          typeof erro.error === 'string'
            ? erro.error
            : erro.error?.message ||
              'Não foi possível realizar o cadastro. Confira o terminal da API.';
      }
    });
  }

  // Limpa todos os campos do formulário de cadastro.
  limparCliente(): void {
    this.cliente = {
      nome: '',
      cpf: '',
      dataNascimento: '',
      sexo: '',
      email: '',
      telefone: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: ''
    };

    this.mensagemCliente = '';
  }
}
