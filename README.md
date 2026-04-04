# 📸 KwikPic - Smart Face Matching for Events

Welcome to **KwikPic**! This project is a smart photo sharing platform that uses **Face Recognition** to help people find their photos from events (like weddings, parties, or conferences) instantly.

---

## 🧐 What This Project Does

Imagine you go to a wedding. The photographer takes thousands of photos. Instead of scrolling through all of them to find yourself, you simply:
1.  **Upload a selfie.**
2.  **The system scans all event photos.**
3.  **It magically shows you ONLY the photos you are in!**

It saves time and makes sharing event photos super easy and private.

---

## ⚙️ How It Works (In Simple Words)

1.  **Photographer Uploads**: A photographer creates a group (e.g., "John's Wedding") and uploads all the event photos.
2.  **Face Scanning**: The system (Face Service) looks at every photo, finds faces, and creates a unique digital "fingerprint" (embedding) for each face.
3.  **Client Search**: A guest visits the site, enters the event code, and takes a selfie.
4.  **Matching**: The system compares the guest's selfie "fingerprint" with all the stored face fingerprints.
5.  **Results**: If there's a match, that photo is shown to the guest.

---

## 📂 Folder Structure

Here is how the project is organized:

-   **`frontend/`** (The User Interface)
    -   Built with **React** and **Vite**.
    -   This is what you see in the browser (pages for uploading, viewing photos, taking selfies).
-   **`backend/`** (The Brain)
    -   Built with **Node.js** and **Express**.
    -   Handles user accounts, file uploads, and talks to the database.
-   **`face-service/`** (The AI Power)
    -   Built with **Python** and **FastAPI**.
    -   Uses **InsightFace** to detect and recognize faces.
-   **`docker-compose.yml`**
    -   A script to run all three parts (Frontend, Backend, Face Service) + Database together easily.

---

## 🚀 How to Run It (Step-by-Step)

The easiest way to run this is using **Docker**.

### Prerequisites
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.
-   A [Cloudinary](https://cloudinary.com/) account (for storing images).

### Steps

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd Metapic
    ```

2.  **Configure Environment Variables**
    -   Go to the `backend` folder.
    -   Create a file named `.env`.
    -   Add your keys (Cloudinary, MongoDB URI, etc.). You can look at `.env.example` if it exists, or use these keys:
        ```env
        MONGO_URI=mongodb://mongo:27017/kwikpic
        CLOUDINARY_CLOUD_NAME=your_cloud_name
        CLOUDINARY_API_KEY=your_api_key
        CLOUDINARY_API_SECRET=your_api_secret
        JWT_SECRET=supersecretkey
        FACE_SERVICE_URL=http://face-service:8000
        SMTP_HOST=smtp.mailtrap.io
        SMTP_PORT=2525
        SMTP_USER=your_smtp_user
        SMTP_PASS=your_smtp_pass
        FRONTEND_URL=http://localhost:5173
        ```

3.  **Run with Docker**
    Open your terminal in the main folder and run:
    ```bash
    docker-compose up --build
    ```

4.  **Open in Browser**
    -   **Frontend**: [http://localhost:5173](http://localhost:5173)
    -   **Backend API**: [http://localhost:4000](http://localhost:4000)
    -   **Face Service**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔌 APIs & Endpoints

Here are the main ways the app talks to the server:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/groups` | Create a new photo group (Event). |
| **POST** | `/api/groups/:id/upload` | Upload photos to a group. |
| **POST** | `/api/client/join` | Client joins a group using a code. |
| **POST** | `/api/client/:groupCode/upload-selfie` | Upload a selfie to find matches. |

---

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS (for styling).
-   **Backend**: Node.js, Express.js.
-   **Database**: MongoDB (stores photo data).
-   **Image Storage**: Cloudinary (stores the actual image files).
-   **AI/ML**: Python, FastAPI, InsightFace (for face recognition).
-   **Containerization**: Docker.

---

## 💡 Real-World Use Cases

-   **Weddings**: Guests get their own photos without pestering the couple.
-   **Marathons/Sports**: Runners find their race photos using their face.
-   **Conferences**: Attendees get their networking photos instantly.
-   **School Events**: Parents find photos of their specific child.

---

## ⚠️ Limitations & Future Improvements

**Current Limitations:**
-   **Accuracy**: Face recognition isn't 100% perfect. Blurry photos or side profiles might be missed.
-   **Speed**: Processing thousands of photos can take time.

**Future Improvements:**
-   [ ] Add support for video face matching.
-   [ ] Improve matching speed with a vector database (like Pinecone).
-   [ ] Add a mobile app version.

---

*Documentation created by Antigravity.*
