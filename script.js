/**
 * ============================================================
 * ABILITY PRO — SISTEMA DE INSPEÇÃO DE EPIs
 * script.js — Lógica principal da página de inspeção
 * 
 * Responsabilidades deste arquivo:
 *  1. Gerenciar upload de imagens de evidência (até 3)
 *  2. Salvar registros de inspeção no localStorage
 *  3. Renderizar o histórico de inspeções na sidebar
 *  4. Gerar laudos individuais em PDF (via jsPDF)
 *  5. Gerar relatório mensal em PDF
 *  6. Excluir registros individuais
 * ============================================================
 */


// ============================================================
// VARIÁVEL GLOBAL DE IMAGENS
// Armazena até 3 imagens em base64 para uso no PDF.
// ============================================================
let currentImgs = [];


// ============================================================
// INICIALIZAÇÃO
// Quando a página termina de carregar, exibe o histórico.
// ============================================================
window.onload = atualizarSidebar;


// ============================================================
// handleImgs(files)
// Chamada quando o usuário seleciona arquivos no input de foto.
// Lê até 3 imagens, exibe as miniaturas e armazena os base64.
// ============================================================
function handleImgs(files) {

    // Limpa a área de preview e o array anterior
    const prev = document.getElementById('preview');
    prev.innerHTML = '';
    currentImgs = [];

    // Converte a lista de arquivos em array e limita a 3
    Array.from(files).slice(0, 3).forEach(function(arquivo) {

        const reader = new FileReader();

        // Callback executado quando a leitura de cada arquivo termina
        reader.onload = function(evento) {
            const base64 = evento.target.result;

            // Cria e exibe a miniatura na interface
            const img = document.createElement('img');
            img.src = base64;
            prev.appendChild(img);

            // Guarda o base64 no array para uso posterior no PDF
            currentImgs.push(base64);
        };

        // Inicia a leitura do arquivo como Data URL (base64)
        reader.readAsDataURL(arquivo);
    });
}


// ============================================================
// salvarEGerar()
// Valida o formulário, monta o objeto de registro,
// salva no localStorage, gera o PDF e atualiza a sidebar.
// ============================================================
function salvarEGerar() {

    // Lê os valores dos campos do formulário
    const inspetor = document.getElementById('inspetor').value;
    const nome     = document.getElementById('nome').value;
    const re       = document.getElementById('re').value;
    const obs      = document.getElementById('obs').value;
    const agora    = new Date();

    // ---- VALIDAÇÃO: campos obrigatórios ----
    // Se qualquer campo essencial estiver vazio, alerta e para
    if (!nome || !re || !inspetor) {
        alert("⚠️ Preencha os campos obrigatórios: Inspetor, Nome e RE.");
        return;
    }

    // ---- COLETA DOS CHECKBOXES DE AVARIA ----
    // Seleciona todos os checkboxes marcados e pega seus valores
    const checks = Array.from(
        document.querySelectorAll('.item-check:checked')
    ).map(function(checkbox) {
        return checkbox.value;
    });

    // ---- MONTA O OBJETO DO REGISTRO ----
    const registro = {
        id:       Date.now(),              // ID único baseado no timestamp atual
        inspetor: inspetor.toUpperCase(),  // Padroniza em maiúsculas
        nome:     nome.toUpperCase(),
        re:       re,
        obs:      obs,
        checks:   checks,                  // Array de avarias marcadas
        data:     agora.toLocaleDateString('pt-BR'),   // "dd/mm/aaaa"
        hora:     agora.toLocaleTimeString('pt-BR', {  // "HH:MM"
                      hour: '2-digit',
                      minute: '2-digit'
                  }),
        mes:      agora.getMonth() + 1     // Número do mês para filtro do relatório
    };

    // ---- SALVA NO LOCALSTORAGE ----
    // Carrega o histórico existente, adiciona o novo registro e salva
    let historico = JSON.parse(localStorage.getItem('ability_pro_v4') || '[]');
    historico.push(registro);
    localStorage.setItem('ability_pro_v4', JSON.stringify(historico));

    // ---- AÇÕES PÓS-SALVAMENTO ----
    gerarPDFIndividual(registro);  // Gera e baixa o laudo em PDF
    atualizarSidebar();             // Atualiza a lista na sidebar

    // Reseta o formulário para um novo preenchimento
    document.getElementById('checkForm').reset();
    document.getElementById('preview').innerHTML = '';
    currentImgs = []; // Limpa as imagens armazenadas
}


