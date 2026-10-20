// Modal Pilihan Bulan PDF Tim
function openTeamExportModal() {
    document.getElementById("teamExportModal").classList.remove("hidden");
    selectTeamExportMonth("2026-10");
}

function closeTeamExportModal() {
    document.getElementById("teamExportModal").classList.add("hidden");
}

function selectTeamExportMonth(mKey) {
    selectedTeamMonth = mKey;
    const btnSep = document.getElementById("btnTeamMonthSep");
    const btnOkt = document.getElementById("btnTeamMonthOkt");

    if (mKey === "2026-09") {
        btnSep.className = "p-3 border-2 border-red-600 bg-red-50 text-red-600 rounded-xl font-bold text-xs transition text-center shadow-sm";
        btnOkt.className = "p-3 border-2 border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:border-red-500 transition text-center";
    } else {
        btnOkt.className = "p-3 border-2 border-red-600 bg-red-50 text-red-600 rounded-xl font-bold text-xs transition text-center shadow-sm";
        btnSep.className = "p-3 border-2 border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:border-red-500 transition text-center";
    }
}

// 1. KODE EXPORT PDF TIM (1 AGEN = 1 HALAMAN A4 STANDAR, AMAN & TIDAK MELUBER)
async function processTeamPdfExport() {
    if (!filteredAgentList || filteredAgentList.length === 0) {
        alert("Tidak ada data agen untuk di-export.");
        return;
    }

    const btnExport = document.getElementById("btnStartTeamExport");
    const statusText = document.getElementById("teamExportStatusText");

    btnExport.disabled = true;
    btnExport.innerHTML = `<span>Memproses Report...</span>`;

    const currentUser = JSON.parse(localStorage.getItem("active_user"));
    const monthText = (selectedTeamMonth === "2026-09") ? "September 2026" : "Oktober 2026";
    const dateNow = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
    
    const tlName = currentUser ? (currentUser.tl || currentUser.nama || "Admin") : "Team";
    const customFileName = `Laporan Tim ${tlName} (${monthText}).pdf`;

    const monthUrls = CONFIG.MONTHLY_METRICS[selectedTeamMonth];
    if (!monthUrls) {
        alert("Link data bulan ini tidak ditemukan.");
        btnExport.disabled = false;
        btnExport.innerHTML = `<i data-lucide="download" class="w-4 h-4"></i><span>Download Report</span>`;
        lucide.createIcons();
        return;
    }

    statusText.innerText = "Mengunduh seluruh data report dari Google Sheets...";

    const [fcrRows, salesRows, retensiRows, ahtRows] = await Promise.all([
        fetchCsvData(monthUrls.fcr, 0),
        fetchCsvData(monthUrls.sales_report, 0),
        fetchCsvData(monthUrls.retensi_report, 0),
        fetchCsvData(monthUrls.aht_report, 0)
    ]);

    const masterPdfContainer = document.createElement("div");
    masterPdfContainer.style.width = "720px";
    masterPdfContainer.style.margin = "0 auto";
    masterPdfContainer.style.backgroundColor = "#ffffff";
    masterPdfContainer.style.color = "#1e293b";
    masterPdfContainer.style.fontFamily = "sans-serif";

    const totalAgents = filteredAgentList.length;

    for (let i = 0; i < totalAgents; i++) {
        const ag = filteredAgentList[i];
        statusText.innerText = `Menyusun dokumen PDF agen (${i + 1}/${totalAgents}): ${ag.nama}...`;

        const targetSiad = (ag.siad || "").toLowerCase().trim();
        const targetNama = (ag.nama || "").toLowerCase().trim();

        const findAgentRow = (rows) => {
            if (!rows || rows.length === 0) return null;
            return rows.find(r => {
                const s = getVal(r, 1).toLowerCase().trim();
                const n = getVal(r, 3).toLowerCase().trim();
                return (targetSiad !== "" && s === targetSiad) || 
                       (targetNama !== "" && n === targetNama) ||
                       (targetNama !== "" && n.includes(targetNama));
            });
        };

        const fcrMatch = findAgentRow(fcrRows);
        const salesMatch = findAgentRow(salesRows);
        const retensiMatch = findAgentRow(retensiRows);
        const ahtMatch = findAgentRow(ahtRows);

        const intMobTot = fcrMatch ? getVal(fcrMatch, 11) || "0" : "0";  
        const intFixTot = fcrMatch ? getVal(fcrMatch, 17) || "0" : "0";  
        const intRecip  = fcrMatch ? getVal(fcrMatch, 18) || "0" : "0";  
        const tktMobTot = fcrMatch ? getVal(fcrMatch, 22) || "0" : "0";  
        const tktFixTot = fcrMatch ? getVal(fcrMatch, 26) || "0" : "0";  

        const fcrMobK   = fcrMatch ? getVal(fcrMatch, 28) || "0%" : "0%"; 
        const fcrMobI   = fcrMatch ? getVal(fcrMatch, 29) || "0%" : "0%"; 
        const fcrMobP   = fcrMatch ? getVal(fcrMatch, 30) || "0%" : "0%"; 
        const fcrMobTot = fcrMatch ? getVal(fcrMatch, 31) || "0%" : "0%"; 

        const fcrFixK   = fcrMatch ? getVal(fcrMatch, 32) || "0%" : "0%"; 
        const fcrFixI   = fcrMatch ? getVal(fcrMatch, 33) || "0%" : "0%"; 
        const fcrFixP   = fcrMatch ? getVal(fcrMatch, 34) || "0%" : "0%"; 
        const fcrFixTot = fcrMatch ? getVal(fcrMatch, 35) || "0%" : "0%"; 
        const fcrFixRec = fcrMatch ? getVal(fcrMatch, 36) || "0%" : "0%"; 

        const fcrAllVal = fcrMatch ? getVal(fcrMatch, 37) || "0%" : "0%";

        const salesMob = salesMatch ? getVal(salesMatch, 6) || "0" : "0";  
        const salesFix = salesMatch ? getVal(salesMatch, 7) || "0" : "0";  
        const pctMob   = salesMatch ? getVal(salesMatch, 10) || "0%" : "0%"; 
        const pctFix   = salesMatch ? getVal(salesMatch, 11) || "0%" : "0%"; 

        const retensiVal    = retensiMatch ? getVal(retensiMatch, 6) || "0" : "0";  
        const kipRetensiVal = retensiMatch ? getVal(retensiMatch, 7) || "0" : "0";  
        const pctRetensiVal = retensiMatch ? getVal(retensiMatch, 8) || "0%" : "0%"; 

        const rawTotalAht = ahtMatch ? getVal(ahtMatch, 37) : "-";
        const totalAhtFormatted = formatAhtValue(rawTotalAht);

        const [year, month] = selectedTeamMonth.split("-").map(Number);
        const daysInSelectedMonth = new Date(year, month, 0).getDate();

        let dailyGridHtml = "";
        for (let d = 1; d <= daysInSelectedMonth; d++) {
            const colIdx = 5 + d;
            const rawVal = ahtMatch ? getVal(ahtMatch, colIdx) : "";
            const formattedVal = formatAhtValue(rawVal);

            dailyGridHtml += `
                <div style="background-color: #f8fafc; padding: 3px 2px; border-radius: 3px; border: 1px solid #e2e8f0; text-align: center;">
                    <span style="font-size: 6px; color: #94a3b8; font-weight: bold; display: block;">TGL ${d}</span>
                    <span style="font-size: 8px; font-weight: 800; color: #0f172a;">${formattedVal}</span>
                </div>
            `;
        }

        const agentBlock = document.createElement("div");
        agentBlock.innerHTML = `
            <div style="page-break-after: always; break-after: page; box-sizing: border-box; width: 720px; padding: 5px 0 10px 0;">
                <div style="border-bottom: 2px solid #dc2626; padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <h1 style="font-size: 13px; font-weight: bold; color: #dc2626; margin: 0;">KPI MONITORING PORTAL</h1>
                        <p style="font-size: 8px; color: #64748b; margin: 1px 0 0 0;">Agent Comprehensive Evaluation Report</p>
                    </div>
                    <div style="text-align: right; font-size: 8px; color: #64748b;">
                        <p style="margin: 0;">Tanggal Cetak: <b>${dateNow}</b></p>
                        <p style="margin: 0;">Periode: <b style="color: #dc2626;">${monthText}</b></p>
                    </div>
                </div>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 5px 8px; margin-bottom: 6px; display: flex; justify-content: space-between; font-size: 9px;">
                    <div>
                        <p style="margin: 0 0 1px 0;">Nama Agent: <b style="color: #0f172a; font-size: 10px;">${ag.nama}</b></p>
                        <p style="margin: 0;">SIAD: <b style="color: #0f172a;">${ag.siad || "-"}</b></p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0 0 1px 0;">Team Leader: <b>${currentUser ? currentUser.tl || currentUser.nama : "-"}</b></p>
                        <p style="margin: 0;">Supervisor: <b>${currentUser ? currentUser.spv || "-" : "-"}</b></p>
                    </div>
                </div>

                <!-- 1. RINGKASAN PERFORMANCE -->
                <div style="font-size: 8px; font-weight: bold; color: #334155; margin-bottom: 4px; background: #f1f5f9; padding: 3px 6px; border-radius: 3px;">
                    1. RINGKASAN PERFORMANCE (FCR, SALES & RETENSI)
                </div>

                <div style="font-size: 9px; margin-bottom: 6px;">
                    <div style="display: flex; gap: 6px; margin-bottom: 4px;">
                        <div style="flex: 1; background: #eff6ff; padding: 4px 6px; border-radius: 4px; border: 1px solid #dbeafe;">
                            <div style="font-weight: bold; color: #1d4ed8; margin-bottom: 1px; font-size: 8px;">Interaksi</div>
                            <div style="display: flex; justify-content: space-between;"><span>Mobile:</span><b>${intMobTot}</b></div>
                            <div style="display: flex; justify-content: space-between;"><span>Fixed:</span><b>${intFixTot}</b></div>
                            <div style="display: flex; justify-content: space-between;"><span>Reciprocal:</span><b>${intRecip}</b></div>
                        </div>
                        <div style="flex: 1; background: #fef2f2; padding: 4px 6px; border-radius: 4px; border: 1px solid #fee2e2;">
                            <div style="font-weight: bold; color: #b91c1c; margin-bottom: 1px; font-size: 8px;">Tiket KIP</div>
                            <div style="display: flex; justify-content: space-between;"><span>Mobile:</span><b>${tktMobTot}</b></div>
                            <div style="display: flex; justify-content: space-between;"><span>Fixed:</span><b>${tktFixTot}</b></div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 6px; margin-bottom: 4px;">
                        <div style="flex: 1; background: #f8fafc; padding: 4px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px;">
                                <span><b>%FCR Mobile</b></span><b style="color: #2563eb;">${fcrMobTot}</b>
                            </div>
                            <div style="display: flex; justify-content: space-around; margin-top: 2px; text-align: center;">
                                <div><span style="font-size: 6px; color: #64748b;">K:</span><b>${fcrMobK}</b></div>
                                <div><span style="font-size: 6px; color: #64748b;">I:</span><b>${fcrMobI}</b></div>
                                <div><span style="font-size: 6px; color: #64748b;">P:</span><b>${fcrMobP}</b></div>
                            </div>
                        </div>
                        <div style="flex: 1; background: #f8fafc; padding: 4px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px;">
                                <span><b>%FCR Fixed</b></span><b style="color: #dc2626;">${fcrFixTot}</b>
                            </div>
                            <div style="display: flex; justify-content: space-around; margin-top: 2px; text-align: center;">
                                <div><span style="font-size: 6px; color: #64748b;">K:</span><b>${fcrFixK}</b></div>
                                <div><span style="font-size: 6px; color: #64748b;">I:</span><b>${fcrFixI}</b></div>
                                <div><span style="font-size: 6px; color: #64748b;">P:</span><b>${fcrFixP}</b></div>
                                <div><span style="font-size: 6px; color: #64748b;">Rec:</span><b>${fcrFixRec}</b></div>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 6px;">
                        <div style="flex: 1.2; background: #ecfdf5; padding: 4px 8px; border-radius: 4px; border: 1px solid #a7f3d0; display: flex; justify-content: space-between; align-items: center;">
                            <b style="color: #065f46; font-size: 8px;">%FCR ALL</b><b style="color: #047857; font-size: 10px;">${fcrAllVal}</b>
                        </div>
                        <div style="flex: 1; background: #faf5ff; padding: 4px 8px; border-radius: 4px; border: 1px solid #f3e8ff; display: flex; justify-content: space-between; align-items: center;">
                            <b style="color: #7e22ce; font-size: 8px;">% Retensi:</b><b style="color: #7e22ce; font-size: 10px;">${pctRetensiVal}</b>
                        </div>
                    </div>
                </div>

                <!-- 2. AVERAGE HANDLING TIME (AHT) -->
                <div style="font-size: 8px; font-weight: bold; color: #334155; margin-bottom: 4px; background: #f1f5f9; padding: 3px 6px; border-radius: 3px;">
                    2. AVERAGE HANDLING TIME (AHT) AKUMULASI & HARIAN
                </div>

                <div style="background: #fef2f2; padding: 4px 8px; border-radius: 4px; border: 1px solid #fecaca; display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <b style="font-size: 9px; color: #0f172a;">AHT Total:</b>
                    <b style="font-size: 11px; color: #dc2626; background: #ffffff; padding: 1px 6px; border-radius: 3px; border: 1px solid #fee2e2;">${totalAhtFormatted}</b>
                </div>

                <div style="font-size: 8px; font-weight: bold; color: #334155; margin-bottom: 3px;">Rincian AHT Harian (${monthText})</div>
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px;">
                    ${dailyGridHtml}
                </div>

                <div style="text-align: center; font-size: 7px; color: #94a3b8; border-top: 1px solid #e2e8f0; margin-top: 10px; padding-top: 4px;">Laporan Resmi KPI Monitoring Portal — Agen: ${ag.nama}</div>
            </div>
        `;

        masterPdfContainer.appendChild(agentBlock);
    }

    statusText.innerText = "Mengompilasi dan mengunduh PDF seluruh tim...";
    window.scrollTo(0, 0);

    setTimeout(() => {
        const opt = {
            margin:       [6, 6, 6, 6],
            filename:     customFileName,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: 0, scrollX: 0 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['css', 'legacy'] }
        };

        html2pdf().set(opt).from(masterPdfContainer).save().then(() => {
            btnExport.disabled = false;
            btnExport.innerHTML = `<i data-lucide="download" class="w-4 h-4"></i><span>Download Report</span>`;
            statusText.innerText = "Selesai mengunduh Laporan Tim PDF.";
            closeTeamExportModal();
            lucide.createIcons();
        }).catch((err) => {
            console.error(err);
            btnExport.disabled = false;
            btnExport.innerHTML = `<i data-lucide="download" class="w-4 h-4"></i><span>Download Report</span>`;
            statusText.innerText = "Gagal memproses PDF tim.";
            lucide.createIcons();
        });
    }, 600);
}

