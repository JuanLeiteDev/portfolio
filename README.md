# Portfólio Juan Leite

Portfólio pessoal desenvolvido em HTML, CSS e JavaScript para apresentar perfil profissional, tecnologias, formações, projetos e canais de contato.

## Sobre o projeto

Este repositório contém um site estático de portfólio com foco em Python, desenvolvimento backend com FastAPI e experiência profissional em TI. A página é composta por seções independentes e responsivas:

- `Início`: posicionamento Python / Backend Developer, foto e atalhos para projetos e experiência.
- `Sobre`: trajetória profissional, Python na prática e direção de carreira; accordion em mobile.
- `Experiência`: cargo oficial de suporte N1 na Eleven Systems e contribuições em Python e troubleshooting.
- `Projetos`: quatro destaques classificados por contexto, com disponibilidade do código; projetos anteriores e estudos numa área expansível.
- `Stack`: Python/backend numa faixa de destaque; dados, testes, ferramentas e outros conhecimentos organizados em pares de grupos, sem escalas de proficiência.
- `Formações`: licenciatura em curso e todos os cursos complementares reunidos na mesma timeline.
- `Contato`: GitHub, LinkedIn, WhatsApp e download do CV.

## Tecnologias

- HTML5 sem framework.
- CSS3 modularizado por base, layout, componentes e seções.
- JavaScript ES Modules para animações de entrada, navegação ativa e interações.
- Font Awesome para ícones.
- Google Fonts: Inter, JetBrains Mono e Space Grotesk.

## Estrutura

```text
portfolio/
├── index.html
├── assets/
│   ├── cv/
│   │   └── cv.pdf
│   └── img/
│       ├── favicon.ico
│       └── juan-png.webp
├── src/
│   ├── css/
│   │   ├── base/
│   │   │   ├── reset.css
│   │   │   └── variables.css
│   │   ├── components/
│   │   │   ├── buttons.css
│   │   │   └── reveal.css
│   │   ├── layout/
│   │   │   ├── footer.css
│   │   │   ├── header.css
│   │   │   ├── hero.css
│   │   │   └── page.css
│   │   ├── sections/
│   │   │   ├── about.css
│   │   │   ├── contact.css
│   │   │   ├── education.css
│   │   │   ├── experience.css
│   │   │   ├── projects.css
│   │   │   └── skills.css
│   │   └── main.css
│   └── js/
│       ├── animation.js
│       ├── main.js
│       └── projects.js
├── README.md
└── .gitignore
```

## Como rodar localmente

Por usar JavaScript com `type="module"`, rode por um servidor local:

```bash
python3 -m http.server 5500
```

Depois acesse:

```text
http://localhost:5500
```

Se a porta estiver ocupada, use outra:

```bash
python3 -m http.server 5501
```

## CSS

O CSS entra por `src/css/main.css`, que importa os módulos em ordem:

- `base`: variáveis de cor, fontes e reset.
- `layout`: header, hero, container e footer.
- `components`: botões e animações de reveal.
- `sections`: estilos específicos para sobre, skills, formações, projetos, experiência e contato.

Os tokens principais ficam em `src/css/base/variables.css`.

## JavaScript

O ponto de entrada é `src/js/main.js`. Atualmente ele inicializa:

- animações de entrada e observação de seções;
- renderização dos cards da seção `Projetos` a partir de `src/js/projects.js`;
- link ativo do menu conforme scroll;
- accordion dos cards da seção `Sobre` em telas menores.

## Assets

- `assets/img/juan-png.webp`: foto usada no hero.
- `assets/img/favicon.ico`: favicon.
- `assets/cv/cv.pdf`: currículo disponibilizado para download.

## Observações

- O projeto não usa bundler, framework ou etapa de build.
- A experiência profissional está ativa no menu e na página.
- Os projetos são mantidos em `src/js/projects.js`, separados em destaques e arquivo. Links só são apresentados quando existe um repositório público verificado.
- A verificação do GitHub, as fontes do conteúdo e os pontos para revisão estão em [docs/revisao-conteudo.md](docs/revisao-conteudo.md).
- O domínio público é `https://juanleitedev.com`; a branch de produção é `main`.
- As alterações visuais e verificações estão em [docs/verificacao-visual.md](docs/verificacao-visual.md).
- Arquivos temporários de composição visual ficam em `tmp/` e são ignorados pelo Git.

## Autor

Desenvolvido por Juan Leite.
