let currentImgs = [];

window.onload = atualizarSidebar;

function handleImgs(files) {
    const prev = document.getElementById('preview');
    prev.innerHTML = '';
    currentImgs = [];
    Array.from(files).slice(0, 3).forEach(f => {
        const r = new FileReader();
        r.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            prev.appendChild(img);
            currentImgs.push(e.target.result);
        };
        r.readAsDataURL(f);
    });
}

function salvarEGerar() {
    const inspetor = document.getElementById('inspetor').value;
    const nome = document.getElementById('nome').value;
    const re = document.getElementById('re').value;
    const obs = document.getElementById('obs').value;
    const agora = new Date();
    
    if(!nome || !re || !inspetor) return alert("⚠️ Preencha os campos obrigatórios!");

    const checks = Array.from(document.querySelectorAll('.item-check:checked')).map(c => c.value);

    const registro = {
        inspetor: inspetor.toUpperCase(),
        nome: nome.toUpperCase(),
        re: re,
        obs: obs,
        checks: checks,
        data: agora.toLocaleDateString('pt-BR'),
        hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        mes: agora.getMonth() + 1,
        id: Date.now()
    };

    let historico = JSON.parse(localStorage.getItem('ability_pro_v4') || '[]');
    historico.push(registro);
    localStorage.setItem('ability_pro_v4', JSON.stringify(historico));

    gerarPDFIndividual(registro);
    atualizarSidebar();
    
    document.getElementById('checkForm').reset();
    document.getElementById('preview').innerHTML = '';
    currentImgs = [];
}

function atualizarSidebar() {
    const hist = JSON.parse(localStorage.getItem('ability_pro_v4') || '[]');
    const container = document.getElementById('historyList');
    
    if(hist.length === 0) {
        container.innerHTML = '<p style="text-align:center; font-size:0.7rem; color:gray; margin-top:20px;">Vazio</p>';
        return;
    }

    container.innerHTML = hist.slice().reverse().map(item => `
        <div class="history-item">
            <button class="btn-delete-single" onclick="excluirItem(${item.id})"><i class="fa-solid fa-trash"></i></button>
            <b>${item.nome}</b>
            <span>RE: ${item.re}</span>
            <span style="font-size: 0.65rem; color: var(--primary); margin-top:5px;">
                <i class="fa-regular fa-clock"></i> ${item.data} - ${item.hora}
            </span>
        </div>
    `).join('');
}

function excluirItem(id) {
    if(confirm("Remover este registro?")) {
        let hist = JSON.parse(localStorage.getItem('ability_pro_v4') || '[]');
        localStorage.setItem('ability_pro_v4', JSON.stringify(hist.filter(i => i.id !== id)));
        atualizarSidebar();
    }
}

function gerarPDFIndividual(item) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("ABILITY", 20, 20);
    doc.setFontSize(10);
    doc.text("LAUDO TÉCNICO DE INSPEÇÃO DE SEGURANÇA", 20, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`INSPETOR: ${item.inspetor}`, 20, 55);
    doc.text(`COLABORADOR: ${item.nome} | RE: ${item.re}`, 20, 62);
    doc.text(`REALIZADO EM: ${item.data} às ${item.hora}`, 20, 69);

    doc.line(20, 75, 190, 75);

    doc.setFont("helvetica", "bold");
    doc.text("STATUS DA INSPEÇÃO:", 20, 85);
    doc.setFont("helvetica", "normal");
    
    let status = item.checks.length > 0 ? `EQUIPAMENTO COM AVARIAS: ${item.checks.join(', ')}` : "EQUIPAMENTO APROVADO PARA USO (CONFORME)";
    doc.text(status, 20, 92, {maxWidth: 170});

    doc.text("OBSERVAÇÕES TÉCNICAS:", 20, 105);
    doc.setFontSize(9);
    doc.text(item.obs || "Nenhuma observação relevante.", 20, 112, {maxWidth: 170});

    if(currentImgs.length > 0) {
        currentImgs.forEach((img, i) => {
            doc.addImage(img, 'JPEG', 20 + (i*60), 130, 55, 55);
        });
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Este documento é um registro digital oficial da Ability Tecnologia.", 105, 285, {align: "center"});

    doc.save(`Laudo_Ability_${item.re}.pdf`);
}

function gerarRelatorioMensal() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const hist = JSON.parse(localStorage.getItem('ability_pro_v4') || '[]');
    const mes = new Date().getMonth() + 1;
    const dados = hist.filter(h => h.mes === mes);

    if(dados.length === 0) return alert("Sem dados para este mês.");

    doc.setFontSize(16);
    doc.text(`RESUMO MENSAL - MÊS ${mes}`, 20, 20);
    let y = 40;
    dados.forEach(i => {
        doc.text(`${i.data} | RE: ${i.re} | ${i.nome} | ${i.checks.length > 0 ? 'AVARIA' : 'OK'}`, 20, y);
        y += 8;
    });
    doc.save(`Relatorio_Mensal.pdf`);
}

function limparHistoricoGeral() {
    if(confirm("Apagar todos os dados?")) {
        localStorage.removeItem('ability_pro_v4');
        atualizarSidebar();
    }
}