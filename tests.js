// Portfolio Logic Tests - Comprehensive Suite

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

const mockRates = { 'USD': 35, 'THB': 1 };
const mockData = [
    { platform: 'Binance', category: 'Crypto', value: 100, currency: 'USD' },
    { platform: 'SCB', category: 'Cash', value: 1000, currency: 'THB' }
];

function runTests() {
    console.log("🚀 Starting Comprehensive Tests...");

    try {
        // --- Calculation Tests ---
        let total = PortfolioLogic.calculateTotalValue(mockData, mockRates);
        assert(total === 4500, `Total should be 4500, got ${total}`);
        
        total = PortfolioLogic.calculateTotalValue([], mockRates);
        assert(total === 0, "Empty portfolio should result in 0 total");
        
        total = PortfolioLogic.calculateTotalValue([{ value: 10, currency: 'USD' }], null);
        assert(total === 10, "Should default rate to 1 if rates are missing");

        console.log("✅ Group 1 Passed: Calculation & Edge Cases");

        // --- Allocation Tests ---
        let alloc = PortfolioLogic.getAllocationData(mockData, mockRates, 'platform');
        assert(alloc.labels.length === 2, "Should have 2 labels");
        assert(alloc.datasets[0].data[0] === 3500, "First value should be converted USD to THB");

        alloc = PortfolioLogic.getAllocationData(null, null, 'platform');
        assert(alloc.labels.length === 0, "Null data should return empty structure");

        console.log("✅ Group 2 Passed: Allocation Grouping");

        // --- Formatting Tests ---
        let fmt = PortfolioLogic.formatCurrency(1234.56, 'THB', false);
        assert(fmt === "1,234.56 ฿", `Got ${fmt}`);

        fmt = PortfolioLogic.formatCurrency(1234.56, 'THB', true);
        assert(fmt === "**** ฿", `Got ${fmt}`);

        fmt = PortfolioLogic.formatCurrency(0, 'USD', false);
        assert(fmt === "0.00 USD", `Got ${fmt}`);

        console.log("✅ Group 3 Passed: Currency Formatting");

        // --- Display Value Consistency Tests ---
        let displayVal = PortfolioLogic.formatCurrency(79000, 'THB', false).split(' ')[0];
        assert(displayVal === "79,000.00", `Expected 79,000.00, got ${displayVal}`);

        displayVal = PortfolioLogic.formatCurrency(79000, 'THB', true).split(' ')[0];
        assert(displayVal === "****", `Expected **** in incognito, got ${displayVal}`);

        let centerVal = PortfolioLogic.formatValue(79000);
        assert(centerVal === "79.00k", `Expected 79.00k, got ${centerVal}`);

        centerVal = PortfolioLogic.formatValue(0);
        assert(centerVal === "0.00", `Expected 0.00, got ${centerVal}`);

        console.log("✅ Group 3.5 Passed: Display Value Consistency");

        // --- Validation Tests ---
        let err = PortfolioLogic.validateEntry({ name: 'SCB', platform: '', category: 'Cash', value: 10 });
        assert(err === "Platform is required.", `Got: ${err}`);

        err = PortfolioLogic.validateEntry({ name: 'SCB', platform: 'SCB', category: 'Cash', value: -5 });
        assert(err === "Value must be a positive number.", `Got: ${err}`);

        err = PortfolioLogic.validateEntry({ name: 'SCB', platform: 'SCB', category: 'Cash', value: 100 });
        assert(err === null, "Valid entry should return null error");

        console.log("✅ Group 4 Passed: Input Validation");

        // --- AI Prompt Tests ---
        let prompt = PortfolioLogic.generateAIPrompt(mockData, mockRates, false, 'platform');
        assert(prompt.includes("Binance"), "Platform prompt should include platform names");
        assert(prompt.includes("by platform"), "Header should indicate platform view");

        prompt = PortfolioLogic.generateAIPrompt(mockData, mockRates, false, 'category');
        assert(prompt.includes("Crypto"), "Category prompt should include category names");
        assert(prompt.includes("by category"), "Header should indicate category view");
        assert(prompt.includes("4,500.00 ฿"), "Prompt should include total value");

        prompt = PortfolioLogic.generateAIPrompt([], mockRates, false);
        assert(prompt === "No portfolio data available for analysis.", "Handle empty data prompt");

        console.log("✅ Group 5 Passed: AI Prompt Generation");

        console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
    } catch (error) {
        console.error("❌ TEST FAILURE:", error.message);
    }
}

window.runTests = runTests;
