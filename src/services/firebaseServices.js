import { collection, addDoc, getDocs, query, where, orderBy,Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";

// CRUD para Créditos
export const creditService = {
  // Obtener todos los créditos
  async getAllCredits() {
    try {
      const creditsRef = collection(db, "credits");
      const snapshot = await getDocs(creditsRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error obteniendo créditos:", error);
      throw error;
    }
  },

  // Obtener crédito por ID
  async getCreditById(id) {
    try {
      const creditsRef = collection(db, "credits");
      const q = query(creditsRef, where("__name__", "==", id));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))[0];
    } catch (error) {
      console.error("Error obteniendo crédito:", error);
      throw error;
    }
  }
};

// CRUD para Solicitudes
export const applicationService = {
  // Crear nueva solicitud
  async createApplication(applicationData) {
    try {
      const applicationsRef = collection(db, "applications");
      const applicationWithTimestamp = {
        ...applicationData,
        date: Timestamp.now(),
        status: "Pendiente"
      };
      const docRef = await addDoc(applicationsRef, applicationWithTimestamp);
      return { id: docRef.id, ...applicationWithTimestamp };
    } catch (error) {
      console.error("Error creando solicitud:", error);
      throw error;
    }
  },

  // Obtener solicitudes por email
  async getApplicationsByEmail(email) {
    try {
      const applicationsRef = collection(db, "applications");
      const q = query(
        applicationsRef, 
        where("email", "==", email),
        orderBy("date", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error obteniendo solicitudes:", error);
      throw error;
    }
  },

  // Obtener todas las solicitudes (para admin)
  async getAllApplications() {
    try {
      const applicationsRef = collection(db, "applications");
      const q = query(applicationsRef, orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error obteniendo todas las solicitudes:", error);
      throw error;
    }
  },

  // Buscar solicitudes por múltiples filtros
  async searchApplications(filters) {
    try {
      let q = query(collection(db, "applications"));
      
      if (filters.email) {
        q = query(q, where("email", "==", filters.email));
      }
      
      if (filters.creditType) {
        q = query(q, where("creditType", "==", filters.creditType));
      }
      
      if (filters.minAmount) {
        q = query(q, where("amount", ">=", Number(filters.minAmount)));
      }
      
      if (filters.maxAmount) {
        q = query(q, where("amount", "<=", Number(filters.maxAmount)));
      }
      
      if (filters.status) {
        q = query(q, where("status", "==", filters.status));
      }
      
      q = query(q, orderBy("date", "desc"));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error buscando solicitudes:", error);
      throw error;
    }
  }
};