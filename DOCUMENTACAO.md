# 📚 Documentação Completa - Gerador 3

## 📋 Índice de Documentos

### 1. 🗺️ Fluxo Visual do Sistema
**Arquivo:** `fluxo-sistema.png`

Diagrama completo mostrando todos os fluxos do sistema:
- **Fluxo de Projetos:** Cadastro → Análise → Geração → Download
- **Fluxo de Influenciadores:** Cadastro → Produtos → Hub de Geração → Download
- **Fluxo Soft-Sell:** Conteúdo sem produto
- **Fluxo Notícias + Projeto:** Conectar notícias com nicho

**Legenda de Cores:**
- 🟦 **Azul:** Cadastro/Input do usuário
- 🔴 **Vermelho:** Intervenção de IA
- 🟠 **Laranja:** Processamento/Configuração
- 🟢 **Verde:** Download/Output final

---

### 2. 🤖 Prompts Detalhados de IA
**Arquivo:** `prompts-detalhados.md`

Documentação completa de todas as 16 intervenções de IA:

**Análise e Extração:**
- IA-1: Seleção de Template Visual
- IA-2: Seleção de Templates Variados
- IA-3: Análise de Projeto
- IA-6: Análise Profunda de Link

**Geração de Personas e Dores:**
- IA-4: Geração de Clientes Ideais
- IA-5: Geração de Dores
- IA-7: Geração de Dores por Clientes Selecionados
- IA-8: Geração de Dores por Cliente Ideal

**Geração de Conteúdo:**
- IA-9: Geração de Conteúdo (Projetos)
- IA-10: Geração de Conteúdo Soft-Sell
- IA-11: Geração de Abordagens de Produto
- IA-12: Geração de Conteúdo de Produto
- IA-16: Geração de Conteúdo com Notícia

**Coleta de Dados Externos:**
- IA-13: Coleta de Trends
- IA-14: Coleta de Virais
- IA-15: Busca de Notícias

Cada intervenção inclui:
- ✅ Localização no código
- ✅ Quando é chamada
- ✅ O que faz
- ✅ Entrada esperada
- ✅ Saída (JSON schema)
- ✅ **Prompt completo** usado

---

### 3. 🧹 Código para Limpar
**Arquivo:** `codigo-para-limpar.md`

Lista de código potencialmente desnecessário que pode ser removido:

**🟢 Seguro para Remover:**
- Console.logs de debug
- Imports não utilizados
- Código comentado antigo
- Funções de prompt não utilizadas

**🟡 Revisar Antes de Remover:**
- States relacionados a "dores" (aba removida)
- Função `toggleItem` antiga
- Duplicação entre routers `topics` e `subjects`

**🔴 Correções Críticas:**
- **URGENTE:** Erro de sintaxe no router `subjects` (linha ~2142)
- **URGENTE:** Bug do botão "Gerar" na aba Assuntos

Inclui:
- ✅ Checklist de limpeza por fase
- ✅ Comandos para identificar código morto
- ✅ Estatísticas de tamanho dos arquivos
- ✅ Sugestões de refatoração

---

## 🎯 Como Usar Esta Documentação

### Para Desenvolvedores
1. **Entender o fluxo:** Abra `fluxo-sistema.png` para ver o panorama geral
2. **Modificar prompts:** Consulte `prompts-detalhados.md` para encontrar e editar prompts de IA
3. **Limpar código:** Use `codigo-para-limpar.md` como guia para manutenção

### Para Product Managers
1. **Visualizar jornada:** Use `fluxo-sistema.png` para apresentações e planejamento
2. **Entender IA:** Consulte `prompts-detalhados.md` para saber o que cada IA faz
3. **Priorizar melhorias:** Use `codigo-para-limpar.md` para identificar débitos técnicos

### Para Novos Membros do Time
1. **Comece pelo diagrama:** Entenda os 4 fluxos principais
2. **Leia os prompts:** Veja como a IA é usada em cada etapa
3. **Familiarize-se com o código:** Use a documentação como mapa

---

## 📊 Estatísticas do Sistema

**Total de Intervenções de IA:** 16

**Por Categoria:**
- Análise e Extração: 4 (25%)
- Geração de Personas e Dores: 4 (25%)
- Geração de Conteúdo: 5 (31%)
- Coleta de Dados Externos: 3 (19%)

**Por Fluxo:**
- Projetos: 9 IAs
- Influenciadores: 5 IAs
- Trends/Virais/Notícias: 3 IAs (compartilhadas)

**Tamanho dos Arquivos Principais:**
- `server/routers.ts`: 2810 linhas
- `server/prompts.ts`: 559 linhas
- `client/src/pages/InfluencerContentCreate.tsx`: ~750 linhas

---

## 🔄 Manutenção da Documentação

**Quando atualizar:**
- ✅ Ao adicionar nova intervenção de IA
- ✅ Ao modificar prompts existentes
- ✅ Ao adicionar novo fluxo ou funcionalidade
- ✅ Ao remover código (atualizar lista de limpeza)

**Como atualizar:**
1. **Diagrama:** Edite `fluxo-sistema.mmd` e re-renderize
2. **Prompts:** Adicione nova seção em `prompts-detalhados.md`
3. **Limpeza:** Atualize `codigo-para-limpar.md` após refatorações

---

## 🐛 Problemas Conhecidos

### 1. Botão "Gerar" não funciona na aba Assuntos
**Status:** 🔴 Crítico  
**Localização:** `client/src/pages/InfluencerContentCreate.tsx`  
**Causa provável:** Erro de sintaxe no router `subjects` (linha 2142)  
**Solução:** Corrigir sintaxe do router

### 2. Erro de TypeScript no router
**Status:** 🟡 Médio  
**Localização:** `server/routers.ts` linha 2142  
**Erro:** `Expected "}" but found "search"`  
**Solução:** Verificar chaves do router `subjects`

---

## 📞 Contato

Para dúvidas sobre esta documentação, consulte:
- **Código:** Arquivos no diretório `/home/ubuntu/gerador3/`
- **Diagrama fonte:** `fluxo-sistema.mmd` (formato Mermaid)
- **Histórico:** Git commits e changelog do projeto

---

**Última atualização:** 22/12/2024  
**Versão da documentação:** 1.0  
**Versão do projeto:** 8a50c1b1
