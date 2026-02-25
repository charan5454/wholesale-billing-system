# Cloud Deployment Guide - Kanamoni's Interest Calculator

To make your website work even when your laptop is off, we need to move it to the **Cloud**. Here is the step-by-step plan:

## 1. Create a GitHub Repository
The cloud needs a place to "pull" your code from.
1. Go to [GitHub.com](https://github.com) and create a free account if you don't have one.
2. Create a NEW repository named `interest-calculator`.
3. Upload all the files from your folder `c:\Users\kanam\OneDrive\Antigravity Codes\interest-calculator` to this repository.
   - *Note: My added `.gitignore` will automatically prevent secret files like `.env` from being uploaded.*

## 2. Set up a Cloud Database
Since you won't use your local MySQL, we need a cloud one.
1. Go to [Aiven.io](https://aiven.io/) or [Railway.app](https://railway.app/).
2. Create a free **MySQL** database.
3. Copy the **Connection URI** or credentials (Host, User, Password, Port).

## 3. Deploy on Render (The Hosting Site)
1. Go to [Render.com](https://render.com/) and sign up.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub account and select your `interest-calculator` repository.
4. **Settings**:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**: Add the following from your cloud database:
   - `DB_HOST`: (your cloud host)
   - `DB_USER`: (your cloud user)
   - `DB_PASSWORD`: (your cloud password)
   - `DB_NAME`: (your cloud db name)
   - `DB_SSL`: `true`
   - `JWT_SECRET`: (pick any random text)

## 4. Final Result
Once Render finishes building (takes ~2 minutes), it will give you a link like:
`https://your-app-name.onrender.com`

**This link will work 24/7 on any device, even when your laptop is turned off!**
