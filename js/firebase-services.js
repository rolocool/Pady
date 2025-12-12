// PADY Healthcare System - Complete Firebase Services
// Handles all database operations for both User and Admin portals

class PADYFirebaseService {
  constructor() {
    this.collections = {
      users: db.collection('users'),
      patients: db.collection('patients'),
      appointments: db.collection('appointments'),
      doctors: db.collection('doctors'),
      hospitals: db.collection('hospitals'),
      staff: db.collection('staff'),
      bills: db.collection('bills'),
      testResults: db.collection('testResults'),
      operations: db.collection('operations'),
      consultations: db.collection('consultations'),
      medications: db.collection('medications')
    };
  }

  // ============================================
  // AUTHENTICATION & USER MANAGEMENT
  // ============================================

  async signUp(email, password, userData) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await user.updateProfile({
        displayName: userData.displayName
      });

      // Create user document
      await this.collections.users.doc(user.uid).set({
        uid: user.uid,
        email: email,
        displayName: userData.displayName,
        role: userData.role || 'patient', // 'patient', 'admin', 'doctor', 'staff'
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        address: userData.address || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      this.showNotification('success', 'Account created successfully!');
      return user;
    } catch (error) {
      console.error('Sign up error:', error);
      this.showNotification('error', this.getErrorMessage(error.code));
      throw error;
    }
  }

