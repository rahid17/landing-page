# Firebase Project Setup Guide for KTalk

---

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Create a project"** (or **"Add project"**)
3. Enter project name: `ktalk-landing` (or any name you prefer)
4. Disable Google Analytics (optional for now, you can enable later)
5. Click **"Create project"** and wait for it to provision

---

## Step 2: Register Web App

1. From the Firebase Console dashboard, click the **</> (Web)** icon
2. Register app nickname: `ktalk-web`
3. Check **"Also set up Firebase Hosting"** — optional, skip if using Vercel
4. Click **"Register app"**
5. You'll see a config object like:

```js
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "ktalk-landing.firebaseapp.com",
  projectId: "ktalk-landing",
  storageBucket: "ktalk-landing.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxx"
};
```

6. Copy these values into your `.env.local` file (see Step 7 below)

---

## Step 3: Enable Authentication

1. In Firebase Console sidebar, go to **Build > Authentication**
2. Click **"Get started"**
3. Click the **"Sign-in method"** tab
4. Click **"Email/Password"**
5. Toggle **"Enable"** ON
6. Click **"Save"**

---

## Step 4: Create Firestore Database

1. In Firebase Console sidebar, go to **Build > Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select a location (choose `asia-south1` for Bangladesh — Mumbai)
5. Click **"Enable"**

---

## Step 5: Set Up Storage

1. In Firebase Console sidebar, go to **Build > Storage**
2. Click **"Get started"**
3. Select **"Start in production mode"**
4. Choose the same location as Firestore
5. Click **"Done"**

---

## Step 6: Configure Firestore Security Rules

1. Go to **Firestore Database > Rules** tab
2. Replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: check if request is from an admin
    function isAdmin() {
      return request.auth != null 
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Anyone can read products
    match /products/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Anyone can create orders (customers); only admin can read/update/delete
    match /orders/{docId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
    
    // Anyone can read districts; admin manages
    match /districts/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Anyone can read payment settings; admin manages
    match /payment_settings/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Anyone can read reviews; admin manages
    match /reviews/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Anyone can read FAQs; admin manages
    match /faqs/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Anyone can read landing content; admin manages
    match /landing_content/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Only admin can read/write analytics
    match /analytics/{docId} {
      allow create: if true;
      allow read: if isAdmin();
    }
    
    // Only admin can read/write admin data
    match /admins/{docId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == docId;
    }
  }
}
```

3. Click **"Publish"**

---

## Step 7: Configure Storage Rules

1. Go to **Storage > Rules** tab
2. Replace with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

---

## Step 8: Update .env.local

Open `E:\Sample project\landing page\.env.local` and replace all placeholder values with your actual Firebase config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ktalk-landing.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ktalk-landing
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ktalk-landing.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:xxxxxxxxxxxxxx
```

---

## Step 9: Create Admin User

### Option A — Manual in Firebase Console

1. Go to **Authentication > Users**
2. Click **"Add user"**
3. Enter admin email and password
4. Copy the **User UID** (the auto-generated ID)
5. Go to **Firestore Database > Data**
6. Click **"Start collection"**, name it `admins`
7. Document ID: paste the User UID from step 4
8. Add fields:
   - `email` (string): admin email
   - `name` (string): "Admin"
   - `role` (string): "super_admin"
9. Click **"Save"**

### Option B — Via Firebase Admin SDK (Advanced)

If you prefer programmatic admin creation, install `firebase-admin` and use the provided script.

---

## Step 10: Seed Default Data (Optional)

Go to Firestore Database > Data and add these initial documents:

### products collection

Create a document with auto-generated ID:

```
name: "KTalk Premium Organic Mehendi"
slug: "ktalk-premium-organic-mehendi"
description: "100% natural organic mehendi made from pure henna leaves. No chemicals, no PPD, completely safe for all skin types."
price: 250
discountPrice: 200
images: []
gallery: []
features: ["100% Natural", "Chemical Free", "Long Lasting Color", "Safe for Skin"]
benefits: [
  {title: "100% Organic", description: "Made from pure natural henna leaves", icon: "leaf"},
  {title: "Chemical Free", description: "No PPD, no ammonia", icon: "shield"},
  {title: "Long Lasting Color", description: "Rich stain up to 2 weeks", icon: "sparkles"},
  {title: "Safe for Skin", description: "Dermatologically tested", icon: "heart"}
]
stockStatus: "in_stock"
active: true
```

### districts collection

Create documents for each district:

