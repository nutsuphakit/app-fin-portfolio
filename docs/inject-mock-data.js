/**
 * Mock Data Injection Script - Net Worth Change Scenario
 * Run this in the browser console to populate the app with 10 rows for testing.
 */

(function() {
    const exchangeRates = { 'USD': 36.5, 'EUR': 39.5, 'JPY': 0.24, 'THB': 1 };
    
    // Create 10 rows representing changes over the last 10 days
    const mockTransactions = [
        { name: 'BTC', platform: 'Binance', category: 'Crypto Assets', value: 0.1, currency: 'USD', date: '2026-05-18T10:00' },
        { name: 'AAPL', platform: 'Dime!', category: 'US Stocks', value: 1500, currency: 'USD', date: '2026-05-19T21:00' },
        { name: 'Gold Bullion', platform: 'YLG', category: 'Gold', value: 105000, currency: 'THB', date: '2026-05-20T14:00' },
        { name: 'BTC', platform: 'Binance', category: 'Crypto Assets', value: -0.02, currency: 'USD', date: '2026-05-21T09:00' }, // Sale/Loss simulation
        { name: 'AOT', platform: 'SCB', category: 'Thai Stocks', value: 20000, currency: 'THB', date: '2026-05-22T10:00' },
        { name: 'ETH', platform: 'Bitkub', category: 'Crypto Assets', value: 5000, currency: 'THB', date: '2026-05-23T15:30' },
        { name: 'NVDA', platform: 'InnovestX', category: 'US Stocks', value: 1200, currency: 'USD', date: '2026-05-24T20:00' },
        { name: 'Savings Account', platform: 'KBank', category: 'Cash / Savings', value: -10000, currency: 'THB', date: '2026-05-25T08:00' }, // Withdrawal
        { name: 'USDT', platform: 'Binance', category: 'Stablecoins', value: 3000, currency: 'USD', date: '2026-05-26T16:45' },
        { name: 'SCB', platform: 'SCB', category: 'Thai Stocks', value: 5000, currency: 'THB', date: '2026-05-27T11:00' }
    ];

    const logs = mockTransactions.map(t => ({
        ...t,
        Value_in_THB: t.value * (exchangeRates[t.currency] || 1)
    }));

    // Generate unique current portfolio state
    const portfolio = [];
    logs.forEach(log => {
        const idx = portfolio.findIndex(p => p.name === log.name && p.platform === log.platform);
        if (idx !== -1) {
            // Accumulate value for portfolio view
            portfolio[idx].value += log.value;
            portfolio[idx].Value_in_THB += log.Value_in_THB;
            portfolio[idx].date = log.date;
        } else {
            portfolio.push({...log});
        }
    });

    // Helper to escape XML
    const escapeXML = (str) => str.toString().replace(/[<>&"']/g, m => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[m]));

    // Generate XML for Portfolio
    let portfolioXml = '<?xml version="1.0" encoding="UTF-8"?>\n<portfolio>\n';
    portfolio.forEach(item => {
        portfolioXml += '  <asset>\n';
        portfolioXml += `    <name>${escapeXML(item.name)}</name>\n`;
        portfolioXml += `    <platform>${escapeXML(item.platform)}</platform>\n`;
        portfolioXml += `    <category>${escapeXML(item.category)}</category>\n`;
        portfolioXml += `    <value>${item.value}</value>\n`;
        portfolioXml += `    <currency>${item.currency}</currency>\n`;
        portfolioXml += `    <valueTHB>${item.Value_in_THB}</valueTHB>\n`;
        portfolioXml += `    <lastUpdated>${item.date}</lastUpdated>\n`;
        portfolioXml += '  </asset>\n';
    });
    portfolioXml += '</portfolio>';

    // Generate XML for Logs
    let logsXml = '<?xml version="1.0" encoding="UTF-8"?>\n<logs>\n';
    logs.forEach(log => {
        logsXml += '  <entry>\n';
        logsXml += `    <date>${log.date}</date>\n`;
        logsXml += `    <name>${escapeXML(log.name)}</name>\n`;
        logsXml += `    <platform>${escapeXML(log.platform)}</platform>\n`;
        logsXml += `    <category>${escapeXML(log.category)}</category>\n`;
        logsXml += `    <value>${log.value}</value>\n`;
        logsXml += `    <currency>${log.currency}</currency>\n`;
        logsXml += `    <valueTHB>${log.Value_in_THB}</valueTHB>\n`;
        logsXml += '  </entry>\n';
    });
    logsXml += '</logs>';

    // Save to LocalStorage
    localStorage.setItem('fin_portfolio_xml_data', portfolioXml);
    localStorage.setItem('fin_portfolio_xml_logs', logsXml);

    console.log('✅ Mock data (10 rows for Net Worth Change) injected successfully!');
    console.log('🔄 Please refresh the page to see the changes.');
})();
