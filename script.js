'use strict';

// তোমার Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbwwaJLoV4MjMyjMcX5loXnSEp0CjYrItvYxvIoIlwId0M0vV4bYsBI6wKE-E5t4ytXs/exec';
const STORAGE_KEY = 'gawharReminderSettings';
const ids = [
  'maghribEnabled', 'maghribTime', 'maghribMode', 'maghribMessage',
  'ishaEnabled', 'ishaTime', 'ishaMode', 'ishaMessage',
  'sendPersonal', 'phoneNumber', 'sendGroup', 'groupName',
  'hadithText', 'hadithSource'
];
const defaults = {
  maghribEnabled: true, maghribTime: '18:00', maghribMode: 'hadith', maghribMessage: '',
  ishaEnabled: true, ishaTime: '20:00', ishaMode: 'hadith', ishaMessage: '',
  sendPersonal: true, phoneNumber: '', sendGroup: false, groupName: '',
  hadithText: '', hadithSource: ''
};
const $ = id => document.getElementById(id);
let remoteSaveTimer;

function getValues() {
  const result = {};
  ids.forEach(id => {
    const el = $(id);
    result[id] = el.type === 'checkbox' ? el.checked : el.value;
  });
  return result;
}

function applyValues(data) {
  ids.forEach(id => {
    const el = $(id);
    if (data && Object.prototype.hasOwnProperty.call(data, id)) {
      if (el.type === 'checkbox') el.checked = Boolean(data[id]);
      else el.value = data[id] ?? '';
    }
  });
}

function saveLocal(showMessage = false) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getValues()));
    if (showMessage) $('status').textContent = 'এই ব্রাউজারে সেটিংস সংরক্ষিত হয়েছে।';
  } catch (error) {
    console.error('Local save failed:', error);
    $('status').textContent = 'ব্রাউজারে সেটিংস সংরক্ষণ করা যায়নি।';
  }
}

function loadLocal() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) applyValues(JSON.parse(saved));
  } catch (error) {
    console.error('Local load failed:', error);
  }
}

// Apps Script-এর JSONP response দিয়ে Sheet থেকে সময় লোড
function loadFromSheet() {
  return new Promise((resolve, reject) => {
    const callbackName = 'gawharSheetCallback_' + Date.now();
    const script = document.createElement('script');
    const timeout = setTimeout(() => finish(new Error('সময় শেষ হয়েছে')), 15000);
    function finish(error, data) {
      clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
      if (error) reject(error); else resolve(data);
    }
    window[callbackName] = data => finish(null, data);
    script.onerror = () => finish(new Error('Google Sheets থেকে তথ্য আনা যায়নি'));
    script.src = API_URL + '?callback=' + callbackName + '&_=' + Date.now();
    document.head.appendChild(script);
  }).then(data => {
    if (!data || data.success !== true) throw new Error(data?.message || 'Sheet response invalid');
    applyValues({
      maghribTime: data.maghribTime,
      ishaTime: data.ishaTime,
      maghribEnabled: data.maghribEnabled,
      ishaEnabled: data.ishaEnabled
    });
    saveLocal(false);
    $('status').textContent = 'Google Sheets থেকে মাগরিব ও এশার সময় লোড হয়েছে।';
    return data;
  });
}

// no-cors + text/plain ব্যবহার করা হয়েছে যাতে browser preflight না লাগে।
// এরপর JSONP দিয়ে Sheet-এ সেভ হওয়া মান আবার যাচাই করা হয়।
async function saveToSheet() {
  const v = getValues();
  const payload = {
    action: 'save',
    maghribTime: v.maghribTime,
    ishaTime: v.ishaTime,
    maghribEnabled: v.maghribEnabled,
    ishaEnabled: v.ishaEnabled
  };
  $('status').textContent = 'Google Sheets-এ সময় সংরক্ষণ হচ্ছে...';
  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload)
    });
    // POST-এর opaque response পড়া যায় না; GET JSONP দিয়ে নিশ্চিত হই।
    await new Promise(resolve => setTimeout(resolve, 1200));
    const saved = await loadFromSheet();
    if (saved.maghribTime !== payload.maghribTime ||
        saved.ishaTime !== payload.ishaTime ||
        saved.maghribEnabled !== payload.maghribEnabled ||
        saved.ishaEnabled !== payload.ishaEnabled) {
      throw new Error('Sheet-এর মান মিলছে না।');
    }
    $('status').textContent = 'মাগরিব ও এশার সময় Google Sheets-এ সংরক্ষিত হয়েছে।';
  } catch (error) {
    console.error('Backend save failed:', error);
    $('status').textContent = 'Google Sheets-এ সংযোগ হয়নি। Code.gs আপডেট ও নতুন করে Deploy হয়েছে কি না দেখুন।';
  }
}

function scheduleSheetSave() {
  clearTimeout(remoteSaveTimer);
  remoteSaveTimer = setTimeout(saveToSheet, 700);
}

function messageFor(kind, v) {
  if (!v[kind + 'Enabled']) return kind === 'maghrib' ? 'মাগরিব: বন্ধ' : 'এশা: বন্ধ';
  if (v[kind + 'Mode'] === 'custom') return v[kind + 'Message'] || 'নিজের মেসেজ এখনো লেখা হয়নি।';
  return (v.hadithText || 'হাদিস যোগ করা হয়নি।') + (v.hadithSource ? '\nসূত্র: ' + v.hadithSource : '');
}

ids.forEach(id => {
  const el = $(id);
  el.addEventListener('input', () => {
    saveLocal(false);
    if (['maghribTime', 'ishaTime'].includes(id)) scheduleSheetSave();
  });
  el.addEventListener('change', () => {
    saveLocal(false);
    if (['maghribTime', 'ishaTime', 'maghribEnabled', 'ishaEnabled'].includes(id)) scheduleSheetSave();
  });
});

$('saveBtn').addEventListener('click', () => {
  saveLocal(false);
  clearTimeout(remoteSaveTimer);
  saveToSheet();
});

$('previewBtn').addEventListener('click', () => {
  const v = getValues();
  const targets = [];
  if (v.sendPersonal) targets.push('ব্যক্তিগত নম্বর: ' + (v.phoneNumber || 'দেওয়া হয়নি'));
  if (v.sendGroup) targets.push('গ্রুপ: ' + (v.groupName || 'নাম দেওয়া হয়নি'));
  $('previewText').textContent =
    'পাঠানোর গন্তব্য\n' + (targets.join('\n') || 'কোনো গন্তব্য নির্বাচন করা হয়নি') +
    '\n\nমাগরিব (' + v.maghribTime + ')\n' + messageFor('maghrib', v) +
    '\n\nএশা (' + v.ishaTime + ')\n' + messageFor('isha', v);
  $('preview').classList.remove('hidden');
});

$('resetBtn').addEventListener('click', () => {
  applyValues(defaults);
  saveLocal(false);
  $('status').textContent = 'ডিফল্ট সেটিংস বসানো হয়েছে; Sheet-এ পাঠানো হচ্ছে...';
  $('preview').classList.add('hidden');
  saveToSheet();
});

loadLocal();
$('today').textContent = new Intl.DateTimeFormat('bn-BD', {
  dateStyle: 'full', timeZone: 'Asia/Dhaka'
}).format(new Date());
loadFromSheet().catch(error => {
  console.error('Initial Sheet load failed:', error);
  $('status').textContent = 'স্থানীয় সেটিংস দেখানো হচ্ছে। Google Sheets সংযোগ পেতে Code.gs আপডেট ও Deploy করুন।';
});