  async signIn(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      this.showNotification('success', 'Welcome back!');
      return userCredential.user;
    } catch (error) {
      console.error('Sign in error:', error);
      this.showNotification('error', this.getErrorMessage(error.code));
      throw error;
    }
  }

  async signOut() {
    try {
      await auth.signOut();
      this.showNotification('info', 'Logged out successfully');
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  async getCurrentUserData() {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const doc = await this.collections.users.doc(user.uid).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // ============================================
  // PATIENTS
  // ============================================

  async createPatient(patientData) {
    try {
      const docRef = await this.collections.patients.add({
        ...patientData,
        status: 'active',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: auth.currentUser?.uid || 'system'
      });

      this.showNotification('success', 'Patient added successfully!');
      return { id: docRef.id, ...patientData };
    } catch (error) {
      console.error('Error creating patient:', error);
      this.showNotification('error', 'Failed to add patient');
      throw error;
    }
  }

  async getPatients() {
    try {
      const snapshot = await this.collections.patients.orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting patients:', error);
      return [];
    }
  }

  async getPatient(patientId) {
    try {
      const doc = await this.collections.patients.doc(patientId).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      console.error('Error getting patient:', error);
      return null;
    }
  }

  async updatePatient(patientId, patientData) {
    try {
      await this.collections.patients.doc(patientId).update({
        ...patientData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.showNotification('success', 'Patient updated successfully!');
    } catch (error) {
      console.error('Error updating patient:', error);
      this.showNotification('error', 'Failed to update patient');
      throw error;
    }
  }

  async deletePatient(patientId) {
    try {
      await this.collections.patients.doc(patientId).delete();
      this.showNotification('success', 'Patient deleted successfully!');
    } catch (error) {
      console.error('Error deleting patient:', error);
      this.showNotification('error', 'Failed to delete patient');
      throw error;
    }
  }

  // ============================================
  // APPOINTMENTS
  // ============================================

  async createAppointment(appointmentData) {
    try {
      const docRef = await this.collections.appointments.add({
        ...appointmentData,
        status: appointmentData.status || 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: auth.currentUser?.uid || 'system'
      });

      this.showNotification('success', 'Appointment booked successfully!');
      return { id: docRef.id, ...appointmentData };
    } catch (error) {
      console.error('Error creating appointment:', error);
      this.showNotification('error', 'Failed to book appointment');
      throw error;
    }
  }

  async getAppointments() {
    try {
      const snapshot = await this.collections.appointments.orderBy('date', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting appointments:', error);
      return [];
    }
  }

  async getPatientAppointments(patientId) {
    try {
      const snapshot = await this.collections.appointments
        .where('patientId', '==', patientId)
        .orderBy('date', 'desc')
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting patient appointments:', error);
      return [];
    }
  }

  async updateAppointment(appointmentId, appointmentData) {
    try {
      await this.collections.appointments.doc(appointmentId).update({
        ...appointmentData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.showNotification('success', 'Appointment updated!');
    } catch (error) {
      console.error('Error updating appointment:', error);
      this.showNotification('error', 'Failed to update appointment');
      throw error;
    }
  }

  // ============================================
  // DOCTORS
  // ============================================

  async createDoctor(doctorData) {
    try {
      const docRef = await this.collections.doctors.add({
        ...doctorData,
        status: 'active',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.showNotification('success', 'Doctor added successfully!');
      return { id: docRef.id, ...doctorData };
    } catch (error) {
      console.error('Error creating doctor:', error);
      this.showNotification('error', 'Failed to add doctor');
      throw error;
    }
  }

  async getDoctors() {
    try {
      const snapshot = await this.collections.doctors.where('status', '==', 'active').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting doctors:', error);
      return [];
    }
  }

  async updateDoctor(doctorId, doctorData) {
    try {
      await this.collections.doctors.doc(doctorId).update({
        ...doctorData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.showNotification('success', 'Doctor updated!');
    } catch (error) {
      console.error('Error updating doctor:', error);
      throw error;
    }
  }

  // ============================================
  // HOSPITALS
  // ============================================

  async createHospital(hospitalData) {
    try {
      const docRef = await this.collections.hospitals.add({
        ...hospitalData,
        status: 'active',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.showNotification('success', 'Hospital added successfully!');
      return { id: docRef.id, ...hospitalData };
    } catch (error) {
      console.error('Error creating hospital:', error);
      this.showNotification('error', 'Failed to add hospital');
      throw error;
    }
  }

  async getHospitals() {
    try {
      const snapshot = await this.collections.hospitals.where('status', '==', 'active').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting hospitals:', error);
      return [];
    }
  }

  // ============================================
  // BILLS
  // ============================================

  async createBill(billData) {
    try {
      const docRef = await this.collections.bills.add({
        ...billData,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.showNotification('success', 'Bill generated successfully!');
      return { id: docRef.id, ...billData };
    } catch (error) {
      console.error('Error creating bill:', error);
      this.showNotification('error', 'Failed to generate bill');
      throw error;
    }
  }

  async getPatientBills(patientId) {
    try {
      const snapshot = await this.collections.bills
        .where('patientId', '==', patientId)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting patient bills:', error);
      return [];
    }
  }

  async updateBillStatus(billId, status, paymentData = {}) {
    try {
      await this.collections.bills.doc(billId).update({
        status: status,
        ...paymentData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.showNotification('success', 'Payment processed successfully!');
    } catch (error) {
      console.error('Error updating bill:', error);
      this.showNotification('error', 'Failed to process payment');
      throw error;
    }
  }

  // ============================================
  // TEST RESULTS
  // ============================================

  async createTestResult(testData) {
    try {
      const docRef = await this.collections.testResults.add({
        ...testData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.showNotification('success', 'Test result added!');
      return { id: docRef.id, ...testData };
    } catch (error) {
      console.error('Error creating test result:', error);
      this.showNotification('error', 'Failed to add test result');
      throw error;
    }
  }

  async getPatientTestResults(patientId) {
    try {
      const snapshot = await this.collections.testResults
        .where('patientId', '==', patientId)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting test results:', error);
      return [];
    }
  }

  // ============================================
  // OPERATIONS
  // ============================================

  async scheduleOperation(operationData) {
    try {
      const docRef = await this.collections.operations.add({
        ...operationData,
        status: 'scheduled',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.showNotification('success', 'Operation scheduled!');
      return { id: docRef.id, ...operationData };
    } catch (error) {
      console.error('Error scheduling operation:', error);
      this.showNotification('error', 'Failed to schedule operation');
      throw error;
    }
  }

  async getOperations() {
    try {
      const snapshot = await this.collections.operations.orderBy('scheduledDate', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting operations:', error);
      return [];
    }
  }

  // ============================================
  // CONSULTATIONS
  // ============================================

  async createConsultation(consultationData) {
    try {
      const docRef = await this.collections.consultations.add({
        ...consultationData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.showNotification('success', 'Consultation recorded!');
      return { id: docRef.id, ...consultationData };
    } catch (error) {
      console.error('Error creating consultation:', error);
      this.showNotification('error', 'Failed to record consultation');
      throw error;
    }
  }

  async getPatientConsultations(patientId) {
    try {
      const snapshot = await this.collections.consultations
        .where('patientId', '==', patientId)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting consultations:', error);
      return [];
    }
  }

  // ============================================
  // DASHBOARD STATISTICS
  // ============================================

  async getDashboardStats() {
    try {
      const [patients, appointments, doctors, todayAppointments] = await Promise.all([
        this.collections.patients.get(),
        this.collections.appointments.get(),
        this.collections.doctors.where('status', '==', 'active').get(),
        this.getTodayAppointments()
      ]);

      const pendingAppointments = appointments.docs.filter(
        doc => doc.data().status === 'pending'
      ).length;

      return {
        totalPatients: patients.size,
        totalAppointments: appointments.size,
        totalDoctors: doctors.size,
        todayAppointments: todayAppointments.length,
        pendingAppointments: pendingAppointments
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalPatients: 0,
        totalAppointments: 0,
        totalDoctors: 0,
        todayAppointments: 0,
        pendingAppointments: 0
      };
    }
  }

  async getTodayAppointments() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const snapshot = await this.collections.appointments
        .where('date', '>=', today)
        .where('date', '<', tomorrow)
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting today appointments:', error);
      return [];
    }
  }

  // ============================================
  // REAL-TIME LISTENERS
  // ============================================

  listenToCollection(collectionName, callback, query = null) {
    let ref = this.collections[collectionName];
    
    if (query) {
      Object.keys(query).forEach(key => {
        ref = ref.where(key, '==', query[key]);
      });
    }

    return ref.onSnapshot(snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, error => {
      console.error(`Error listening to ${collectionName}:`, error);
    });
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  showNotification(type, message) {
    if (typeof showNotification === 'function') {
      showNotification(type, message);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'Email already in use',
      'auth/invalid-email': 'Invalid email address',
      'auth/operation-not-allowed': 'Operation not allowed',
      'auth/weak-password': 'Password is too weak (min 6 characters)',
      'auth/user-disabled': 'User account has been disabled',
      'auth/user-not-found': 'User not found',
      'auth/wrong-password': 'Incorrect password',
      'auth/too-many-requests': 'Too many requests. Try again later',
      'auth/network-request-failed': 'Network error. Check your connection'
    };
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
  }

  // Format date helper
  formatDate(date) {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Format time helper
  formatTime(date) {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Initialize Firebase Service
const padyDB = new PADYFirebaseService();

console.log('✅ PADY Firebase Service initialized');
