# Verificação da atualização do portfólio

## Diagnóstico

A experiência estava desativada e o conteúdo dava prioridade a formação e tecnologias web genéricas. A stack tinha escalas subjetivas de nível. Existiam dois sistemas de ícones, cores fora dos tokens, um loader que bloqueava a página e efeitos de entrada que não respeitavam integralmente movimento reduzido.

## Correções aplicadas

- Nova ordem e textos conforme o resumo profissional fornecido.
- Experiência N1 visível; Python/FastAPI em destaque e projetos classificados por contexto.
- Projetos e cursos anteriores em áreas expansíveis acessíveis por teclado.
- Reveal por card de projeto, evitando que uma seção longa nunca atingisse o limiar necessário para ficar visível em mobile.
- Texto da apresentação pode quebrar linha; imagem e colunas adaptam-se à largura.
- Removido limite de altura que poderia cortar os novos textos do accordion.
- Espaço de navegação por âncoras ajustado ao menu mobile com duas linhas.
- Corrigido `ease-ouy` para `ease-out` na animação de formação.

## Tokens e cores

Mantida a paleta existente: `--fundo-principal`, `--fundo-secundario`, `--card`, `--borda`, `--texto-principal`, `--texto-secundario` e `--cor-p1/2/3`.

Criados `--destaque-suave`, `--destaque-borda` e `--sombra-destaque`, derivados de `--cor-p1`. Substituídos branco literal, `#38bff870` e cores RGBA fixas nos efeitos e fundos por tokens ou `color-mix` derivado da paleta. A auditoria final encontra cores literais apenas na definição dos tokens.

## Responsividade

Mantidos os breakpoints existentes de 480, 768, 1024 e 1280 px. Verificação automatizada em Chromium a 320, 375, 480, 768, 1024, 1440 e 1920 px, com altura de 900 px.

Todas as larguras passaram nas verificações de overflow horizontal, visibilidade dos cards ao percorrer a página, âncoras existentes e texto do accordion sem corte. A configuração de movimento reduzido também passou. Capturas de desktop (1280 px) e mobile (375 px) foram inspecionadas visualmente.

## Limpeza visual

- Removidos seletores de ocultação da experiência, indicadores `.skill-level`, `.skills-values` e cabeçalhos antigos da stack sem uso.
- Removidos loader, `layout/html.css`, import correspondente e animação de digitação conflitante.
- Removido Material Icons; ícones usam Font Awesome.
- Simplificados blur, escala e grandes deslocamentos de reveal; consolidada transição duplicada.
- Limitada a largura de leitura em telas grandes.

## Verificação

- `node --check src/js/main.js`, `src/js/animation.js` e `src/js/projects.js`: sintaxe válida.
- `git diff --check`: sem erros de whitespace.
- Script da skill `audit_frontend_aesthetic.py`: executado antes e depois; resultados revistos manualmente.
- Playwright/Chromium: renderização dos quatro destaques e três cards secundários, sete larguras, accordion, áreas expansíveis, IDs únicos, âncoras, movimento reduzido, sem exceções JavaScript ou respostas HTTP locais de erro.
- Inspeção visual: hero desktop/mobile e cards de projetos.
- Playwright adicional: estado ativo do menu, títulos visíveis após navegação por âncora, interação por teclado e fallback sem JavaScript aprovados.
- Novo CV: PDF A4 de uma página, sem encriptação ou JavaScript; substituição exata do documento fornecido pelo autor e download HTTP verificado.

Os utilitários de teste e capturas ficaram em `/tmp/portfolio-preview`, sem novas dependências no projeto.

## Riscos restantes

- A revisão visual automatizada foi realizada em Chromium; outros motores não foram verificados.
- Fontes e ícones continuam a depender dos CDNs já usados pelo projeto.
- As fontes e os critérios editoriais para futuras atualizações estão documentados em `revisao-conteudo.md`.
