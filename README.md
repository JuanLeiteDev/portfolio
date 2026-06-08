# Portfólio Juan Leite

Portfólio pessoal desenvolvido em HTML, CSS e JavaScript para apresentar perfil profissional, tecnologias, formações, projetos e canais de contato.

## Sobre o projeto

Este repositório contém um site estático de portfólio com foco em desenvolvimento back-end, full-stack e engenharia de sistemas informáticos. A página é composta por seções independentes e responsivas:

- `Início`: apresentação, foto, tagline e CTAs para projetos e CV.
- `Sobre`: cards com área de foco, objetivo profissional e características; no mobile, os cards funcionam como accordion.
- `Skills`: tecnologias organizadas por front-end, back-end e ferramentas, com indicadores visuais de nível.
- `Formações`: timeline acadêmica com ícones, períodos e descrições.
- `Projetos`: cards renderizados por JavaScript com tags e links para GitHub.
- `Contato`: links para GitHub, LinkedIn, WhatsApp e download do CV.

## Tecnologias

- HTML5 sem framework.
- CSS3 modularizado por base, layout, componentes e seções.
- JavaScript ES Modules para loader, animações de reveal, navegação ativa e interações.
- Font Awesome e Material Icons para ícones.
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
│   │   │   ├── html.css
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
- `layout`: header, hero, container, footer e loader.
- `components`: botões e animações de reveal.
- `sections`: estilos específicos para sobre, skills, formações, projetos, experiência e contato.

Os tokens principais ficam em `src/css/base/variables.css`.

## JavaScript

O ponto de entrada é `src/js/main.js`. Atualmente ele inicializa:

- animações de entrada e observação de seções;
- renderização dos cards da seção `Projetos` a partir de `src/js/projects.js`;
- link ativo do menu conforme scroll;
- loader inicial da página;
- accordion dos cards da seção `Sobre` em telas menores.

## Assets

- `assets/img/juan-png.webp`: foto usada no hero.
- `assets/img/favicon.ico`: favicon.
- `assets/cv/cv.pdf`: currículo disponibilizado para download.

## Observações

- O projeto não usa bundler, framework ou etapa de build.
- A seção de experiências está comentada no menu, mas o CSS correspondente ainda existe em `src/css/sections/experience.css`.
- Arquivos temporários de composição visual ficam em `tmp/` e são ignorados pelo Git.

## Autor

Desenvolvido por Juan Leite.
