
/**
 * Mock Data Injection Script
 * Run this in the browser console to populate the app with 20 varied transactions.
 */

(function() {
    const exchangeRates = { 'USD': 36.5, 'EUR': 39.5, 'JPY': 0.24, 'THB': 1 };
    
    const mockTransactions = [
        { name: 'AOT', platform: 'SCB', category: 'Thai Stocks', value: 15000, currency: 'THB', date: '2026-05-01T09:00' },
        { name: 'BTC', platform: 'Binance', category: 'Crypto Assets', value: 0.5, currency: 'USD', date: '2026-05-02T10:30' },
        { name: 'Savings Account', platform: 'KBank', category: 'Cash / Savings', value: 50000, currency: 'THB', date: '2026-05-03T08:15' },
        { name: 'AAPL', platform: 'Dime!', category: 'US Stocks', value: 1200, currency: 'USD', date: '2026-05-05T21:00' },
        { name: 'Physical Gold', platform: 'Hua Seng Heng', category: 'Gold', value: 34000, currency: 'THB', date: '2026-05-07T11:00' },
        { name: 'ETH', platform: 'Bitkub', category: 'Crypto Assets', value: 2.5, currency: 'THB', date: '2026-05-08T14:20' },
        { name: 'NVDA', platform: 'InnovestX', category: 'US Stocks', value: 850, currency: 'USD', date: '2026-05-10T20:45' },
        { name: 'CPALL', platform: 'Streaming', category: 'Thai Stocks', value: 8000, currency: 'THB', date: '2026-05-12T10:00' },
        { name: 'USDT', platform: 'Binance', category: 'Stablecoins', value: 5000, currency: 'USD', date: '2026-05-14T15:30' },
        { name: 'JPY Cash', platform: 'Cash', category: 'Cash / Savings', value: 100000, currency: 'JPY', date: '2026-05-15T09:00' },
        { name: 'SCB', platform: 'SCB', category: 'Thai Stocks', value: 12000, currency: 'THB', date: '2026-05-16T10:15' },
        { name: 'Fixed Deposit', platform: 'BBL', category: 'Cash / Savings', value: 200000, currency: 'THB', date: '2026-05-18T13:00' },
        { name: 'TSLA', platform: 'Dime!', category: 'US Stocks', value: 450, currency: 'USD', date: '2026-05-19T22:00' },
        { name: 'SOL', platform: 'Binance', category: 'Crypto Assets', value: 15, currency: 'USD', date: '2026-05-20T11:45' },
        { name: 'AOT', platform: 'SCB', category: 'Thai Stocks', value: 18000, currency: 'THB', date: '2026-05-21T09:00' }, // Update
        { name: 'Gold Bullion', platform: 'YLG', category: 'Gold', value: 105000, currency: 'THB', date: '2026-05-22T14:00' },
        { name: 'MSFT', platform: 'Interactive Brokers', category: 'US Stocks', value: 300, currency: 'USD', date: '2026-05-23T20:30' },
        { name: 'BTC', platform: 'Binance', category: 'Crypto Assets', value: 0.55, currency: 'USD', date: '2026-05-24T08:00' }, // Update
        { name: 'BNB', platform: 'Bitkub', category: 'Crypto Assets', value: 5000, currency: 'THB', date: '2026-05-25T16:00' },
        { name: 'Global Equity Fund', platform: 'KBank', category: 'Mutual Funds', value: 25000, currency: 'THB', date: '2026-05-26T11:00' }
    ];

    const logs = mockTransactions.map(t => ({
        ...t,
        Value_in_THB: t.value * (exchangeRates[t.currency] || 1)
    }));

    // Generate unique current portfolio state (last entry for each name/platform)
    const portfolio = [];
    logs.forEach(log => {
        const idx = portfolio.findIndex(p => p.name === log.name && p.platform === log.platform);
        if (idx !== -1) portfolio[idx] = log;
        else portfolio.push(log);
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

    console.log('✅ Mock data (20 transactions) injected successfully!');
    console.log('🔄 Please refresh the page to see the changes.');
})();
