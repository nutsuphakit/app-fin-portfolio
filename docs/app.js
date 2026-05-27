document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const CONFIG = {
        GAS_URL: '', // User to paste Web App URL here
        THEME_KEY: 'fin_portfolio_theme',
        INCOGNITO_KEY: 'fin_portfolio_incognito'
    };

    try {
        if (typeof ChartDataLabels !== 'undefined') {
            Chart.register(ChartDataLabels);
        }
    } catch (e) { console.warn('ChartDataLabels not found'); }

    // --- XML Storage Manager ---
    const XMLStorageManager = {
        STORAGE_KEY: 'fin_portfolio_xml_data',
        LOGS_KEY: 'fin_portfolio_xml_logs',

        save: function(portfolioData) {
            if (!portfolioData) return;
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<portfolio>\n';
            portfolioData.forEach(item => {
                xml += '  <asset>\n';
                xml += `    <name>${this.escapeXML(item.name || '')}</name>\n`;
                xml += `    <platform>${this.escapeXML(item.platform || '')}</platform>\n`;
                xml += `    <category>${this.escapeXML(item.category || '')}</category>\n`;
                xml += `    <value>${item.value || 0}</value>\n`;
                xml += `    <currency>${item.currency || 'THB'}</currency>\n`;
                xml += `    <valueTHB>${item.Value_in_THB || 0}</valueTHB>\n`;
                xml += `    <lastUpdated>${item.date || new Date().toISOString()}</lastUpdated>\n`;
                xml += '  </asset>\n';
            });
            xml += '</portfolio>';
            localStorage.setItem(this.STORAGE_KEY, xml);
        },

        saveLogs: function(logs) {
            if (!logs) return;
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<logs>\n';
            logs.forEach(log => {
                xml += '  <entry>\n';
                xml += `    <date>${log.date || new Date().toISOString()}</date>\n`;
                xml += `    <name>${this.escapeXML(log.name || '')}</name>\n`;
                xml += `    <platform>${this.escapeXML(log.platform || '')}</platform>\n`;
                xml += `    <category>${this.escapeXML(log.category || '')}</category>\n`;
                xml += `    <value>${log.value || 0}</value>\n`;
                xml += `    <currency>${log.currency || 'THB'}</currency>\n`;
                xml += `    <valueTHB>${log.Value_in_THB || 0}</valueTHB>\n`;
                xml += '  </entry>\n';
            });
            xml += '</logs>';
            localStorage.setItem(this.LOGS_KEY, xml);
        },

        load: function() {
            const xmlString = localStorage.getItem(this.STORAGE_KEY);
            if (!xmlString) return null;
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlString, "text/xml");
                if (xmlDoc.getElementsByTagName("parsererror").length > 0) return null;
                const assets = xmlDoc.getElementsByTagName("asset");
                const data = [];
                for (let i = 0; i < assets.length; i++) {
                    const a = assets[i];
                    data.push({
                        name: a.getElementsByTagName("name")[0]?.textContent || 'Unknown',
                        platform: a.getElementsByTagName("platform")[0]?.textContent || 'Unknown',
                        category: a.getElementsByTagName("category")[0]?.textContent || 'Other',
                        value: parseFloat(a.getElementsByTagName("value")[0]?.textContent || '0'),
                        currency: a.getElementsByTagName("currency")[0]?.textContent || 'THB',
                        Value_in_THB: parseFloat(a.getElementsByTagName("valueTHB")[0]?.textContent || '0'),
                        date: a.getElementsByTagName("lastUpdated")[0]?.textContent || new Date().toISOString()
                    });
                }
                return data;
            } catch (e) { return null; }
        },

        loadLogs: function() {
            const xmlString = localStorage.getItem(this.LOGS_KEY);
            if (!xmlString) return [];
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlString, "text/xml");
                if (xmlDoc.getElementsByTagName("parsererror").length > 0) return [];
                const entries = xmlDoc.getElementsByTagName("entry");
                const logs = [];
                for (let i = 0; i < entries.length; i++) {
                    const e = entries[i];
                    logs.push({
                        date: e.getElementsByTagName("date")[0]?.textContent || new Date().toISOString(),
                        name: e.getElementsByTagName("name")[0]?.textContent || 'Unknown',
                        platform: e.getElementsByTagName("platform")[0]?.textContent || 'Unknown',
                        category: e.getElementsByTagName("category")[0]?.textContent || 'Other',
                        value: parseFloat(e.getElementsByTagName("value")[0]?.textContent || '0'),
                        currency: e.getElementsByTagName("currency")[0]?.textContent || 'THB',
                        Value_in_THB: parseFloat(e.getElementsByTagName("valueTHB")[0]?.textContent || '0')
                    });
                }
                return logs;
            } catch (e) { return []; }
        },

        escapeXML: function(str) {
            return str.toString().replace(/[<>&"']/g, m => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[m]));
        }
    };

    // --- State ---
    let state = {
        theme: localStorage.getItem(CONFIG.THEME_KEY) || 'dark',
        isIncognito: localStorage.getItem(CONFIG.INCOGNITO_KEY) === 'true',
        activeView: 'dashboard',
        allocationView: 'category',
        barPeriod: 'W',
        portfolioData: XMLStorageManager.load() || [],
        logs: XMLStorageManager.loadLogs() || [],
        exchangeRates: { 'USD': 36.5, 'EUR': 39.5, 'JPY': 0.24, 'THB': 1 }
    };

    // --- DOM Elements ---
    const body = document.documentElement;
    const views = document.querySelectorAll('.view');
    const totalValueDisplay = document.getElementById('total-value');
    const donutCenterDisplay = document.getElementById('donut-center-value');
    const categorySelect = document.getElementById('category');
    const assetNameInput = document.getElementById('asset-name');
    const assetNameList = document.getElementById('asset-name-list');
    const platformSelect = document.getElementById('platform');
    const currencySelect = document.getElementById('currency');
    const valueInput = document.getElementById('value');
    const dateInput = document.getElementById('transaction-date');
    const entryForm = document.getElementById('entry-form');
    const subDonutCard = document.getElementById('sub-donut-card');
    const subDonutTitle = document.getElementById('sub-donut-title');
    const historyBody = document.getElementById('history-body');
    const incognitoToggle = document.getElementById('incognito-toggle');
    const themeToggle = document.getElementById('theme-toggle');
    const aiPromptBtn = document.getElementById('ai-prompt-btn');
    const toggleAllocationViewBtn = document.getElementById('toggle-allocation-view');
    const exportXmlBtn = document.getElementById('export-xml-btn');

    // --- Cloud Sync ---
    async function syncWithCloud() {
        if (!CONFIG.GAS_URL) return;
        try {
            const res = await fetch(CONFIG.GAS_URL);
            const data = await res.json();
            if (data.status === 'success') {
                state.portfolioData = data.portfolio.map(item => ({
                    name: item.Application || item.name,
                    platform: item.platform || 'Unknown',
                    category: item.Category || item.category,
                    currency: item.Currency || item.currency,
                    value: parseFloat(item.Input_Value || item.value),
                    Value_in_THB: parseFloat(item.Value_in_THB),
                    date: item.Last_Updated || item.date
                }));
                state.logs = data.logs.map(log => ({
                    date: log.Timestamp || log.date,
                    name: log.Application || log.name,
                    platform: log.platform || 'Unknown',
                    category: log.Category || log.category,
                    currency: log.Currency || log.currency,
                    value: parseFloat(log.Input_Value || log.value),
                    Value_in_THB: parseFloat(log.Value_in_THB)
                }));
                XMLStorageManager.save(state.portfolioData);
                XMLStorageManager.saveLogs(state.logs);
                updateUI();
            }
        } catch (e) { console.error('Cloud Sync failed:', e); }
    }

    // --- Logic: Dynamic Name Dropdown ---
    const ASSET_NAMES = {
        'Thai Stocks': ['AOT', 'PTT', 'CPALL', 'ADVANC', 'SCB', 'KBANK'],
        'US Stocks': ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'AMZN'],
        'Crypto Assets': ['BTC', 'ETH', 'BNB', 'SOL', 'USDT', 'XRP'],
        'Stablecoins': ['USDT', 'USDC', 'DAI'],
        'Gold': ['Physical Gold', 'Paper Gold', 'Gold Bullion'],
        'Cash / Savings': ['Savings Account', 'Fixed Deposit', 'Cash']
    };

    categorySelect.addEventListener('change', (e) => {
        const cat = e.target.value;
        assetNameList.innerHTML = '';
        const names = ASSET_NAMES[cat] || [];
        names.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            assetNameList.appendChild(opt);
        });
        assetNameInput.value = names[0] || '';
    });

    // --- Logic: History Table ---
    function renderHistoryTable() {
        if (!historyBody) return;
        historyBody.innerHTML = '';
        const sorted = [...state.logs].sort((a,b) => new Date(b.date) - new Date(a.date));
        sorted.forEach(item => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid var(--border-subtle)';
            const d = new Date(item.date).toLocaleString('th-TH', { month:'short', day:'numeric', year:'2-digit' });
            const valFormatted = PortfolioLogic.formatCurrency(item.value, item.currency, state.isIncognito).split(' ')[0];
            const valThbFormatted = PortfolioLogic.formatCurrency(item.Value_in_THB, 'THB', state.isIncognito).split(' ')[0];
            
            row.innerHTML = `
                <td style="padding:1rem; font-size:0.8rem; color:var(--text-dim);">${d}</td>
                <td style="padding:1rem; font-weight:600;">${item.name}</td>
                <td style="padding:1rem;">${item.platform}</td>
                <td style="padding:1rem; color:var(--text-muted);">${item.category}</td>
                <td style="padding:1rem; text-align:right;">${valFormatted}</td>
                <td style="padding:1rem; text-align:center;">${item.currency}</td>
                <td style="padding:1rem; text-align:right; font-weight:700;">${valThbFormatted}</td>
                <td style="padding:1rem; text-align:right;">
                    <button class="btn-neutral" style="color:var(--status-error);" onclick="deleteLogEntry(${state.logs.indexOf(item)})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            historyBody.appendChild(row);
        });
    }

    window.deleteLogEntry = (idx) => {
        if (confirm('Delete log?')) {
            state.logs.splice(idx, 1);
            XMLStorageManager.saveLogs(state.logs);
            updateUI();
            renderHistoryTable();
        }
    };

    // --- Charts ---
    let allocationChart, subAllocationChart, trendChart, changeChart;

    function initCharts() {
        const commonOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                datalabels: {
                    display: (ctx) => !state.isIncognito && (ctx.dataset.data[ctx.dataIndex] > 0),
                    color: () => getComputedStyle(body).getPropertyValue('--text-main'),
                    font: { size: 10, weight: 'bold' }
                }
            }
        };

        try {
            allocationChart = new Chart(document.getElementById('allocationChart'), {
                type: 'doughnut',
                data: PortfolioLogic.getAllocationData(state.portfolioData, state.exchangeRates, state.allocationView),
                options: {
                    ...commonOptions,
                    onHover: (event, elements) => {
                        if (elements.length > 0) {
                            const index = elements[0].index;
                            const category = allocationChart.data.labels[index];
                            showSubDonut(category, event);
                        } else {
                            subDonutCard.classList.add('hidden');
                        }
                    },
                    cutout: '70%'
                }
            });

            document.querySelector('.donut-container').addEventListener('mouseleave', () => {
                subDonutCard.classList.add('hidden');
            });

            subAllocationChart = new Chart(document.getElementById('subAllocationChart'), {
                type: 'doughnut',
                data: { labels: [], datasets: [{ data: [] }] },
                options: { ...commonOptions, cutout: '60%' }
            });

            trendChart = new Chart(document.getElementById('trendChart'), {
                type: 'line',
                data: getTrendData(),
                options: {
                    ...commonOptions,
                    layout: { padding: { top: 20 } },
                    scales: { x: { ticks: { color: '#64748b' } }, y: { display: false } },
                    plugins: {
                        ...commonOptions.plugins,
                        datalabels: { ...commonOptions.plugins.datalabels, align: 'top', formatter: (v) => PortfolioLogic.formatValue(v) }
                    }
                }
            });

            changeChart = new Chart(document.getElementById('changeChart'), {
                type: 'bar',
                data: getChangeData(),
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { top: 30, bottom: 10 } },
                    plugins: {
                        legend: { display: false },
                        datalabels: {
                            display: () => !state.isIncognito,
                            color: () => getComputedStyle(body).getPropertyValue('--text-main') || '#fff',
                            font: { size: 10, weight: 'bold' },
                            anchor: (ctx) => ctx.dataset.data[ctx.dataIndex] >= 0 ? 'end' : 'start',
                            align: (ctx) => ctx.dataset.data[ctx.dataIndex] >= 0 ? 'top' : 'bottom',
                            formatter: (v) => PortfolioLogic.formatValue(v)
                        }
                    },
                    scales: {
                        x: { 
                            grid: { display: false }, 
                            ticks: { color: '#64748b', font: { size: 10 } } 
                        },
                        y: { 
                            display: true,
                            beginAtZero: false,
                            grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                            ticks: { display: false }
                        }
                    }
                }
            });
        } catch (e) { console.error('Chart initialization failed:', e); }
    }

    function showSubDonut(category, event) {
        const assets = state.portfolioData.filter(a => a.category === category);
        if (assets.length === 0) return;

        subDonutTitle.textContent = `${category} Detail`;
        subDonutCard.classList.remove('hidden');
        
        const x = event.x + 20;
        const y = event.y - 100;
        subDonutCard.style.left = `${x}px`;
        subDonutCard.style.top = `${y}px`;

        const total = assets.reduce((acc, a) => acc + (a.value * (state.exchangeRates[a.currency] || 1)), 0);
        subAllocationChart.data = {
            labels: assets.map(a => a.name),
            datasets: [{
                data: assets.map(a => a.value * (state.exchangeRates[a.currency] || 1)),
                backgroundColor: ['#6366f1','#a855f7','#ec4899','#f43f5e','#f59e0b','#10b981'],
                borderWidth: 0,
                datalabels: {
                    formatter: (v) => total > 0 ? ((v / total) * 100).toFixed(0) + '%' : '0%'
                }
            }]
        };
        subAllocationChart.update();
    }

    function getTrendData() {
        const daily = {};
        state.logs.forEach(l => {
            const d = new Date(l.date).toLocaleDateString('en-GB', { day:'numeric', month:'short' });
            daily[d] = (daily[d] || 0) + l.Value_in_THB;
        });
        const labels = Object.keys(daily).slice(-7);
        return {
            labels: labels,
            datasets: [{
                data: labels.map(l => daily[l]),
                borderColor: '#6366f1', borderWidth: 3, tension: 0.4, fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
            }]
        };
    }

    function getChangeData() {
        const periods = { 'W': 7, 'M': 30, 'Q': 90, 'Y': 365 };
        const days = periods[state.barPeriod] || 7;
        
        let referenceDate = new Date();
        if (state.logs && state.logs.length > 0) {
            const timestamps = state.logs.map(l => new Date(l.date).getTime()).filter(t => !isNaN(t));
            if (timestamps.length > 0) {
                const latestLogTime = Math.max(...timestamps);
                if (latestLogTime > referenceDate.getTime()) {
                    referenceDate = new Date(latestLogTime);
                }
            }
        }

        const cutoff = new Date(referenceDate);
        cutoff.setDate(cutoff.getDate() - days);

        const filtered = state.logs.filter(l => {
            const d = new Date(l.date);
            return !isNaN(d.getTime()) && d >= cutoff;
        });

        const grouped = {};
        filtered.forEach(l => {
            grouped[l.name] = (grouped[l.name] || 0) + (parseFloat(l.Value_in_THB) || 0);
        });

        const labels = Object.keys(grouped).slice(-5);
        const data = labels.map(l => grouped[l]);

        return {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: data.map(v => v >= 0 ? '#4caf50' : '#ef5350'),
                borderRadius: 6
            }]
        };
    }

    function updateUI() {
        const total = PortfolioLogic.calculateTotalValue(state.portfolioData, state.exchangeRates);
        
        // Display Total Value
        if (totalValueDisplay) {
            totalValueDisplay.textContent = PortfolioLogic.formatCurrency(total, 'THB', state.isIncognito).split(' ')[0];
            totalValueDisplay.classList.toggle('privacy-blur', state.isIncognito);
        }
        
        // Display Donut Center
        if (donutCenterDisplay) {
            donutCenterDisplay.textContent = state.isIncognito ? '฿****' : '฿' + PortfolioLogic.formatValue(total);
            donutCenterDisplay.classList.toggle('privacy-blur', state.isIncognito);
        }
        
        // Update Charts
        if (allocationChart) {
            const newData = PortfolioLogic.getAllocationData(state.portfolioData, state.exchangeRates, state.allocationView);
            allocationChart.data.labels = newData.labels;
            allocationChart.data.datasets[0].data = newData.datasets[0].data;
            allocationChart.data.datasets[0].backgroundColor = newData.datasets[0].backgroundColor;
            allocationChart.update();
        }
        if (trendChart) {
            const newData = getTrendData();
            trendChart.data.labels = newData.labels;
            trendChart.data.datasets[0].data = newData.datasets[0].data;
            trendChart.update();
        }
        if (changeChart) {
            const newData = getChangeData();
            changeChart.data.labels = newData.labels;
            changeChart.data.datasets[0].data = newData.datasets[0].data;
            changeChart.data.datasets[0].backgroundColor = newData.datasets[0].backgroundColor;
            changeChart.update();
        }
        
        if (state.activeView === 'history') renderHistoryTable();
        
        // Sync toggles
        if (incognitoToggle) incognitoToggle.checked = state.isIncognito;
        if (themeToggle) themeToggle.checked = state.theme === 'dark';
        body.setAttribute('data-theme', state.theme);
    }

    // --- Event Listeners ---
    if (incognitoToggle) {
        incognitoToggle.addEventListener('change', (e) => {
            state.isIncognito = e.target.checked;
            localStorage.setItem(CONFIG.INCOGNITO_KEY, state.isIncognito);
            updateUI();
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
            state.theme = e.target.checked ? 'dark' : 'light';
            localStorage.setItem(CONFIG.THEME_KEY, state.theme);
            updateUI();
        });
    }

    document.querySelectorAll('.period-selector button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.period-selector button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.barPeriod = e.target.getAttribute('data-period');
            updateUI();
        });
    });

    if (aiPromptBtn) {
        aiPromptBtn.addEventListener('click', () => {
            const prompt = PortfolioLogic.generateAIPrompt(state.portfolioData, state.exchangeRates, state.isIncognito, state.allocationView);
            if (navigator.clipboard) {
                navigator.clipboard.writeText(prompt).then(() => alert('AI Review Prompt copied to clipboard!'));
            } else { alert("AI Prompt:\n\n" + prompt); }
        });
    }

    if (toggleAllocationViewBtn) {
        toggleAllocationViewBtn.addEventListener('click', () => {
            state.allocationView = state.allocationView === 'category' ? 'platform' : 'category';
            toggleAllocationViewBtn.textContent = `View by ${state.allocationView === 'category' ? 'Platform' : 'Category'}`;
            updateUI();
        });
    }

    if (exportXmlBtn) {
        exportXmlBtn.addEventListener('click', () => {
            const dataXml = localStorage.getItem(XMLStorageManager.STORAGE_KEY);
            const blob = new Blob([dataXml], { type: 'text/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `portfolio_export_${new Date().toISOString().split('T')[0]}.xml`;
            a.click();
        });
    }

    if (entryForm) {
        entryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const entry = {
                category: categorySelect.value,
                name: assetNameInput.value,
                platform: platformSelect.value,
                currency: currencySelect.value,
                value: parseFloat(valueInput.value),
                Value_in_THB: parseFloat(valueInput.value) * (state.exchangeRates[currencySelect.value] || 1),
                date: dateInput.value || new Date().toISOString()
            };
            const err = PortfolioLogic.validateEntry(entry);
            if (err) return alert(err);

            const idx = state.portfolioData.findIndex(p => p.name === entry.name && p.platform === entry.platform);
            if (idx !== -1) state.portfolioData[idx] = entry;
            else state.portfolioData.push(entry);

            state.logs.push({...entry});
            XMLStorageManager.save(state.portfolioData);
            XMLStorageManager.saveLogs(state.logs);
            
            // Background sync to cloud
            if (CONFIG.GAS_URL) {
                fetch(CONFIG.GAS_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify(entry)
                }).catch(err => console.error('Cloud save failed:', err));
            }

            updateUI();
            alert('Ledger updated!');
            document.querySelector('[data-view=dashboard]').click();
        });
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const v = e.currentTarget.getAttribute('data-view');
            state.activeView = v;
            document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n === e.currentTarget));
            views.forEach(view => view.classList.toggle('hidden', view.id !== `${v}-view`));
            if (v === 'history') renderHistoryTable();
        });
    });

    initCharts();
    updateUI();
    syncWithCloud();
});
