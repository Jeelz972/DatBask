// js/firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
            apiKey: "AIzaSyBaA99che1oz9BHc23IhiFoY-nK0xvg4q4",
            authDomain: "statu18elite.firebaseapp.com",
            projectId: "statu18elite",
            storageBucket: "statu18elite.appspot.com",
            messagingSenderId: "862850988986",
            appId: "1:862850988986:web:d64afc2c94eb50a1f6fb83",
            measurementId: "G-VNEB7Z8ZR1"
        };

// Initialisation
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
