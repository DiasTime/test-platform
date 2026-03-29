import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

async function createAdmin() {
  const adminData = {
    email: "admin@test.com",
    iin: "000000000000",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const existingAdmin = await db
    .collection("users")
    .where("email", "==", adminData.email)
    .limit(1)
    .get();

  if (!existingAdmin.empty) {
    console.log("Admin already exists");
    const docId = existingAdmin.docs[0].id;
    await db.collection("users").doc(docId).update({ role: "admin" });
    console.log("Updated existing user to admin");
    return;
  }

  const docRef = await db.collection("users").add(adminData);
  console.log("Admin created with ID:", docRef.id);
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