// ============================================================
// atualizarSidebar()
// Lê o histórico e renderiza os cards de registro na sidebar.
// Exibe os mais recentes primeiro (array invertido).
// ============================================================
function atualizarSidebar() {

    const historico = JSON.parse(localStorage.getItem('ability_pro_v4') || '[]');
    const container = document.getElementById('historyList');

    // Se não há registros, exibe mensagem de estado vazio
    if (historico.length === 0) {
        container.innerHTML = '<p style="text-align:center; font-size:0.7rem; color:gray; margin-top:20px;">Vazio</p>';
        return;
    }

    // Inverte o array para mostrar os mais recentes no topo
    // .slice() cria uma cópia para não modificar o original
    container.innerHTML = historico.slice().reverse().map(function(item) {
        return `
            <div class="history-item">

                <!-- Botão de excluir registro individual -->
                <button 
                    class="btn-delete-single" 
                    onclick="excluirItem(${item.id})"
                    title="Excluir este registro"
                >
                    <!-- Ícone de lixeira (Font Awesome inline) -->
                    <i class="fa-solid fa-trash"></i>
                </button>

                <!-- Nome do colaborador inspecionado -->
                <b>${item.nome}</b>

                <!-- Número de RE/matrícula -->
                <span>RE: ${item.re}</span>

                <!-- Data e hora do registro com ícone de relógio -->
                <span style="font-size: 0.65rem; color: var(--primary); margin-top:5px;">
                    <i class="fa-regular fa-clock"></i> ${item.data} - ${item.hora}
                </span>

            </div>
        `;
    }).join(''); // Junta todos os cards em uma string HTML única
}


// ============================================================
// excluirItem(id)
// Remove um registro específico do localStorage pelo seu ID.
// Pede confirmação antes de excluir.
// ============================================================
function excluirItem(id) {

    if (confirm("Remover este registro do histórico?")) {

        // Carrega o histórico, filtra removendo o item com o ID alvo
        let historico = JSON.parse(localStorage.getItem('ability_pro_v4') || '[]');

        // filter() retorna um novo array SEM o item de ID correspondente
        const atualizado = historico.filter(function(item) {
            return item.id !== id;
        });

        // Salva o array já sem o item removido
        localStorage.setItem('ability_pro_v4', JSON.stringify(atualizado));

        // Atualiza a sidebar para refletir a exclusão
        atualizarSidebar();
    }
}


