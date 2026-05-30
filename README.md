# غالب مول | Ghaleb Mall

نسخة عرض ثابتة للموقع بدون Backend وبدون API. كل البيانات تعمل داخل المتصفح باستخدام localStorage، لذلك يمكن تشغيلها محليا أو نشرها على Render كرابط واحد بسيط للعميل.

## التشغيل المحلي

```bash
npm install
npm run dev
```

افتح:

```text
http://localhost:5173
```

## بناء نسخة الإنتاج

```bash
npm run build
```

## النشر على Render

1. ارفع هذا المجلد إلى GitHub.
2. من Render اختر **New > Static Site**.
3. اختر المستودع.
4. استخدم الإعدادات التالية:

```text
Build Command: npm install && npm run build
Publish Directory: dist
```

لا تضف Environment Variables.

## لوحة التحكم

الرابط:

```text
/admin/login
```

بيانات الدخول:

```text
Email: admin@ghalebmall.com
Password: 12345678
```

## ملاحظات مهمة

- هذه نسخة عرض للعميل وليست Backend حقيقي.
- الطلبات والمنتجات والتعديلات تحفظ داخل متصفح الزائر فقط.
- رفع الشعار والصور يعمل داخل المتصفح عبر localStorage.
- الاستيراد والتصدير يستخدم CSV يفتح في Excel.
- لا يوجد API ولا قاعدة بيانات ولا Python.
