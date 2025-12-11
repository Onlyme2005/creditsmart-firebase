import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Tu configuración de Firebase (OBTÉN ESTO DE LA CONSOLA)
const firebaseConfig = {
  apiKey: "AIzaSyCnPFH--oPBsu-gmxdu0LZqJmDcNi8yHl0",
  authDomain: "creditsmart-80c37.firebaseapp.com",
  projectId: "creditsmart-80c37",
  storageBucket: "creditsmart-80c37.firebasestorage.app",
  messagingSenderId: "257586256356",
  appId: "1:257586256356:web:59738ccbb1e804e8528ff1"
};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };