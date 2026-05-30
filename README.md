# Ghaleb Mall Ecommerce

Professional RTL ecommerce website for **غالب مول | Ghaleb Mall** in Amman, Jordan. It includes a public store, cart, cash-on-delivery order reservation, admin dashboard, logo preview/confirmation, media uploads, Excel import/export, and Render deployment files.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Three Fiber, React Router.
- Backend: FastAPI, SQLAlchemy, SQLite by default, JWT admin auth, OpenPyXL import/export.
- Deployment: Render backend web service plus Render static frontend.

## Folder Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── static/
│   │   ├── media/
│   │   ├── main.py
│   │   ├── models.py
│   │   └── seed_data.py
│   ├── scripts/
│   │   ├── create_admin.py
│   │   ├── generate_excel_template.py
│   │   ├── seed.py
│   │   └── smoke_test.py
│   ├── sample_data/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   │   ├── _redirects
│   │   ├── ghaleb-logo.jpg
│   │   └── ghaleb-logo-transparent.png
│   ├── src/
│   │   ├── components/
│   │   ├── dashboard/
│   │   ├── pages/
│   │   └── api/
│   ├── package.json
│   └── .env.example
├── render.yaml
├── .env.example
├── .gitignore
└── README.md
```

## Required Environment Variables

Backend:

```env
DATABASE_URL=sqlite:///./ghaleb_mall.db
SECRET_KEY=replace-with-a-long-random-secret
ADMIN_EMAIL=admin@ghalebmall.local
ADMIN_PASSWORD=ChangeMe123!
FRONTEND_URL=http://localhost:5173
MEDIA_ROOT=app/media
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Frontend:

```env
VITE_API_URL=http://localhost:8000
```

Never commit a real `.env` file or production secret keys.

## Run Locally

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python scripts/seed.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:5173`. The API docs are at `http://localhost:8000/docs`.

## Admin User

The backend creates the admin user on startup from:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

To create or reset another admin manually:

```bash
cd backend
python scripts/create_admin.py
```

Default local demo login:

- Email: `admin@ghalebmall.local`
- Password: `ChangeMe123!`

Change these before deploying.

## Seed Demo Products

Seed data includes 8 categories, 80 products, promotional pages, confirmed default logo, and demo orders.

```bash
cd backend
python scripts/seed.py
```

Seed categories:

- رجالي / Men
- ستاتي / Women
- ولادي / Boys
- بناتي / Girls
- أحذية ولادي / Boys Shoes
- أحذية ستاتي / Women Shoes
- فساتين / Dresses
- أخرى / Other

## Public Routes

- `/`
- `/products`
- `/products/:slug`
- `/category/:slug`
- `/offers`
- `/pages/:slug`
- `/cart`
- `/checkout`
- `/order-success/:orderNumber`
- `/about`
- `/contact`

The frontend includes `public/_redirects` so React Router routes work on Render static hosting.

## Dashboard Routes

- `/admin/login`
- `/dashboard`
- `/dashboard/products`
- `/dashboard/categories`
- `/dashboard/discounts`
- `/dashboard/pages`
- `/dashboard/media`
- `/dashboard/logo`
- `/dashboard/orders`
- `/dashboard/import`

Dashboard routes are protected by JWT. The browser stores the admin token in localStorage.

## Cash On Delivery Flow

Customers do not create accounts and do not enter email or payment card details.

1. Customer adds products to the cart.
2. Customer enters full name, Jordanian phone number, and address.
3. Customer clicks `تأكيد الطلب`.
4. Backend saves `Order` and `OrderItem` rows.
5. Success page shows the order number and message:
   `تم تثبيت طلبك بنجاح. سيتم التواصل معك وتجهيز الطلب، وسيصلك خلال 48 ساعة. الدفع عند الاستلام.`
6. Admin manages the order from `/dashboard/orders`.

Accepted phone examples: `079xxxxxxx`, `078xxxxxxx`, `077xxxxxxx`, `+96279xxxxxxx`, `0096279xxxxxxx`.

## Manage Orders

Open `/dashboard/orders` to:

- View all orders.
- Search by order number, customer name, or phone.
- Filter by status.
- Open order details.
- Update status.
- Cancel orders.
- Export orders to Excel.
- Print order details.
- Send a WhatsApp message with customer, products, total, address, and cash-on-delivery confirmation.

Order statuses:

- جديد
- قيد التجهيز
- تم التواصل مع العميل
- تم الإرسال
- تم التسليم
- ملغي

## Import Products From Excel

Open `/dashboard/import`.

1. Download the template from `GET /admin/excel/template`.
2. Fill the product rows.
3. Upload the file.
4. Click preview first to validate rows.
5. Click import and save when the preview is clean.

