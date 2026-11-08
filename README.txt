গওহরডাঙ্গা মাদ্রাসার হাজিরা সময় স্মরণ অ্যাপ — Google Sheets সংযুক্ত সংস্করণ

GitHub Pages:
- index.html, style.css, script.js আপলোড করুন।
- এই ZIP-এর Code.gs ফাইলটি Google Apps Script-এর Code.gs-এ বসাতে হবে; GitHub-এ Code.gs আপলোড করলেই Apps Script আপডেট হবে না।

Google Apps Script:
1. Code.gs সম্পূর্ণ replace করুন।
2. Save করুন।
3. Deploy > Manage deployments > Edit (পেন্সিল) > Version: New version > Deploy করুন।
4. Web App URL একই থাকবে যদি একই deployment edit করেন।

ওয়েবসাইট:
- script.js-এ API_URL আগে থেকেই ব্যবহারকারীর দেওয়া Web App URL-এ সেট করা আছে।
- script.js GitHub repository-তে replace করে commit/push করুন।
- মাগরিব/এশার সময় বা on/off বদলালে Google Sheets-এ সেভ হবে; পেজ খুললে Sheet থেকে এই চারটি মান লোড হবে।
- অন্যান্য লেখা/মেসেজ এখনো শুধু ওই ব্রাউজারের localStorage-এ থাকে।

নোট: এই সংযোগ কেবল সময় ও enabled অবস্থা সিঙ্ক করে। WhatsApp-এ অটো মেসেজ পাঠানোর ব্যবস্থা এতে নেই।