// ============================================================
// gerarPDFIndividual(item)
// Gera um laudo técnico em PDF para um registro específico.
// Usa a biblioteca jsPDF (carregada no HTML via CDN).
// ============================================================
function gerarPDFIndividual(item) {

    // Desestrutura o objeto jsPDF da biblioteca global window.jspdf
    const { jsPDF } = window.jspdf;

    // Cria um novo documento PDF no formato A4 padrão (210 x 297 mm)
    const doc = new jsPDF();

    // ---- CABEÇALHO COM FUNDO ESCURO ----
    // Retângulo preto que cobre o topo da página
    doc.setFillColor(15, 23, 42);                // Cor de fundo (azul muito escuro)
    doc.rect(0, 0, 210, 40, 'F');               // 'F' = preenche o retângulo

    // Título "ABILITY" em branco grande
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("ABILITY", 20, 20);

    // Subtítulo menor abaixo do nome
    doc.setFontSize(10);
    doc.text("LAUDO TÉCNICO DE INSPEÇÃO DE SEGURANÇA", 20, 30);

    // ---- DADOS DO REGISTRO ----
    // Volta a cor preta para o texto do corpo
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`INSPETOR: ${item.inspetor}`, 20, 55);
    doc.text(`COLABORADOR: ${item.nome} | RE: ${item.re}`, 20, 62);
    doc.text(`REALIZADO EM: ${item.data} às ${item.hora}`, 20, 69);

    // Linha separadora horizontal
    doc.line(20, 75, 190, 75);

    // ---- STATUS DA INSPEÇÃO ----
    doc.setFont("helvetica", "bold");
    doc.text("STATUS DA INSPEÇÃO:", 20, 85);

    doc.setFont("helvetica", "normal");

    // Se houver checkboxes marcados = avarias; senão = aprovado
    let statusTexto;
    if (item.checks.length > 0) {
        statusTexto = `EQUIPAMENTO COM AVARIAS: ${item.checks.join(', ')}`;
    } else {
        statusTexto = "EQUIPAMENTO APROVADO PARA USO (CONFORME)";
    }

    // maxWidth: 170 quebra o texto automaticamente se for longo
    doc.text(statusTexto, 20, 92, { maxWidth: 170 });

    // ---- OBSERVAÇÕES TÉCNICAS ----
    doc.text("OBSERVAÇÕES TÉCNICAS:", 20, 105);
    doc.setFontSize(9);
    doc.text(item.obs || "Nenhuma observação relevante.", 20, 112, { maxWidth: 170 });

    // ---- IMAGENS DE EVIDÊNCIA ----
    // Se houver fotos, adiciona até 3 lado a lado
    if (currentImgs.length > 0) {
        currentImgs.forEach(function(imgBase64, indice) {
            // Cada imagem tem 55mm de largura, espaçadas de 60mm
            doc.addImage(imgBase64, 'JPEG', 20 + (indice * 60), 130, 55, 55);
        });
    }

    // ---- RODAPÉ ----
    doc.setFontSize(8);
    doc.setTextColor(150);  // Cinza para texto de rodapé
    doc.text(
        "Este documento é um registro digital oficial da Ability Tecnologia.",
        105, 285,
        { align: "center" }  // Centralizado na largura da página
    );

    // ---- SALVA E FAZ O DOWNLOAD ----
    // O nome do arquivo inclui o RE do colaborador para fácil identificação
    doc.save(`Laudo_Ability_${item.re}.pdf`);
}


// ============================================================
// gerarRelatorioMensal()
// Gera um PDF com todos os registros do mês atual.
// ============================================================
function gerarRelatorioMensal() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Carrega todos os registros do localStorage
    const historico = JSON.parse(localStorage.getItem('ability_pro_v4') || '[]');

    // Número do mês atual (1-12)
    const mesAtual = new Date().getMonth() + 1;

    // Filtra apenas os registros deste mês
    const dadosDoMes = historico.filter(function(registro) {
        return registro.mes === mesAtual;
    });

    // Se não houver dados, avisa o usuário
    if (dadosDoMes.length === 0) {
        alert("Sem registros para o mês atual.");
        return;
    }

    // ---- CABEÇALHO DO RELATÓRIO ----
    doc.setFontSize(16);
    doc.text(`RESUMO MENSAL — MÊS ${mesAtual}`, 20, 20);
    doc.setFontSize(10);
    doc.text(`Total de inspeções: ${dadosDoMes.length}`, 20, 30);
    doc.line(20, 35, 190, 35); // Linha separadora

    // ---- LISTA DE REGISTROS ----
    let posicaoY = 45; // Posição vertical inicial (vai sendo incrementada)

    dadosDoMes.forEach(function(registro) {
        // Formata o resultado: "AVARIA" ou "OK"
        const resultado = registro.checks.length > 0 ? 'AVARIA' : 'OK';

        // Linha de texto com os dados do registro
        const linha = `${registro.data} | RE: ${registro.re} | ${registro.nome} | ${resultado}`;
        doc.text(linha, 20, posicaoY);

        posicaoY += 8; // Avança 8mm para a próxima linha

        // Quebra de página automática se passar de 270mm
        if (posicaoY > 270) {
            doc.addPage();
            posicaoY = 20; // Reinicia posição na nova página
        }
    });

    // Salva e baixa o relatório
    doc.save(`Relatorio_Mensal_Mes${mesAtual}.pdf`);
}


// ============================================================
// limparHistoricoGeral()
// Remove TODOS os registros do localStorage após confirmação.
// Atualiza a sidebar após a limpeza.
// ============================================================
function limparHistoricoGeral() {

    if (confirm("Apagar todos os dados do histórico? Esta ação não pode ser desfeita.")) {
        localStorage.removeItem('ability_pro_v4');
        atualizarSidebar();
    }
}
