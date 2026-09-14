# Antes de Dormir

Rede social de relatos para ler antes de dormir: publique historias, curta, comente, filtre por categoria e sorteie um relato aleatorio para ler agora. Visual com tema mistico/noturno.

**Acesse:** https://antes-de-dormir.vercel.app

## Funcionalidades

- Login e perfil de usuario
- Publicacao de relatos (historias)
- Curtidas e comentarios em tempo real
- Filtro de relatos por categoria
- Relato aleatorio (sorteio de uma historia para ler)
- Fundo animado com tema mistico

## Tecnologias

- React
- Tailwind CSS
- Framer Motion (animacoes)
- Supabase (banco de dados e autenticacao em tempo real)

## Como rodar localmente

```bash
npm install
npm start
```

Abra http://localhost:3000 no navegador. Configure as credenciais do Supabase antes de rodar.

```bash
npm test        # testes
npm run build   # build de producao
```

## Estrutura do projeto

- `src/components/` - componentes de interface (cards de relato, modais, header)
- `src/contexts/` - estado global (relatos, curtidas, comentarios via Supabase)
- `src/data/` - dados mockados/auxiliares
- `src/lib/` - configuracao de bibliotecas externas
- `src/styles/` - estilos SCSS

## Autor

Desenvolvido por [Ktsu0](https://github.com/Ktsu0).
