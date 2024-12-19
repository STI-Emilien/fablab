import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBaFwA2kJM8CvlzBBkeCkq1CdlYclcxNZ0",
    authDomain: "sti2d-file-attente.firebaseapp.com",
    projectId: "sti2d-file-attente",
    storageBucket: "sti2d-file-attente.firebasestorage.app",
    messagingSenderId: "861290828360",
    appId: "1:861290828360:web:749ffe7565bd95db273e7d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let lastSubmissionTime = 0;
let currentUser = null;

// Authentification utilisateur
auth.onAuthStateChanged((user) => {
    if (user) {
        const userEmail = user.email;

        if (!userEmail.endsWith('@lyc-buisson.com')) {
            alert('Vous devez utiliser une adresse email valide @lyc-buisson.com');
            auth.signOut();
            window.location.href = 'login.html';
            return;
        }

        const [firstName, lastName] = userEmail.split('@')[0].split('.');
        const formattedName = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)}.${lastName.charAt(0).toUpperCase()}`;
        currentUser = formattedName;

        document.getElementById('nom-client').textContent = formattedName;
        document.getElementById('student-name').value = formattedName;
        document.getElementById('client-container').classList.remove('hidden');

        // Formulaire d'envoi de ticket
        const ticketForm = document.getElementById('ticket-form');
        ticketForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentTime = Date.now();
            if (currentTime - lastSubmissionTime < 30000) {
                document.getElementById('anti-spam-message').classList.remove('hidden');
                return;
            }

            document.getElementById('anti-spam-message').classList.add('hidden');

            const prof = document.getElementById('professeur').value;
            try {
                await addDoc(collection(db, 'demandes'), {
                    nom: formattedName,
                    professeur: prof,
                    timestamp: serverTimestamp()
                });
                lastSubmissionTime = currentTime;
            } catch (err) {
                console.error("Erreur lors de l'envoi de la demande :", err);
            }
        });

        // Affichage des demandes
        const demandeTableBody = document.getElementById('demande-table').querySelector('tbody');
        const demandesRef = collection(db, 'demandes');
        const demandesQuery = query(demandesRef, orderBy("timestamp", "asc"));


        onSnapshot(demandesQuery, (snapshot) => {
demandeTableBody.innerHTML = ''; // Réinitialiser le tableau à chaque mise à jour
let id = 1;
snapshot.forEach((docSnapshot) => {  // Modifier doc en docSnapshot pour éviter toute confusion
const data = docSnapshot.data(); // Récupère les données du document
const row = document.createElement('tr');

const idCell = document.createElement('td');
idCell.textContent = id++;
row.appendChild(idCell);

const nameCell = document.createElement('td');
nameCell.textContent = data.nom;
row.appendChild(nameCell);

const profCell = document.createElement('td');
profCell.textContent = data.professeur;
row.appendChild(profCell);

const timeCell = document.createElement('td');
const requestTime = data.timestamp ? new Date(data.timestamp.toMillis()) : new Date();
timeCell.textContent = requestTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
row.appendChild(timeCell);

const actionCell = document.createElement('td');
if (data.nom === currentUser) {  // Vérification si l'élève est le bon utilisateur
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '-';
    deleteButton.addEventListener('click', async () => {
        try {
            const docRef = doc(db, 'demandes', docSnapshot.id); // Utilisation de docSnapshot.id pour obtenir la référence du document
            await deleteDoc(docRef);  // Suppression du document
            console.log("Demande supprimée :", docSnapshot.id); // Vérification dans la console
        } catch (err) {
            console.error("Erreur lors de la suppression :", err);
            alert("Erreur lors de la suppression de la demande.");
        }
    });
    actionCell.appendChild(deleteButton);
}
row.appendChild(actionCell);

demandeTableBody.appendChild(row);
});
});
    } else {
        window.location.href = 'login.html';
    }
});

// Déconnexion utilisateur
const logoutButton = document.getElementById('logout-client');
logoutButton.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
});

const actionCell = document.createElement('td');
if (data.nom === currentUser) {  // Vérifier si c'est la demande de l'utilisateur
const deleteButton = document.createElement('button');
deleteButton.textContent = 'Supprimer';
deleteButton.addEventListener('click', async () => {
try {
    const docRef = doc(db, 'demandes', doc.id); // Référence du document à supprimer
    await deleteDoc(docRef); // Supprimer le document
    console.log("Demande supprimée :", doc.id); // Log pour vérification
} catch (err) {
    console.error("Erreur lors de la suppression :", err);
    alert("Erreur lors de la suppression de la demande.");
}
});
actionCell.appendChild(deleteButton);
}
row.appendChild(actionCell);