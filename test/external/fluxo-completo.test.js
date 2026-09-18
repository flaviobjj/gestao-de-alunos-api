import { expect } from 'chai';
import { readFileSync } from 'node:fs';
import { api } from '../helpers/api.js';
import { loginAdmin, loginAluno } from '../helpers/auth.js';

const dados = JSON.parse(
  readFileSync(new URL('../fixtures/dados.json', import.meta.url))
);

describe('Fluxo completo de entrega de trabalho', function () {
  this.timeout(15000);

  let tokenAdmin;
  let tokenAluno;
  let alunoId;
  let disciplinaId;

  const sufixo = Date.now();
  const emailAluno =
    `${dados.novoAluno.emailBase}.${sufixo}${dados.novoAluno.dominio}`;
  const matricula = `${dados.novoAluno.matriculaBase}${sufixo}`;

  it('deve realizar login como administrador', async () => {
    tokenAdmin = await loginAdmin();

    expect(tokenAdmin).to.be.a('string').and.not.empty;
  });

  it('deve cadastrar um aluno como administrador', async () => {
    const resposta = await api()
      .post('/api/admin/alunos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: dados.novoAluno.nome,
        email: emailAluno,
        senha: dados.novoAluno.senha,
        matricula
      });

    expect(resposta.status).to.equal(201);
    expect(resposta.body).to.have.property('id');

    alunoId = resposta.body.id;
  });

  it('deve obter uma disciplina cadastrada', async () => {
    const resposta = await api()
      .get('/api/admin/disciplinas')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(resposta.status).to.equal(200);
    expect(resposta.body).to.be.an('array').and.not.empty;

    disciplinaId = resposta.body[0].id;
  });

  it('deve realizar login como o aluno cadastrado', async () => {
    tokenAluno = await loginAluno(emailAluno, dados.novoAluno.senha);

    expect(tokenAluno).to.be.a('string').and.not.empty;
  });

  it('deve registrar a entrega de um trabalho como aluno', async () => {
    const resposta = await api()
      .post(`/api/alunos/${alunoId}/trabalhos`)
      .set('Authorization', `Bearer ${tokenAluno}`)
      .send({
        disciplinaId,
        titulo: dados.trabalho.titulo
      });

    expect(resposta.status).to.equal(201);
    expect(resposta.body).to.include({
      alunoId,
      disciplinaId,
      titulo: dados.trabalho.titulo,
      status: 'entregue'
    });
  });
});