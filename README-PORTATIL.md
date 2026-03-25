# Modo portatil local

Esta adaptacao serve para testar o frontend localmente, sem backend, sem banco e sem login real.

## Como abrir

1. Clique em `Abrir-Integracao-ABR.bat`
2. Na primeira execucao, o script instala as dependencias automaticamente
3. Em seguida, ele gera o build portatil
4. O navegador abre automaticamente em `http://127.0.0.1:4780`
5. Fechar a janela do launcher encerra a aplicacao
6. O launcher tambem mostra o endereco de rede local para outros computadores do mesmo ambiente

Pre-requisito:

- a maquina precisa ter `Node.js` LTS instalado
- se for a primeira execucao em uma maquina nova, a instalacao das dependencias exige internet

Opcional:

- `Fechar-Integracao-ABR.bat` encerra a porta `4780` se o preview ficar aberto

## Onde colocar arquivos locais

Use a pasta `public/storage`:

- `public/storage/videos`
- `public/storage/materials`
- `public/storage/covers`

## Comportamento

- o portal abre direto em modo colaborador
- os mocks continuam ativos com `localStorage`
- PDF abre em nova aba
- video local abre no player
- capas locais aparecem na trilha quando presentes
- o launcher instala dependencias automaticamente se `node_modules` ainda nao existir

## Scripts

- `npm run build:portable`
- `npm run preview:portable`

## URL local

- `http://127.0.0.1:4780`

## URL na mesma rede

- o servidor sobe em `0.0.0.0:4780`
- outro computador da mesma rede pode acessar por `http://IP-DA-MAQUINA:4780`
- o proprio launcher mostra esse IP na janela ao iniciar
