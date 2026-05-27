/**
 * Portfolio Logic Module
 */
const PortfolioLogic = {
    calculateTotalValue: function(portfolioData, exchangeRates) {
        if (!portfolioData || !Array.isArray(portfolioData)) return 0;
        const rates = exchangeRates || { 'THB': 1 };
        return portfolioData.reduce((acc, item) => {
            const rate = rates[item.currency] || 1;
            return acc + ((parseFloat(item.value) || 0) * rate);
        }, 0);
    },

    getAllocationData: function(portfolioData, exchangeRates, viewType) {
        if (!portfolioData || !Array.isArray(portfolioData)) return { labels: [], datasets: [{ data: [] }] };
        const grouped = {};
        const rates = exchangeRates || { 'THB': 1 };
        const colors = [
            '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'
        ];

        portfolioData.forEach(item => {
            const key = (viewType === 'platform' ? item.platform : item.category) || 'Unknown';
            const rate = rates[item.currency] || 1;
            grouped[key] = (grouped[key] || 0) + ((parseFloat(item.value) || 0) * rate);
        });

        const labels = Object.keys(grouped);
        const data = Object.values(grouped);
        const total = data.reduce((a, b) => a + b, 0);

        return {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0,
                hoverOffset: 15,
                datalabels: {
                    formatter: (value) => {
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                        return percentage;
                    },
                    color: '#fff',
                    font: { weight: 'bold', size: 11 },
                    display: (ctx) => total > 0 && (ctx.dataset.data[ctx.dataIndex] / total) > 0.05 // Hide if too small
                }
            }]
        };
    },

    formatValue: function(val) {
        const absVal = Math.abs(val);
        if (absVal >= 1000000) return (val / 1000000).toFixed(2) + 'M';
        if (absVal >= 1000) return (val / 1000).toFixed(2) + 'k';
        return val.toFixed(2);
    },

    formatCurrency: function(value, currency, isIncognito) {
        const symbol = currency === 'THB' ? '฿' : currency;
        if (isIncognito) return `**** ${symbol}`;
        return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
    },

    validateEntry: function(entry) {
        if (!entry.category) return "Category is required.";
        if (!entry.name) return "Asset Name is required.";
        if (!entry.platform) return "Platform is required.";
        if (isNaN(entry.value) || entry.value < 0) return "Value must be a positive number.";
        return null;
    },

    generateAIPrompt: function(portfolioData, exchangeRates, isIncognito, viewType) {
        if (!portfolioData || portfolioData.length === 0) {
            return "No portfolio data available for analysis.";
        }

        const totalValue = this.calculateTotalValue(portfolioData, exchangeRates);
        const formattedTotal = this.formatCurrency(totalValue, 'THB', isIncognito);
        const type = viewType || 'category';
        
        let prompt = `Analyze my financial portfolio grouped by ${type}. Total Value: ${formattedTotal}.\n\n`;
        
        const alloc = this.getAllocationData(portfolioData, exchangeRates, type);
        alloc.labels.forEach((label, i) => {
            const val = alloc.datasets[0].data[i];
            const percent = ((val / totalValue) * 100).toFixed(1);
            prompt += `- ${label}: ${this.formatCurrency(val, 'THB', isIncognito)} (${percent}%)\n`;
        });

        prompt += "\nPlease provide insights on diversification and risk management.";
        return prompt;
    }
};

window.PortfolioLogic = PortfolioLogic;
