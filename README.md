# Lucro Mais

Calculadora de lucro para vendedores de marketplace. O vendedor informa custo, preço de venda, frete, embalagem, anúncios, custo operacional e imposto do Simples Nacional, e o sistema mostra o lucro líquido, a margem e para onde vai cada real.

> Projeto de portfólio, desenvolvido com apoio de IA (Lovable). Eu defini as regras, testei os fluxos e corrigi os problemas encontrados.

**Ver funcionando:** https://lucromais-dev-lens.vercel.app/

## O que tem

- Cálculo de lucro líquido por venda, com cada custo descontado uma vez só
- Cálculo do preço de venda para atingir o lucro desejado
- Comparação entre marketplaces e histórico de produtos
- Estimativa de frete por CEP (tabela interna, não consulta os Correios)
- Cadastro de fornecedores e exportações em PDF e planilha
- Análise de produto e gerador de anúncio com IA
- Login com recuperação de senha e painel de administração
- Conta de demonstração com tour guiado

## Tecnologias

React, TypeScript, Vite, Tailwind, Supabase (Postgres, autenticação e funções de servidor), integração com IA, Vercel.

## Segurança (o que está implementado)

- Cada tabela tem regra no banco que só mostra as linhas do próprio usuário
- As funções de IA exigem login, validam o que recebem e têm limite de 20 usos por hora por usuário, aplicado também no banco
- O usuário só edita nome e empresa; os campos de assinatura só mudam pelo servidor
- O painel Admin altera assinaturas por uma função que confere no servidor quem clicou e se é administrador
- Testes automatizados para a validação das funções de IA e o tour da demonstração

## Limitações conhecidas

- O cálculo do preço para um lucro desejado ignora embalagem, anúncios, custo operacional e imposto
- A taxa de pagamento usa sempre o valor do cartão, não o do Pix
- As taxas dos marketplaces estão digitadas no código
- Não há cobrança real: o teste grátis e a assinatura são apenas demonstração

## Como rodar

```bash
npm install
npm run dev
```

Crie um arquivo `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` do seu projeto Supabase.

## Autor

Flávio Augusto da Silva, Zentrixia Smart Solutions. Diadema, SP.
