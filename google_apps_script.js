// Google Apps Script code to log submissions and proxy Claude AI API calls.
// Paste this inside an Apps Script bound to your Google Sheet.

function doPost(e) {
  // Handle CORS preflight (if any browser sends POST directly)
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  
  try {
    var data = JSON.parse(e.postData.contents);
    
    // 1. Log data to Google Sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "Salary (INR)", "Credit Score", "Existing EMIs (INR)", 
        "Requested Amount (INR)", "Tenure (Months)", "Eligibility Decision", 
        "Risk Level", "Calculated EMI (INR)", "AI Advice Summary"
      ]);
    }
    
    // Append user interaction details
    sheet.appendRow([
      new Date().toISOString(),
      data.salary || 0,
      data.creditScore || 0,
      data.existingEmi || 0,
      data.requestedAmount || 0,
      data.requestedTenure || 0,
      data.decision || "N/A",
      data.riskLevel || "N/A",
      data.calculatedEmi || 0,
      data.aiAdvice || "N/A"
    ]);
    
    var responseData = { status: "success", message: "Data logged successfully" };
    
    // 2. Optional: Generate Claude AI advice if API key is loaded from Script Properties or provided in payload
    var apiKey = PropertiesService.getScriptProperties().getProperty("ANTHROPIC_API_KEY") || data.anthropicApiKey;
    if (data.generateAiAdvice && apiKey) {
      var aiAdvice = callClaudeAI(data, apiKey);
      responseData.aiAdvice = aiAdvice;
      
      // Update the row with the newly generated AI advice
      var lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 10).setValue(aiAdvice);
    }
    
    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}

function callClaudeAI(data, apiKey) {
  var url = "https://api.anthropic.com/v1/messages";
  
  var systemPrompt = "You are a professional, helpful, and empathetic financial advisor. Analyze the user's financial profile and offer direct, practical, and highly actionable advice on loan eligibility, credit score improvement, and debt management. Format your response in clean Markdown with clear headings or bullet points.";
  
  var userPrompt = "Analyze this financial profile and provide eligibility feedback, credit improvements, and repayment tips:\n" +
                   "- Monthly Salary: INR " + (data.salary || "N/A") + "\n" +
                   "- Credit Score: " + (data.creditScore || "N/A") + "\n" +
                   "- Existing EMI Obligations: INR " + (data.existingEmi || "N/A") + "\n" +
                   "- Requested Loan: INR " + (data.requestedAmount || "N/A") + " for " + (data.requestedTenure || "N/A") + " months\n" +
                   "- Pre-calculated Eligibility: " + (data.decision || "N/A") + "\n" +
                   "- Risk Classification: " + (data.riskLevel || "N/A") + "\n" +
                   "- Pre-calculated EMI: INR " + (data.calculatedEmi || "N/A") + "\n\n" +
                   "Please provide specific, personalized recommendations based on these details.";

  var payload = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1000,
    system: systemPrompt,
    messages: [
      { role: "user", content: userPrompt }
    ]
  };
  
  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var responseCode = response.getResponseCode();
  var responseText = response.getContentText();
  
  if (responseCode === 200) {
    var result = JSON.parse(responseText);
    if (result.content && result.content[0] && result.content[0].text) {
      return result.content[0].text;
    }
    return "Error parsing AI response structure.";
  } else {
    throw new Error("Claude API request failed with code " + responseCode + ": " + responseText);
  }
}
