const ids=['maghribEnabled','maghribTime','maghribMode','maghribMessage','ishaEnabled','ishaTime','ishaMode','ishaMessage','sendPersonal','phoneNumber','sendGroup','groupName','hadithText','hadithSource'];
const defaults={maghribEnabled:true,maghribTime:'18:00',maghribMode:'hadith',maghribMessage:'',ishaEnabled:true,ishaTime:'20:00',ishaMode:'hadith',ishaMessage:'',sendPersonal:true,phoneNumber:'',sendGroup:false,groupName:'',hadithText:'',hadithSource:''};
const $=id=>document.getElementById(id);
function values(){const out={};ids.forEach(id=>{const el=$(id);out[id]=el.type==='checkbox'?el.checked:el.value});return out}
function apply(data){ids.forEach(id=>{const el=$(id);if(data[id]!==undefined){if(el.type==='checkbox')el.checked=!!data[id];else el.value=data[id]}})}
function save(){localStorage.setItem('gawharReminderSettings',JSON.stringify(values()));$('status').textContent='সেটিংস এই ব্রাউজারে সংরক্ষণ হয়েছে।';}
function messageFor(kind,v){const enabled=v[kind+'Enabled'];if(!enabled)return kind==='maghrib'?'মাগরিব: বন্ধ':'এশা: বন্ধ';if(v[kind+'Mode']==='custom')return v[kind+'Message']||'নিজের মেসেজ এখনো লেখা হয়নি।';return (v.hadithText||'হাদিস যোগ করা হয়নি।')+(v.hadithSource?'\nসূত্র: '+v.hadithSource:'')}
$('saveBtn').addEventListener('click',save);
$('previewBtn').addEventListener('click',()=>{const v=values();const targets=[];if(v.sendPersonal)targets.push('ব্যক্তিগত নম্বর: '+(v.phoneNumber||'দেওয়া হয়নি'));if(v.sendGroup)targets.push('গ্রুপ: '+(v.groupName||'নাম দেওয়া হয়নি'));$('previewText').textContent='পাঠানোর গন্তব্য\n'+(targets.join('\n')||'কোনো গন্তব্য নির্বাচন করা হয়নি')+'\n\nমাগরিব ('+v.maghribTime+')\n'+messageFor('maghrib',v)+'\n\nএশা ('+v.ishaTime+')\n'+messageFor('isha',v);$('preview').classList.remove('hidden')});
$('resetBtn').addEventListener('click',()=>{apply(defaults);localStorage.removeItem('gawharReminderSettings');$('status').textContent='ডিফল্ট সেটিংসে ফিরিয়ে আনা হয়েছে।';$('preview').classList.add('hidden')});
try{const saved=JSON.parse(localStorage.getItem('gawharReminderSettings')||'null');if(saved)apply(saved)}catch(e){console.warn('Saved settings could not be loaded',e)}
$('today').textContent=new Intl.DateTimeFormat('bn-BD',{dateStyle:'full',timeZone:'Asia/Dhaka'}).format(new Date());
