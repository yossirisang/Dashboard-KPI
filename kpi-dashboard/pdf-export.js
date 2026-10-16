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

// Proses Export PDF Tim dengan Kontrol Halaman Pasti (Page 1 & Page 2 Strict)
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
    masterPdfContainer.style.width = "680px";
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
        let chartLabels = [];
        let chartSecondsData = [];

        for (let d = 1; d <= daysInSelectedMonth; d++) {
            const colIdx = 5 + d;
            const rawVal = ahtMatch ? getVal(ahtMatch, colIdx) : "";
            const formattedVal = formatAhtValue(rawVal);
            const secondsVal = parseAhtToSeconds(rawVal);

            chartLabels.push(`Tgl ${d}`);
            chartSecondsData.push(secondsVal);

            dailyGridHtml += `
                <div style="background-color: #f8fafc; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0; text-align: center;">
                    <span style="font-size: 8px; color: #94a3b8; font-weight: bold; display: block;">TGL ${d}</span>
                    <span style="font-size: 10px; font-weight: 800; color: #0f172a;">${formattedVal}</span>
                </div>
            `;
        }

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = 680;
        tempCanvas.height = 120;
        
        const tempChart = new Chart(tempCanvas.getContext("2d"), {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartSecondsData,
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.08)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 2
                }]
            },
            options: { responsive: false, animation: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { font: { size: 8 } } }, y: { beginAtZero: true, ticks: { font: { size: 8 } } } } }
        });

        const chartImgData = tempCanvas.toDataURL("image/png");
        tempChart.destroy();

        const agentBlock = document.createElement("div");
        agentBlock.innerHTML = `
            <!-- HALAMAN 1: RINGKASAN PERFORMANCE (STRICT PAGE) -->
            <div class="pdf-page" style="page-break-after: always; break-after: page; box-sizing: border-box; width: 680px; height: 980px; padding: 5px 0; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="border-bottom: 2px solid #dc2626; padding-bottom: 5px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-end;">
                        <div>
                            <h1 style="font-size: 14px; font-weight: bold; color: #dc2626; margin: 0;">KPI MONITORING PORTAL</h1>
                            <p style="font-size: 9px; color: #64748b; margin: 2px 0 0 0;">Agent Performance Evaluation Report</p>
                        </div>
                        <div style="text-align: right; font-size: 9px; color: #64748b;">
                            <p style="margin: 0;">Tanggal Cetak: <b>${dateNow}</b></p>
                            <p style="margin: 0;">Periode: <b style="color: #dc2626;">${monthText}</b></p>
                        </div>
                    </div>

                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; margin-bottom: 8px; display: flex; justify-content: space-between; font-size: 10px;">
                        <div>
                            <p style="margin: 0 0 2px 0;">Nama Agent: <b style="color: #0f172a; font-size: 11px;">${ag.nama}</b></p>
                            <p style="margin: 0;">SIAD: <b style="color: #0f172a;">${ag.siad || "-"}</b></p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 0 0 2px 0;">Team Leader: <b>${currentUser ? currentUser.tl || currentUser.nama : "-"}</b></p>
                            <p style="margin: 0;">Supervisor: <b>${currentUser ? currentUser.spv || "-" : "-"}</b></p>
                        </div>
                    </div>

                    <div style="font-size: 9px; font-weight: bold; color: #334155; margin-bottom: 8px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">
                        PAGE 1: RINGKASAN PERFORMANCE (FCR, SALES & RETENSI)
                    </div>

                    <div style="font-size: 10px;">
                        <div style="border-bottom: 1px solid #e2e8f0; font-weight: bold; padding-bottom: 2px; margin-bottom: 5px; color: #0f172a;">Report First Contact Resolution (FCR)</div>
                        <div style="display: flex; gap: 8px; margin-bottom: 6px;">
                            <div style="flex: 1; background: #eff6ff; padding: 6px 8px; border-radius: 6px; border: 1px solid #dbeafe;">
                                <div style="font-weight: bold; color: #1d4ed8; margin-bottom: 2px;">Interaksi</div>
                                <div style="display: flex; justify-content: space-between;"><span>Total Interaksi Mobile:</span><b>${intMobTot}</b></div>
                                <div style="display: flex; justify-content: space-between;"><span>Total Interaksi Fixed:</span><b>${intFixTot}</b></div>
                                <div style="display: flex; justify-content: space-between;"><span>Total Interaksi Reciprocal:</span><b>${intRecip}</b></div>
                            </div>
                            <div style="flex: 1; background: #fef2f2; padding: 6px 8px; border-radius: 6px; border: 1px solid #fee2e2;">
                                <div style="font-weight: bold; color: #b91c1c; margin-bottom: 2px;">Tiket KIP</div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>Total Tiket KIP Mobile:</span><b>${tktMobTot}</b></div>
                                <div style="display: flex; justify-content: space-between;"><span>Total Tiket KIP Fixed:</span><b>${tktFixTot}</b></div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 8px; margin-bottom: 6px;">
                            <div style="flex: 1; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px;">
                                    <span><b>%FCR Mobile</b></span><b style="color: #2563eb;">${fcrMobTot}</b>
                                </div>
                                <div style="display: flex; justify-content: space-around; margin-top: 4px; text-align: center;">
                                    <div><span style="font-size: 7px; color: #64748b;">K</span><br><b>${fcrMobK}</b></div>
                                    <div><span style="font-size: 7px; color: #64748b;">I</span><br><b>${fcrMobI}</b></div>
                                    <div><span style="font-size: 7px; color: #64748b;">P</span><br><b>${fcrMobP}</b></div>
                                </div>
                            </div>
                            <div style="flex: 1; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px;">
                                    <span><b>%FCR Fixed</b></span><b style="color: #dc2626;">${fcrFixTot}</b>
                                </div>
                                <div style="display: flex; justify-content: space-around; margin-top: 4px; text-align: center;">
                                    <div><span style="font-size: 7px; color: #64748b;">K</span><br><b>${fcrFixK}</b></div>
                                    <div><span style="font-size: 7px; color: #64748b;">I</span><br><b>${fcrFixI}</b></div>
                                    <div><span style="font-size: 7px; color: #64748b;">P</span><br><b>${fcrFixP}</b></div>
                                    <div><span style="font-size: 7px; color: #64748b;">Recip</span><br><b>${fcrFixRec}</b></div>
                                </div>
                            </div>
                        </div>

                        <div style="background: #ecfdf5; padding: 6px 10px; border-radius: 6px; border: 1px solid #a7f3d0; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <b style="color: #065f46;">%FCR ALL</b><b style="color: #047857; font-size: 12px;">${fcrAllVal}</b>
                        </div>

                        <div style="border-bottom: 1px solid #e2e8f0; font-weight: bold; padding-bottom: 2px; margin-bottom: 5px; color: #0f172a;">Report Sales</div>
                        <div style="display: flex; gap: 8px; margin-bottom: 6px;">
                            <div style="flex: 1; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                <div style="display: flex; justify-content: space-between;"><span>Sales Mobile:</span><b>${salesMob}</b></div>
                                <div style="display: flex; justify-content: space-between; margin-top: 2px;"><span>% Sales Mobile:</span><b style="color: #2563eb;">${pctMob}</b></div>
                            </div>
                            <div style="flex: 1; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                <div style="display: flex; justify-content: space-between;"><span>Sales Fixed:</span><b>${salesFix}</b></div>
                                <div style="display: flex; justify-content: space-between; margin-top: 2px;"><span>% Sales Fixed:</span><b style="color: #dc2626;">${pctFix}</b></div>
                            </div>
                        </div>

                        <div style="border-bottom: 1px solid #e2e8f0; font-weight: bold; padding-bottom: 2px; margin-bottom: 5px; color: #0f172a;">Report Retensi</div>
                        <div style="display: flex; gap: 8px; text-align: center;">
                            <div style="flex: 1; background: #faf5ff; padding: 6px; border-radius: 6px; border: 1px solid #f3e8ff;"><span style="font-size: 8px; color: #64748b;">Retensi</span><br><b style="color: #7e22ce;">${retensiVal}</b></div>
                            <div style="flex: 1; background: #faf5ff; padding: 6px; border-radius: 6px; border: 1px solid #f3e8ff;"><span style="font-size: 8px; color: #64748b;">KIP Retensi</span><br><b style="color: #7e22ce;">${kipRetensiVal}</b></div>
                            <div style="flex: 1; background: #faf5ff; padding: 6px; border-radius: 6px; border: 1px solid #f3e8ff;"><span style="font-size: 8px; color: #64748b;">% Retensi</span><br><b style="color: #7e22ce;">${pctRetensiVal}</b></div>
                        </div>
                    </div>
                </div>
                <div style="text-align: center; font-size: 8px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 4px;">Halaman 1 dari 2 (Ringkasan Kinerja Agen)</div>
            </div>

            <!-- HALAMAN 2: AHT HARIAN AGEN (STRICT PAGE) -->
            <div class="pdf-page" style="page-break-after: ${i === totalAgents - 1 ? 'avoid' : 'always'}; break-after: ${i === totalAgents - 1 ? 'avoid' : 'page'}; box-sizing: border-box; width: 680px; height: 980px; padding: 5px 0; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="border-bottom: 2px solid #dc2626; padding-bottom: 5px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-end;">
                        <div>
                            <h1 style="font-size: 14px; font-weight: bold; color: #dc2626; margin: 0;">KPI MONITORING PORTAL</h1>
                            <p style="font-size: 9px; color: #64748b; margin: 2px 0 0 0;">Average Handling Time (AHT) Detailed Report</p>
                        </div>
                        <div style="text-align: right; font-size: 9px; color: #64748b;">
                            <p style="margin: 0;">Agent: <b>${ag.nama}</b></p>
                            <p style="margin: 0;">Periode: <b style="color: #dc2626;">${monthText}</b></p>
                        </div>
                    </div>

                    <div style="font-size: 9px; font-weight: bold; color: #334155; margin-bottom: 8px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">
                        PAGE 2: AVERAGE HANDLING TIME (AHT) HARIAN
                    </div>

                    <div style="background: #fef2f2; padding: 6px 10px; border-radius: 6px; border: 1px solid #fecaca; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div><b style="font-size: 10px; color: #0f172a;">Average Handling Time (AHT) Total</b><p style="font-size: 8px; color: #64748b; margin: 0;">Akumulasi performa AHT bulanan agen</p></div>
                        <b style="font-size: 13px; color: #dc2626; background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #fee2e2;">${totalAhtFormatted}</b>
                    </div>

                    <div style="margin-bottom: 8px; border: 1px solid #e2e8f0; padding: 6px; border-radius: 6px;">
                        <div style="font-size: 9px; font-weight: bold; color: #334155; margin-bottom: 3px;">Grafik Tren AHT Harian</div>
                        <img src="${chartImgData}" style="width: 100%; height: 105px; object-fit: contain;" />
                    </div>

                    <div style="font-size: 9px; font-weight: bold; color: #334155; margin-bottom: 4px;">Rincian AHT Harian (${monthText})</div>
                    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 3px;">
                        ${dailyGridHtml}
                    </div>
                </div>
                <div style="text-align: center; font-size: 8px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 4px;">Halaman 2 dari 2 (AHT Harian Agen)</div>
            </div>
        `;

        masterPdfContainer.appendChild(agentBlock);
    }

    statusText.innerText = "Mengompilasi dan mengunduh PDF seluruh tim...";
    window.scrollTo(0, 0);

    const opt = {
        margin:       [6, 8, 6, 8],
        filename:     customFileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: 0, scrollX: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'], avoid: ['.pdf-page'] }
    };

    html2pdf().set(opt).from(masterPdfContainer).save().then(() => {
        btnExport.disabled = false;
        btnExport.innerHTML = `<i data-lucide="download" class="w-4 h-4"></i><span>Download Report</span>`;
        statusText.innerText = "Selesai mengunduh Laporan Tim PDF.";
        closeTeamExportModal();
        lucide.createIcons();
    }).catch(() => {
        btnExport.disabled = false;
        btnExport.innerHTML = `<i data-lucide="download" class="w-4 h-4"></i><span>Download Report</span>`;
        statusText.innerText = "Gagal memproses PDF tim.";
        lucide.createIcons();
    });
}

