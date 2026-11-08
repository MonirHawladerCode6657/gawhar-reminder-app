'use strict';

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
const STORAGE_KEY = 'gawharReminderSettings';

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

function saveSettings(showMessage = true) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getValues()));
    if (showMessage) $('status').textContent = 'সেটিংস স্বয়ংক্রিয়ভাবে এই ব্রাউজারে সংরক্ষণ হয়েছে।';
    return true;
  } catch (error) {
    console.error('Settings save failed:', error);
    $('status').textContent = 'সেটিংস সংরক্ষণ হয়নি। ব্রাউজারের Private/Incognito মোড বন্ধ করে আবার চেষ্টা করুন।';
    return false;
  }
}

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      applyValues(JSON.parse(saved));
      $('status').textContent = 'আগের সংরক্ষিত সেটিংস লোড হয়েছে।';
    }
  } catch (error) {
    console.error('Settings load failed:', error);
    $('status').textContent = 'আগের সেটিংস পড়া যায়নি। ডিফল্ট সেটিংস দেখানো হচ্ছে।';
  }
}

function messageFor(kind, v) {
  if (!v[kind + 'Enabled']) return kind === 'maghrib' ? 'মাগরিব: বন্ধ' : 'এশা: বন্ধ';
  if (v[kind + 'Mode'] === 'custom') return v[kind + 'Message'] || 'নিজের মেসেজ এখনো লেখা হয়নি।';
  return (v.hadithText || 'হাদিস যোগ করা হয়নি।') + (v.hadithSource ? '\nসূত্র: ' + v.hadithSource : '');
}

// টাইপ করা বা অপশন বদলানোর সঙ্গে সঙ্গে সেটিংস সেভ হবে।
ids.forEach(id => {
  const el = $(id);
  el.addEventListener('input', () => saveSettings(false));
  el.addEventListener('change', () => saveSettings(true));
});

$('saveBtn').addEventListener('click', () => saveSettings(true));

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
  try { localStorage.removeItem(STORAGE_KEY); } catch (error) { console.error(error); }
  $('status').textContent = 'ডিফল্ট সেটিংসে ফিরিয়ে আনা হয়েছে।';
  $('preview').classList.add('hidden');
});

loadSettings();
$('today').textContent = new Intl.DateTimeFormat('bn-BD', {
  dateStyle: 'full', timeZone: 'Asia/Dhaka'
}).format(new Date());
