# Anona — Sistema de acompanhamento de condicionalidades do Bolsa Família

App simples (site estático) com:
- Calendário oficial de pagamentos do Bolsa Família 2026 por final do NIS;
- Prazos de saúde, educação, SICON e interrupção temporária;
- Bloco de anotações por dia, **sincronizado entre todos os seus dispositivos** via Firebase (Google), de graça.

Não precisa de servidor: você hospeda no próprio GitHub (GitHub Pages) e o Firebase cuida só do login e da sincronização das notas.

---

## 1. Estrutura dos arquivos

```
index.html          -> o app inteiro (calendário + notas + login)
manifest.json        -> permite "instalar" o app no celular/computador
sw.js                 -> deixa o app funcionando offline (guarda o "esqueleto" do app)
icons/icon-192.png    -> ícone do app
icons/icon-512.png    -> ícone do app (versão maior)
firestore.rules       -> regras de segurança (cole no console do Firebase)
```

Suba todos esses arquivos para a raiz do seu repositório no GitHub (ou para uma subpasta, tanto faz, desde que fiquem todos juntos).

---

## 2. Criar o projeto no Firebase (grátis)

1. Acesse **https://console.firebase.google.com** e entre com uma conta Google.
2. Clique em **Adicionar projeto**, dê um nome (ex: `anona-app`) e conclua a criação. Não precisa ativar o Google Analytics.
3. Dentro do projeto, clique no ícone **`</>`** ("Adicionar app da Web").
   - Dê um apelido, **não** marque Firebase Hosting (você vai usar o GitHub Pages).
   - O Firebase vai mostrar um bloco `firebaseConfig` parecido com este:
     ```js
     const firebaseConfig = {
       apiKey: "AIza...",
       authDomain: "anona-app.firebaseapp.com",
       projectId: "anona-app",
       storageBucket: "anona-app.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abcdef"
     };
     ```
   - **Copie esse bloco inteiro.**
4. Abra o arquivo `index.html`, procure por `SUBSTITUA pelos dados do SEU projeto Firebase` e troque o objeto `firebaseConfig` de exemplo pelo que você copiou.

### Ativar login por e-mail/senha
1. No menu lateral do Firebase, vá em **Build > Authentication**.
2. Clique em **Get started** (ou "Sign-in method").
3. Ative o provedor **E-mail/senha**.

### Criar o banco de dados (Firestore)
1. No menu lateral, vá em **Build > Firestore Database**.
2. Clique em **Criar banco de dados**.
3. Escolha **modo de produção** e a região mais próxima (ex: `southamerica-east1` — São Paulo).
4. Depois de criado, vá na aba **Regras** e cole o conteúdo do arquivo `firestore.rules` deste projeto. Clique em **Publicar**.

> **Se você já tinha o app publicado antes desta versão:** as regras mudaram (foi adicionada a subcoleção `repercussao`). Volte na aba **Regras** do Firestore e cole o `firestore.rules` atualizado de novo, senão o envio das planilhas de Repercussão vai dar erro de permissão.

Pronto — o Firebase está configurado. Isso é 100% grátis para uso pessoal (o plano gratuito do Firebase é bem generoso para um app individual).

---

## 3. Publicar no GitHub Pages

1. Crie um repositório no GitHub (pode ser público ou privado) e suba todos os arquivos deste projeto (`index.html`, `manifest.json`, `sw.js`, pasta `icons/`, `firestore.rules`).
2. No repositório, vá em **Settings > Pages**.
3. Em "Source", escolha a branch `main` (ou `master`) e a pasta `/ (root)`.
4. Salve. Depois de 1–2 minutos, o GitHub mostra o link do seu site, algo como:
   `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`

---

## 4. Usando o app

- Abra o link em qualquer navegador (celular ou computador).
- No topo, clique em **Sincronizar notas** para criar uma conta (e-mail + senha) ou entrar.
- Depois de logado, toda anotação feita em um dia fica salva na nuvem — abra o mesmo site em outro celular, entre com o mesmo e-mail/senha, e as notas aparecem automaticamente.
- Sem login, as notas ficam salvas só naquele aparelho (modo local).
- Digite o **final do seu NIS** na barra lateral para o calendário destacar automaticamente o seu dia de pagamento em cada mês.
- No celular, o navegador costuma oferecer **"Adicionar à tela inicial" / "Instalar app"** — isso instala o site como um app de verdade, com ícone próprio.

---

## 5. Sobre as informações do Bolsa Família incluídas

- Calendário de pagamentos por final do NIS: últimos 10 dias úteis de cada mês, com dezembro antecipado (encerra dia 23) — conforme calendário oficial MDS/Caixa 2026.
- Valor mínimo garantido por família: R$ 600 (Benefício Complementar).
- Benefício Primeira Infância: + R$ 150 por criança de 0 a 6 anos.
- Benefício Variável Familiar: + R$ 50 por gestante, nutriz, criança/adolescente de 7 a 18 anos incompletos.
- Necessidade de manter o Cadastro Único atualizado a cada 24 meses.
- Condicionalidades de saúde e frequência escolar.
- Prazo de 180 dias para sacar cada parcela.
- Canais oficiais: Disque Social MDS (121) e Central Caixa (111), além do app Caixa Tem.

**Atenção:** datas e valores podem mudar por decisão do governo ao longo do ano. Este app é uma ferramenta pessoal de organização — antes de qualquer decisão importante, confirme sempre no app oficial **Caixa Tem** ou no site **gov.br/mds**.

---

## 6. Funcionamento offline