// 2. KODE EXPORT PDF PERORANGAN (TETAP AMAN DAN STABIL SEPERTI SEMULA)
async function exportAgentPdf() {
    if (!selectedAgentForModal) return;

    const btnDownload = document.getElementById("btnDownloadAgentPdf");
    btnDownload.innerText = "Mengunduh...";
    btnDownload.disabled = true;

    const monthText = (selectedReportMonth === "2026-09") ? "September 2026" : "Oktober 2026";
    const dateNow = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
    const currentUser = JSON.parse(localStorage.getItem("active_user"));

    const initialTab = activeModalTab;

    await switchModalTab("summary");
    const summaryHtml = document.getElementById("modalReportContent").innerHTML;

    await switchModalTab("aht");
    await new Promise(r => setTimeout(r, 250));
    
    const ahtCanvas = document.getElementById("ahtChartCanvas");
    let ahtImgData = "";
    if (ahtCanvas) {
        ahtImgData = ahtCanvas.toDataURL("image/png");
    }
    const ahtHtml = document.getElementById("modalReportContent").innerHTML;

    await switchModalTab(initialTab);

    const pdfContainer = document.createElement("div");
    pdfContainer.style.width = "680px";
    pdfContainer.style.margin = "0 auto";
    pdfContainer.style.backgroundColor = "#ffffff";
    pdfContainer.style.color = "#1e293b";
    pdfContainer.style.fontFamily = "sans-serif";

    pdfContainer.innerHTML = `
        <div style="page-break-after: always; break-after: page; box-sizing: border-box; width: 680px; padding: 10px 0 20px 0;">
            <div style="border-bottom: 2px solid #dc2626; padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <h1 style="font-size: 13px; font-weight: bold; color: #dc2626; margin: 0;">KPI MONITORING PORTAL</h1>
                    <p style="font-size: 8px; color: #64748b; margin: 1px 0 0 0;">Agent Performance Evaluation Report</p>
                </div>
                <div style="text-align: right; font-size: 8px; color: #64748b;">
                    <p style="margin: 0;">Tanggal Cetak: <b>${dateNow}</b></p>
                    <p style="margin: 0;">Periode: <b style="color: #dc2626;">${monthText}</b></p>
                </div>
            </div>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; margin-bottom: 6px; display: flex; justify-content: space-between; font-size: 10px;">
                <div>
                    <p style="margin: 0 0 1px 0;">Nama Agent: <b style="color: #0f172a; font-size: 11px;">${selectedAgentForModal.nama}</b></p>
                    <p style="margin: 0;">SIAD: <b style="color: #0f172a;">${selectedAgentForModal.siad || "-"}</b></p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0 0 1px 0;">Team Leader: <b>${currentUser ? currentUser.tl || currentUser.nama : "-"}</b></p>
                    <p style="margin: 0;">Supervisor: <b>${currentUser ? currentUser.spv || "-" : "-"}</b></p>
                </div>
            </div>

            <div style="font-size: 9px; font-weight: bold; color: #334155; margin-bottom: 6px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">
                PAGE 1: RINGKASAN PERFORMANCE (FCR, SALES & RETENSI)
            </div>

            <div id="pdfSummaryBody">
                ${summaryHtml}
            </div>

            <div style="text-align: center; font-size: 8px; color: #94a3b8; border-top: 1px solid #f1f5f9; margin-top: 10px; padding-top: 4px;">Halaman 1 dari 2 (Ringkasan Kinerja Agen)</div>
        </div>

        <div style="box-sizing: border-box; width: 680px; padding: 10px 0 20px 0;">
            <div style="border-bottom: 2px solid #dc2626; padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <h1 style="font-size: 13px; font-weight: bold; color: #dc2626; margin: 0;">KPI MONITORING PORTAL</h1>
                    <p style="font-size: 8px; color: #64748b; margin: 1px 0 0 0;">Average Handling Time (AHT) Detailed Report</p>
                </div>
                <div style="text-align: right; font-size: 8px; color: #64748b;">
                    <p style="margin: 0;">Agent: <b>${selectedAgentForModal.nama}</b></p>
                    <p style="margin: 0;">Periode: <b style="color: #dc2626;">${monthText}</b></p>
                </div>
            </div>

            <div style="font-size: 9px; font-weight: bold; color: #334155; margin-bottom: 6px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">
                PAGE 2: AVERAGE HANDLING TIME (AHT) HARIAN
            </div>

            <div id="pdfAhtBody">
                ${ahtHtml}
            </div>

            <div style="text-align: center; font-size: 8px; color: #94a3b8; border-top: 1px solid #f1f5f9; margin-top: 10px; padding-top: 4px;">Halaman 2 dari 2 (AHT Harian Agen)</div>
        </div>
    `;

    if (ahtImgData) {
        const canvasInPdf = pdfContainer.querySelector("#ahtChartCanvas");
        if (canvasInPdf && canvasInPdf.parentElement) {
            canvasInPdf.parentElement.innerHTML = `<img src="${ahtImgData}" style="width: 100%; height: 95px; object-fit: contain;" />`;
        }
    }

    const gridElem = pdfContainer.querySelector("#pdfAhtBody .grid");
    if (gridElem) {
        gridElem.style.display = "grid";
        gridElem.style.gridTemplateColumns = "repeat(6, 1fr)";
        gridElem.style.gap = "3px";
    }

    window.scrollTo(0, 0);

    const opt = {
        margin:       [4, 6, 4, 6],
        filename:     `Report (${selectedAgentForModal.nama}).pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: 0, scrollX: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
    };

    html2pdf().set(opt).from(pdfContainer).save().then(() => {
        btnDownload.innerText = "Download Report";
        btnDownload.disabled = false;
    }).catch((err) => {
        console.error(err);
        btnDownload.innerText = "Download Report";
        btnDownload.disabled = false;
    });
}