// Export PDF Agent Individual
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
        <div class="pdf-page" style="page-break-after: always; break-after: page; box-sizing: border-box; width: 680px; height: 980px; padding: 5px 0; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div style="border-bottom: 2px solid #dc2626; padding-bottom: 5px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <h1 style="font-size: 14px; font-weight: bold; color: #dc2626; margin: 0;">KPI MONITORING PORTAL</h1>
                        <p style="font-size: 9px; color: #64748b; margin: 2px 0 0 0;">Agent Performance Evaluation Report</p>
                    </div>
                    <div style="text-align: right; font-size: 9px; color: #64748b;">
                        <p style="margin: 0;">Tanggal Cetak: <b>${dateNow}</b></p>
                        <p style="margin: 0;">Periode: <b style="color: #dc2626;">${monthText}</b></p>
                    </div>
                </div>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; margin-bottom: 8px; display: flex; justify-content: space-between; font-size: 10px;">
                    <div>
                        <p style="margin: 0 0 2px 0;">Nama Agent: <b style="color: #0f172a; font-size: 11px;">${selectedAgentForModal.nama}</b></p>
                        <p style="margin: 0;">SIAD: <b style="color: #0f172a;">${selectedAgentForModal.siad || "-"}</b></p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0 0 2px 0;">Team Leader: <b>${currentUser ? currentUser.tl || currentUser.nama : "-"}</b></p>
                        <p style="margin: 0;">Supervisor: <b>${currentUser ? currentUser.spv || "-" : "-"}</b></p>
                    </div>
                </div>

                <div style="font-size: 9px; font-weight: bold; color: #334155; margin-bottom: 8px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">
                    PAGE 1: RINGKASAN PERFORMANCE (FCR, SALES & RETENSI)
                </div>

                <div id="pdfSummaryBody">
                    ${summaryHtml}
                </div>
            </div>
            <div style="text-align: center; font-size: 8px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 4px;">Halaman 1 dari 2 (Ringkasan Kinerja Agen)</div>
        </div>

        <div class="pdf-page" style="box-sizing: border-box; width: 680px; height: 980px; padding: 5px 0; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div style="border-bottom: 2px solid #dc2626; padding-bottom: 5px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <h1 style="font-size: 14px; font-weight: bold; color: #dc2626; margin: 0;">KPI MONITORING PORTAL</h1>
                        <p style="font-size: 9px; color: #64748b; margin: 2px 0 0 0;">Average Handling Time (AHT) Detailed Report</p>
                    </div>
                    <div style="text-align: right; font-size: 9px; color: #64748b;">
                        <p style="margin: 0;">Agent: <b>${selectedAgentForModal.nama}</b></p>
                        <p style="margin: 0;">Periode: <b style="color: #dc2626;">${monthText}</b></p>
                    </div>
                </div>

                <div style="font-size: 9px; font-weight: bold; color: #334155; margin-bottom: 8px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">
                    PAGE 2: AVERAGE HANDLING TIME (AHT) HARIAN
                </div>

                <div id="pdfAhtBody">
                    ${ahtHtml}
                </div>
            </div>
            <div style="text-align: center; font-size: 8px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 4px;">Halaman 2 dari 2 (AHT Harian Agen)</div>
        </div>
    `;

    if (ahtImgData) {
        const canvasInPdf = pdfContainer.querySelector("#ahtChartCanvas");
        if (canvasInPdf && canvasInPdf.parentElement) {
            canvasInPdf.parentElement.innerHTML = `<img src="${ahtImgData}" style="width: 100%; height: 110px; object-fit: contain;" />`;
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
        margin:       [6, 8, 6, 8],
        filename:     `Report (${selectedAgentForModal.nama}).pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: 0, scrollX: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'], avoid: ['.pdf-page'] }
    };

    html2pdf().set(opt).from(pdfContainer).save().then(() => {
        btnDownload.innerText = "Download Report";
        btnDownload.disabled = false;
    }).catch(() => {
        btnDownload.innerText = "Download Report";
        btnDownload.disabled = false;
    });
}
