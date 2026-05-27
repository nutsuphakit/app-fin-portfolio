/**
 * Google Apps Script Backend for Financial Portfolio
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet.
 * 2. Create two tabs: "Current_Portfolio" and "Transaction_Logs".
 * 3. Add headers to "Current_Portfolio" (A1:F1): 
 *    [Application, Category, Currency, Input_Value, Value_in_THB, Last_Updated]
 * 4. Add headers to "Transaction_Logs" (A1:G1): 
 *    [Timestamp, Application, Category, Currency, Input_Value, Value_in_THB, Change_in_THB]
 * 5. Open Extensions > Apps Script and paste this code.
 * 6. Click "Deploy" > "New Deployment".
 * 7. Select "Web App".
 * 8. Execute as: "Me", Who has access: "Anyone".
 * 9. Copy the Web App URL and paste it into your local docs/app.js.
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const PORTFOLIO_SHEET = "Current_Portfolio";
const LOGS_SHEET = "Transaction_Logs";

/**
 * Handles GET requests: Fetches all portfolio data and transaction logs.
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const portfolioSheet = ss.getSheetByName(PORTFOLIO_SHEET);
    const logsSheet = ss.getSheetByName(LOGS_SHEET);

    const portfolioData = getSheetData(portfolioSheet);
    const logsData = getSheetData(logsSheet);

    const response = {
      status: "success",
      portfolio: portfolioData,
      logs: logsData
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles POST requests: Updates portfolio and appends to logs.
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { platform, category, currency, value } = payload;

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const portfolioSheet = ss.getSheetByName(PORTFOLIO_SHEET);
    const logsSheet = ss.getSheetByName(LOGS_SHEET);

    // 1. Get Exchange Rate and Convert to THB
    let valueInThb = value;
    if (currency !== "THB") {
      const rateCell = ss.getRange("Z1"); // Temporary cell for calculation
      rateCell.setFormula(`=GOOGLEFINANCE("CURRENCY:${currency}THB")`);
      SpreadsheetApp.flush();
      const rate = rateCell.getValue();
      valueInThb = value * rate;
      rateCell.clear();
    }

    // 2. Find existing entry in Portfolio
    const data = portfolioSheet.getDataRange().getValues();
    let rowIndex = -1;
    let previousThbValue = 0;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === platform && data[i][1] === category) {
        rowIndex = i + 1;
        previousThbValue = data[i][4];
        break;
      }
    }

    const timestamp = new Date();
    const changeInThb = rowIndex === -1 ? valueInThb : valueInThb - previousThbValue;

    // 3. Update or Add to Portfolio Sheet
    if (rowIndex !== -1) {
      portfolioSheet.getRange(rowIndex, 3, 1, 4).setValues([[currency, value, valueInThb, timestamp]]);
    } else {
      portfolioSheet.appendRow([platform, category, currency, value, valueInThb, timestamp]);
    }

    // 4. Append to Logs Sheet
    logsSheet.appendRow([timestamp, platform, category, currency, value, valueInThb, changeInThb]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", valueInThb: valueInThb }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper to convert sheet range to array of objects.
 */
function getSheetData(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}
