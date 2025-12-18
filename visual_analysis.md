# Análise Visual do Problema - 18/12/2024

## Observação do Screenshot

Olhando o preview do slide 1 (template "bold-statement"):
- A imagem está na parte SUPERIOR do preview
- O texto está abaixo da imagem
- Mas o template "bold-statement" define:
  - imageFrame.y: '70%' (imagem deveria estar na parte INFERIOR)
  - textStyle.position: 'top-center' (texto deveria estar no TOPO)

## Problema Identificado

O SlidePreview está mostrando a imagem no topo porque:
1. O preview pequeno na lateral esquerda mostra a imagem no topo
2. Mas o template "bold-statement" define a imagem em y: 70% (parte inferior)

## Hipótese

O problema pode ser que:
1. O SlidePreview não está recebendo o templateId correto do banco
2. Ou o useEffect não está atualizando o selectedTemplateId quando muda de slide
3. Ou há um delay na atualização do estado

## Verificação Necessária

Adicionar console.log no SlidePreview para ver qual templateId está recebendo
