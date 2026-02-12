// ================================================================================
// Miter Saw Timeline Project - Apps Script
// Synced with: Timeline_System_Spec.md
// ================================================================================

const SPREADSHEET_ID = '1izvdvE96XYFws4heIN9oE24A2IYniQzRFfFGIJwiuUo';

function doGet(e) {
  const params = e.parameter;
  const action = params.action;
  
  try {
    if (action === 'getTimelineData') {
      return createJsonResponse(fetchTimelineProjectData());
    }
    return createJsonResponse({ error: 'Invalid action' });
  } catch (err) {
    return createJsonResponse({ error: err.toString() });
  }
}

/**
 * Fetches and transforms data for the Timeline App
 * Schema: Timeline_System_Spec.md
 */
function fetchTimelineProjectData() {
  let ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return { error: "Failed to open Spreadsheet. Check ID.", details: e.toString() };
  }

  // 1. Get Models Data (Non-try-catch to let errors bubble or handle explicitly)
  let modelsData = [];
  try {
    const sheet = ss.getSheetByName('Models_Data');
    if (!sheet) {
        return {
            error: "CRITICAL: Sheet 'Models_Data' NOT found.",
            available_sheets: ss.getSheets().map(s => s.getName()),
            spreadsheet_name: ss.getName()
        };
    }
    
    // Check for data
    const values = sheet.getDataRange().getDisplayValues();
    if (values.length < 2) {
        return {
            error: "Sheet 'Models_Data' is empty (less than 2 rows).",
            headers_found: values.length > 0 ? values[0] : "None"
        };
    }
    
    // Check headers
    const headers = values[0];
    const required = ['Released Year', 'Model #', 'Brand'];
    const missing = required.filter(h => !headers.includes(h));
    if (missing.length > 0) {
        return {
            error: "Missing critical CSV Headers in 'Models_Data'.",
            missing_headers: missing,
            headers_found: headers
        };
    }
    
    modelsData = values.slice(1).map(row => {
        let obj = {};
        headers.forEach((h, i) => obj[h.trim()] = row[i]);
        return obj;
    });

  } catch (e) {
    return { error: "Error parsing 'Models_Data'", details: e.toString() };
  }

  // 2. Get Era Descriptions (Optional)
  let erasData = [];
  try {
    const eraSheet = ss.getSheetByName('Year_Timeline');
    if (eraSheet) {
        const eValues = eraSheet.getDataRange().getDisplayValues();
        if (eValues.length > 1) {
            const eHeaders = eValues[0];
            erasData = eValues.slice(1).map(row => {
                let obj = {};
                eHeaders.forEach((h, i) => obj[h] = row[i]);
                return obj;
            });
        }
    }
  } catch (e) {
    // Ignore era errors
  }
  
  const erasMap = erasData.reduce((acc, row) => {
    const y = row['Year'] || row['年份'];
    if (y) {
      acc[y] = {
        title: row['Era_Title'] || row['年度標題'],
        desc: row['Market_Description'] || row['市場總結']
      };
    }
    return acc;
  }, {});

  // 3. Group Models by Year
  const modelsByYear = modelsData.reduce((acc, row) => {
    const year = row['Released Year'];
    if (!year) return acc;

    if (!acc[year]) acc[year] = [];
    
    const power = row['Watt'] ? `${row['Watt']}W` : (row['Power Supply'] || '');
    const uniqueId = (row['Brand'] + '_' + row['Model #'] + '_' + year).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    acc[year].push({
      id: uniqueId,
      brand: row['Brand'] || '',
      model: row['Model #'] || '',
      image: row['Image URL'] || '', 
      desc: row['Key Innovation/Significance'] || '',
      ref: row['REF URL'] || '',
      specs: {
        type: row['Type'] || '',
        blade: row['Blade Diameter'] || '',
        motor: power,
        feature: row['Others'] || row['Key Innovation/Significance'] || ''
      }
    });
    return acc;
  }, {});

  // 4. Build Final Array
  const allYears = new Set([...Object.keys(modelsByYear), ...Object.keys(erasMap)]);
  const sortedYears = Array.from(allYears).map(y => parseInt(y)).filter(y => !isNaN(y)).sort((a, b) => a - b);

  if (sortedYears.length === 0) {
      return { 
          error: "No valid years found. Check 'Released Year' column.",
          sample_row: modelsData[0] 
      };
  }

  const timeline = sortedYears.map(year => {
    const era = erasMap[year] || {};
    return {
      year: year,
      title: era.title || "",
      description: era.desc || "",
      models: modelsByYear[year] || []
    };
  });
  
  return timeline;
}

/**
 * Generic Sheet parser
 */
function getSheetData(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet not found: ' + sheetName);
  
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 1) return [];
  
  const headers = values[0];
  return values.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h.trim()] = row[i]); // Trim headers just in case
    return obj;
  });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