```
[Document 1]  name: "Dhaka",         deliveryCharge: 70,  active: true
[Document 2]  name: "Chattogram",    deliveryCharge: 130, active: true
[Document 3]  name: "Sylhet",        deliveryCharge: 130, active: true
[Document 4]  name: "Rajshahi",      deliveryCharge: 130, active: true
[Document 5]  name: "Khulna",        deliveryCharge: 130, active: true
[Document 6]  name: "Barishal",      deliveryCharge: 130, active: true
[Document 7]  name: "Rangpur",       deliveryCharge: 130, active: true
[Document 8]  name: "Mymensingh",    deliveryCharge: 130, active: true
```

### payment_settings collection

Create one document with ID `main`:

```
cod: { enabled: true }
bkash: { enabled: true, number: "01XXXXXXXXX", instructions: "Send money to this bKash number and enter the Transaction ID." }
nagad: { enabled: true, number: "01XXXXXXXXX", instructions: "Send money to this Nagad number and enter the Transaction ID." }
```

### landing_content collection

Create one document with ID `main`:

```
hero: {
  title: "Premium Organic Mehendi",
  subtitle: "Natural, safe, and long-lasting color for your special occasions",
  ctaText: "Order Now"
}
benefits: [
  {title: "100% Organic", description: "Made from pure natural henna leaves, no chemicals", icon: "leaf"},
  {title: "Chemical Free", description: "No PPD, no ammonia, completely safe for your skin", icon: "shield"},
  {title: "Long Lasting Color", description: "Rich dark stain that lasts up to 2 weeks", icon: "sparkles"},
  {title: "Safe for Skin", description: "Dermatologically tested, suitable for all skin types", icon: "heart"}
]
features: [
  "100% Natural Ingredients",
  "Easy to Apply",
  "Dark & Rich Stain",
  "No Chemicals",
  "Suitable for All Skin Types",
  "Long Lasting Results"
]
whyChooseUs: "KTalk Mehendi is crafted from the finest organic henna leaves sourced directly from trusted farms. Our unique processing method preserves the natural dye content, giving you the richest, darkest stain without any harmful chemicals. Every batch is tested for purity and safety."
footerContent: "KTalk - Premium Organic Mehendi. Natural beauty, naturally yours."
```

### reviews collection

Create 3-4 sample reviews:

```
[Document 1] customerName: "Fatima Akhter",  text: "Amazing quality! The color lasted so long and my design was beautiful. I got so many compliments at the wedding.",  rating: 5
[Document 2] customerName: "Ayesha Rahman",  text: "Best mehendi I've ever used. No irritation at all. My skin felt great after using it.",              rating: 5
[Document 3] customerName: "Sadia Islam",    text: "Quick delivery and great product. The color came out so dark. Highly recommend!",                    rating: 5
[Document 4] customerName: "Nusrat Jahan",   text: "I was skeptical at first but this is genuinely the best organic mehendi in Bangladesh.",             rating: 4
```

### faqs collection

```
[Document 1] question: "Is KTalk Mehendi 100% natural?",               answer: "Yes! Our mehendi is made from pure organic henna leaves with no chemicals or additives whatsoever.", order: 1
[Document 2] question: "How long does the color last?",                 answer: "The stain typically lasts 1-2 weeks depending on your skin type and how well you follow the aftercare instructions.", order: 2
[Document 3] question: "Do you deliver outside Dhaka?",                 answer: "Yes! We deliver all across Bangladesh. Delivery charges vary by district and are shown at checkout.", order: 3
[Document 4] question: "What payment methods do you accept?",           answer: "We accept Cash on Delivery, bKash, and Nagad payments.", order: 4
[Document 5] question: "Is it safe for sensitive skin?",                answer: "Absolutely. Our mehendi is dermatologically tested and completely free from PPD, ammonia, and other harsh chemicals.", order: 5
[Document 6] question: "How long does delivery take?",                  answer: "Delivery within Dhaka takes 1-2 business days. Outside Dhaka, it takes 2-4 business days depending on your location.", order: 6
[Document 7] question: "Can I return or get a refund?",                 answer: "If you receive a damaged or incorrect product, please contact us within 24 hours of delivery for a replacement or refund.", order: 7
```

---

## Step 11: Test Locally

```bash
npm run dev
```

- Landing page: http://localhost:3000
- Admin login: http://localhost:3000/admin/login
- Admin dashboard: http://localhost:3000/admin

---

## Step 12: Deploy to Vercel (When Ready)

1. Push code to a GitHub repository
2. Go to https://vercel.com and import the repo
3. Add the same environment variables from `.env.local` to Vercel's project settings
4. Deploy

---

## Firebase Free Tier Limits (Spark Plan)

| Service | Free Limit | Enough For |
|---------|-----------|------------|
| Authentication | Unlimited users | ✔ |
| Firestore | 1 GiB stored, 50K reads/day | ✔ Small business |
| Storage | 5 GiB stored, 1 GiB/day download | ✔ Product images |