Required Arabic columns:

- `اسم المنتج`
- `القسم`
- `السعر`
- `الوصف`
- `الصورة`

Supported optional Arabic columns:

- `صورة 1`, `صورة 2`, `صورة 3`, `صورة 4`, `صورة 5`
- `السعر بعد الخصم`
- `نسبة الخصم`
- `متوفر`
- `مميز`

Supported English columns:

- `product name`
- `category`
- `price`
- `description`
- `image`
- `image1`, `image2`, `image3`
- `discount price`
- `discount percentage`
- `available`
- `featured`

If a category does not exist, the backend creates it automatically. If image values are URLs, they are stored as product image URLs. For local image filenames, upload the images through `/dashboard/media` first, then paste the generated `/media/...` URL into the Excel file.

## Export Products And Orders

Dashboard links:

- Products: `/admin/export/products/excel`
- Orders: `/admin/orders/export/excel`
- Template: `/admin/excel/template`

Generate a local template file:

```bash
cd backend
python scripts/generate_excel_template.py
```

This creates `backend/sample_data/products_template.xlsx`.

## Upload Logo

Open `/dashboard/logo`.

1. Upload the real logo image.
2. Review it in the preview panel.
3. Click `تأكيد استخدام الشعار`.

Only confirmed logos are used in the public navbar, footer, dashboard, and site metadata. If no confirmed logo exists, the site shows the text fallback: `غالب مول | Ghaleb Mall`.

## Push To GitHub

```bash
git init
git add .
git commit -m "Initial Ghaleb Mall ecommerce app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ghaleb-mall-ecommerce.git
git push -u origin main
```

Do not commit `.env`, `node_modules`, `.venv`, SQLite database files, frontend `dist`, or uploaded media. The `.gitignore` already excludes them.

## Deploy Backend On Render

Option A: Blueprint

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint**.
3. Select the repo.
4. Render reads `render.yaml`.
5. Set these backend environment variables:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `FRONTEND_URL`
   - `CORS_ORIGINS`
6. Deploy.

Option B: Manual web service

- Root directory: `backend`
- Runtime: Python
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add environment variables from the backend list above.

After deploy, run the seed command in Render Shell:

```bash
python scripts/seed.py
```

SQLite works for a first version. For production, use Render PostgreSQL and set `DATABASE_URL` to the Postgres connection string. If you need persistent uploaded media on Render, attach a disk and set `MEDIA_ROOT` to the mounted disk path.

## Deploy Frontend On Render

Option A: Blueprint

The `render.yaml` creates a static frontend service.

Set:

```env
VITE_API_URL=https://YOUR-BACKEND.onrender.com
```

Option B: Manual static site

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://YOUR-BACKEND.onrender.com`

The `frontend/public/_redirects` file rewrites all paths to `index.html`, so `/products/:slug`, `/dashboard/orders`, and other React Router pages work after deployment.

## Render Troubleshooting

- CORS error: set backend `CORS_ORIGINS` to the deployed frontend URL and `FRONTEND_URL` to the same URL.
- Frontend cannot reach API: verify `VITE_API_URL` is the deployed backend URL without a trailing slash, then redeploy the frontend.
- Admin login fails: verify `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then restart the backend. Use `python scripts/create_admin.py` if needed.
- Products are empty: run `python scripts/seed.py` in Render Shell.
- Uploaded images disappear: Render free instances have ephemeral storage. Attach a persistent disk or use external object storage later.
- React routes show 404: confirm `_redirects` exists and the static service publish directory is `dist`.
- Excel import fails: install backend requirements, use `.xlsx`, keep required columns, and preview before committing.
- SQLite database resets: move to Render PostgreSQL by setting `DATABASE_URL`.

## Main API Endpoints

Auth:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Products:

- `GET /products`
- `GET /products/{id_or_slug}`
- `POST /admin/products`
- `PUT /admin/products/{id}`
- `DELETE /admin/products/{id}`

Categories:

- `GET /categories`
- `POST /admin/categories`
- `PUT /admin/categories/{id}`
- `DELETE /admin/categories/{id}`

Orders:

- `POST /orders`
- `GET /orders/{order_number}`
- `GET /admin/orders`
- `GET /admin/orders/{id}`
- `PUT /admin/orders/{id}/status`
- `PUT /admin/orders/{id}/cancel`
- `GET /admin/orders/export/excel`

Logo:

- `POST /admin/logo/upload`
- `GET /admin/logo/preview`
- `POST /admin/logo/confirm`

Excel:

- `POST /admin/import/products/excel`
- `GET /admin/export/products/excel`
- `GET /admin/excel/template`