Depois que o app for aberto **pelo menos uma vez com internet** (para baixar tudo: calendário, estilo visual, ícones e o gerador de PDF), ele passa a funcionar **totalmente offline**:

- O calendário, os prazos e o visual do app continuam aparecendo normalmente sem internet.
- Suas anotações continuam sendo salvas e lidas normalmente offline (ficam guardadas no aparelho e, quando a internet voltar, sincronizam sozinhas com a nuvem, se você estiver logado).
- A exportação em PDF também funciona sem internet.
- Assim que a internet voltar, o app aproveita para buscar a versão mais nova de tudo automaticamente (ver seção 7).

**Importante:** o primeiro acesso (a primeira vez que a pessoa abre o link) precisa ser com internet, para o aparelho baixar e guardar tudo. Depois disso, funciona offline normalmente — inclusive já instalado como app no celular.

## 7. Atualização automática do app

Toda vez que você editar `index.html` (ou qualquer arquivo) e subir a mudança para o GitHub, o app instalado no celular/computador das pessoas se atualiza sozinho, sem precisar desinstalar nada:

- Quando o app é aberto com internet, ele sempre busca a versão mais nova do `index.html` no servidor primeiro (e só usa a cópia salva localmente se estiver sem internet).
- Se o app já estava aberto e uma versão nova chega, ele recarrega a tela sozinho para mostrar a atualização.
- Ele também confere se há versão nova toda vez que o usuário volta a abrir o app (troca de aba, reabre o app no celular etc.).

Ou seja: você só precisa subir os arquivos atualizados no GitHub — não precisa avisar os usuários nem pedir para reinstalar.

**Exceção:** se um dia você trocar nomes de arquivos de ícones ou quiser forçar todo mundo a "limpar o cache" de uma vez (algo raro), edite o `sw.js` e troque `pbf-app-shell-v3` para `pbf-app-shell-v4` (ou outro número). Isso não é necessário para atualizações normais de texto, calendário ou visual do app.

## 8. Repercussão de Condicionalidades (planilhas do MDS)

Na barra lateral do app, novo bloco **"Repercussão de Condicionalidades"**:

- Todo mês ímpar, quando o MDS mandar a planilha, clique em **"Enviar planilha (.xlsx)"** e selecione o arquivo.
- O app tenta identificar sozinho o mês e o ano pelo nome do arquivo (ex: `Repercussão_Setembro_de_2026...`); se não conseguir, ele pergunta.
- O arquivo fica guardado (sincronizado na nuvem, se você estiver logado — ou só neste aparelho, se não estiver) e aparece na lista, organizado por ano.
- A qualquer momento, clique no ícone de **download** para baixar o arquivo original de volta, ou no ícone de **lixeira** para apagá-lo.
- Use o filtro **"Todos os anos"** para ver só os arquivos de um ano específico.

**Limite:** por ser guardado no Firestore (plano gratuito), cada planilha precisa ter até ~900 KB. As planilhas de Repercussão normalmente ficam bem abaixo disso.

## 9. Personalizando

- Cores, textos e ícones: tudo está em `index.html` (é um arquivo único, fácil de editar).
- Para trocar o nome do app na tela inicial do celular, edite `name` e `short_name` em `manifest.json`.

---

## 10. Atualização anual (todo início de ano)

O app foi organizado para essa atualização ser rápida. Tudo o que muda de ano para ano fica junto, no topo do segundo bloco de código (`<!-- APP -->`) dentro do `index.html`. Abra o arquivo, procure por `ANO_VIGENTE` e siga os passos:

1. **Troque o número do ano**
   ```js
   const ANO_VIGENTE = 2026;
   ```
   Troque `2026` pelo novo ano (ex: `2027`). Isso já atualiza sozinho: o título da aba, a tela de senha, o cabeçalho, o rodapé, o nome/título do PDF exportado e o limite de navegação do calendário (o app só deixa passear pelos meses do ano vigente).

2. **Troque os três blocos de dados oficiais**, logo abaixo do `ANO_VIGENTE` (estão marcados com um comentário `EDITAR TODO INÍCIO DE ANO`). Pegue os dados novos no calendário oficial MDS/Caixa e nos comunicados de Condicionalidades do ano novo, e substitua:
   - **`monthHighlights`** — os destaques de cada mês (saúde, educação, SICON, interrupção) que aparecem no resumo do mês.
   - **`officialEvents`** — os prazos específicos por data (formato `"AAAA-MM-DD"`), de saúde/educação/SICON/interrupção.
   - **`paymentCalendar`** — as datas de pagamento por final do NIS. Cada mês (0=Janeiro a 11=Dezembro) tem uma lista de **10 números**, na ordem: NIS final **1, 2, 3, 4, 5, 6, 7, 8, 9, 0** — nessa ordem exata.

   Dica: é mais fácil apagar o conteúdo de dentro das chaves `{ }` de cada um desses três blocos e colar o novo, mantendo o mesmo formato de quem já está lá.

3. **Confira se os valores dos benefícios mudaram** (seção "Valores" na barra lateral, perto da linha 175 do `index.html`): o mínimo garantido (hoje R$ 600), o Benefício Primeira Infância (hoje + R$ 150) e o Benefício Variável Familiar (hoje + R$ 50). Se o governo reajustar esses valores, edite o texto diretamente ali.

4. **Suba o `index.html` atualizado no GitHub.** Como o app se atualiza sozinho (ver seção 7), todo mundo que já tem o app instalado vai receber a versão nova automaticamente, sem precisar reinstalar.

**Não precisa mexer em:** `manifest.json`, `sw.js` ou `firestore.rules` — nenhum desses depende do ano.

