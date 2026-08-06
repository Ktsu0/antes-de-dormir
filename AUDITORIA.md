# Auditoria do projeto — Antes de Dormir

Levantamento completo do código-fonte (`src/`): bugs de lógica, bugs visuais, testes,
código morto, código duplicado e pontos de performance. Nenhuma correção foi aplicada
ainda — este documento é só o relatório de achados, mais grave primeiro.

## 🔴 Erros graves / bugs de lógica

### 1. `deleteStory` nunca verifica o erro do Supabase
**Arquivo:** `src/contexts/StoryContext.js` (linha ~335)

Se o delete falhar (política de RLS, rede, linha já apagada), a função não lança
erro. O `StoryCard` sempre mostra o toast "Relato apagado." mesmo quando nada foi
apagado de fato, e o relato reaparece na próxima atualização em tempo real —
contradizendo o sucesso que acabou de ser exibido.

### 2. `addComment` engole o erro do insert
**Arquivo:** `src/contexts/StoryContext.js` (linhas ~324-327)

Se o insert do comentário falhar, a função só chama `fetchStories()` e retorna
normalmente, sem lançar erro. No `RandomStoryModal` isso faz aparecer "Comentário
enviado com sucesso!" mesmo quando nada foi salvo — e no `StoryCard`, o comentário
otimista simplesmente some quando `fetchStories()` reescreve o estado, sem nenhum
aviso de erro pro usuário.

### 3. `getRandomStory` não busca curtidas
**Arquivo:** `src/contexts/StoryContext.js` (linhas ~344-351)

A query do sorteio de relato aleatório não inclui `curtidas`/`curtidas_detalhada`.
Na prática: no modal de relato aleatório, o contador de curtidas sempre mostra 0 e
o coração nunca aparece preenchido, não importa quantas curtidas o relato tenha de
verdade.

### 4. Curtir dentro do "Relato Aleatório" não atualiza a tela
**Arquivo:** `src/components/RandomStoryModal.js` (linhas ~48-53)

O `story` do modal é um snapshot local, nunca sincronizado de volta com o
`likeStory()`. O clique registra a curtida no banco, mas visualmente nada muda no
modal — parece que o clique não fez nada (soma com o bug #3).

### 5. `JSON.parse` sem proteção no carregamento de filtros
**Arquivo:** `src/contexts/StoryContext.js` (linhas ~23-27)

Se `relatos_filters` no localStorage estiver corrompido (versão antiga
incompatível, edição manual), o app quebra inteiro na inicialização, antes de
renderizar qualquer coisa — sem try/catch nem error boundary.

### 6. Inconsistência `descricao` vs `descrição`
**Arquivo:** `src/contexts/StoryContext.js` (linhas ~83, 92, 366)

Toda leitura tenta `descricao || descrição`, mas toda escrita (criar, editar,
comentar) só grava em `descricao`. Se sobrou alguma linha antiga no banco usando a
coluna acentuada, ela nunca mais será atualizada corretamente por esse fallback.

## 🟡 Bug visual

### 7. Logo pode estourar o header
**Arquivos:** `src/styles/components/_logo.scss` (linha 6) + `src/components/Logo.js`

`.logo-image` tem `height: 12rem` (192px) fixo, sem limite responsivo. O
`.header-container` que a contém tem no máximo 96px de altura (`max-h-24`) e o
`.header-main` não tem `overflow-hidden`. Isso deveria fazer a logo visualmente
"vazar" para fora da barra do header — vale conferir no navegador; se estiver
assim, falta um `max-height` amarrado à altura do header.

## 🟠 Testes / infraestrutura

### 8. O único teste do projeto está garantido a falhar
**Arquivo:** `src/App.test.js` (linha 6)

Ainda é o teste padrão do Create React App (`getByText(/learn react/i)`), texto
que não existe em lugar nenhum do app. `npm test` sempre vai quebrar.

## 🔵 Código morto

### 9. `INITIAL_STORIES` nunca é usado
**Arquivo:** `src/data/mockStories.js` (linha 17)

Exportado, mas nunca importado em lugar nenhum do projeto. Sobra de uma versão
anterior com dados mockados.

## 🟣 Código duplicado (candidatos a extração)

### 10. Lógica de iniciais do avatar duplicada
**Arquivo:** `src/components/Header.js` (linhas ~125-127 e ~313-315)

```js
(user.user_metadata?.nomeUser?.[0] || user.email?.[0]).toUpperCase()
```

Repetida ao pé da letra em dois pontos do mesmo arquivo. Se existir usuário sem
nome e sem email, isso quebra (`.toUpperCase()` de `undefined`) — e o fix teria
que ser feito nos dois lugares.

### 11. Markup de modal repetido em 5 lugares
**Arquivos:** `src/components/Header.js` (modal de login e janela de perfil),
`src/components/StoryCard.js` (confirmar exclusão), `src/components/CreateStoryModal.js`,
`src/components/RandomStoryModal.js`

Todos reimplementam à mão o mesmo padrão: `fixed inset-0` + backdrop com blur +
`motion.div` com o mesmo spring de entrada/saída. Um componente `<Modal>`
compartilhado eliminaria a repetição e centralizaria ajustes futuros (nenhum modal
atual fecha com Esc ou tem focus trap, por exemplo).

## ⚙️ Qualidade / performance

### 12. Toda função do `StoryContext` é recriada a cada render
**Arquivo:** `src/contexts/StoryContext.js` (linhas ~404-422)

Nenhuma função exposta pelo contexto usa `useCallback`, então o valor do contexto
nunca é estável. Isso faz o `useEffect` do `CategoryFilter` (que depende de
`filterByCategories`) desmontar e remontar o listener de clique-fora a cada
re-render do `StoryProvider`.

### 13. Interval do `MysticalBackground` é recriado quase a cada tick
**Arquivo:** `src/components/MysticalBackground.js` (linhas ~81-104)

`createNewIcon` depende de `activeIcons`, que muda toda vez que um ícone
nasce/morre — então o `setInterval` é destruído e recriado quase a cada segundo em
vez de rodar como um timer estável.

### 14. Escala de z-index sem padrão

Valores espalhados sem critério pelo projeto: `z-50`, `z-[100]`, `z-[110]`,
`z-[120]`, `z-[9999]`, `z-[10000]`, `z-[99999]`. Funciona por sorte hoje, mas é
fácil um novo modal nascer com z-index errado e ficar atrás de outra coisa.

---

## Ordem sugerida de correção

1. **Bugs graves de lógica (#1–#6)** — maior impacto real, o app hoje mente pro
   usuário em alguns fluxos de erro.
2. **Bug visual (#7)** e **código morto (#9)** — rápidos e de baixo risco.
3. **Duplicações (#10, #11)** — reduzem superfície de manutenção.
4. **Testes (#8)** — corrigir ou remover o teste quebrado.
5. **Performance (#12–#14)** — sem impacto funcional hoje, mas vale limpar.
