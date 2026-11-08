const SHEET_NAME = 'PrayerSettings';
const HEADERS = ['Maghrib Time', 'Isha Time', 'Maghrib Enabled', 'Isha Enabled', 'Updated At'];

function getSheet() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SPREADSHEET_ID');
  let ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create('গওহরডাঙ্গা মাদ্রাসা - হাজিরা সময় স্মরণ');
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function output_(data, callback) {
  const json = JSON.stringify(data);
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    if (data.action !== 'save') throw new Error('Invalid action');

    const maghrib = String(data.maghribTime || '18:00');
    const isha = String(data.ishaTime || '20:00');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(maghrib) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(isha)) {
      throw new Error('Invalid time format');
    }

    const sheet = getSheet();
    sheet.getRange(2, 1, 1, 5).setValues([[
      maghrib,
      isha,
      data.maghribEnabled !== false,
      data.ishaEnabled !== false,
      new Date()
    ]]);
    return output_({ success: true, message: 'Settings saved' });
  } catch (err) {
    return output_({ success: false, message: err.message });
  }
}

function doGet(e) {
  try {
    const sheet = getSheet();
    let row = ['18:00', '20:00', true, true, ''];
    if (sheet.getLastRow() >= 2) {
      row = sheet.getRange(2, 1, 1, 5).getValues()[0];
    }
    return output_({
      success: true,
      maghribTime: row[0],
      ishaTime: row[1],
      maghribEnabled: row[2] === true,
      ishaEnabled: row[3] === true
    }, e && e.parameter ? e.parameter.callback : null);
  } catch (err) {
    return output_({ success: false, message: err.message },
      e && e.parameter ? e.parameter.callback : null);
  }
}

function testBackend() {
  const sheet = getSheet();
  Logger.log('Google Sheet তৈরি হয়েছে!');
  Logger.log(sheet.getParent().getUrl());
}
