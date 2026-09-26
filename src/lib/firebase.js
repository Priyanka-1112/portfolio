const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

// Only these signed-in accounts can open the admin panel. Must match firestore.rules.
const ADMIN_EMAILS = String(env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const isConfigured = !!firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('YOUR');

// Firebase SDK is loaded lazily so the demo build (and first paint) stays light.
let ready;
let db, auth, fs, fa;
function init() {
  ready ??= (async () => {
    const [{ initializeApp }, firestore, fbAuth] = await Promise.all([
      import('firebase/app'),
      import('firebase/firestore'),
      import('firebase/auth'),
    ]);
    fs = firestore;
    fa = fbAuth;
    const app = initializeApp(firebaseConfig);
    db = fs.getFirestore(app);
    auth = fa.getAuth(app);
  })();
  return ready;
}

// ---- demo (no Firebase) fallbacks ----
const LS_CONTENT = 'ba-portfolio-content';
const LS_MSGS = 'ba-portfolio-messages';
const SS_ADMIN = 'ba-portfolio-demo-admin';
const demoListeners = new Set();
const demoUser = () =>
  sessionStorage.getItem(SS_ADMIN) ? { email: 'demo@local', displayName: 'Demo Admin', photoURL: '', uid: 'demo' } : null;
const readLS = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d;
  } catch {
    return d;
  }
};

export async function loadContent() {
  if (!isConfigured) return readLS(LS_CONTENT, null);
  await init();
  const snap = await fs.getDoc(fs.doc(db, 'portfolio', 'content'));
  return snap.exists() ? snap.data() : null;
}

export async function saveContent(content) {
  if (!isConfigured) {
    localStorage.setItem(LS_CONTENT, JSON.stringify(content));
    return;
  }
  await init();
  await fs.setDoc(fs.doc(db, 'portfolio', 'content'), { ...content, updatedAt: fs.serverTimestamp() });
}

export async function sendMessage(m) {
  const msg = { name: m.name.trim(), email: m.email.trim(), topic: m.topic || '', message: m.message.trim() };
  if (!isConfigured) {
    const list = readLS(LS_MSGS, []);
    list.unshift({ ...msg, id: String(Date.now()), createdAt: Date.now() });
    localStorage.setItem(LS_MSGS, JSON.stringify(list));
    return;
  }
  await init();
  await fs.addDoc(fs.collection(db, 'messages'), { ...msg, createdAt: fs.serverTimestamp() });
}

export async function listMessages() {
  if (!isConfigured) return readLS(LS_MSGS, []);
  await init();
  const q = fs.query(fs.collection(db, 'messages'), fs.orderBy('createdAt', 'desc'));
  const snap = await fs.getDocs(q);
  return snap.docs.map((d) => {
    const x = d.data();
    return { ...x, id: d.id, createdAt: x.createdAt?.toMillis ? x.createdAt.toMillis() : x.createdAt };
  });
}

export async function deleteMessage(id) {
  if (!isConfigured) {
    localStorage.setItem(LS_MSGS, JSON.stringify(readLS(LS_MSGS, []).filter((m) => m.id !== id)));
    return;
  }
  await init();
  await fs.deleteDoc(fs.doc(db, 'messages', id));
}

export async function signInWithGoogle() {
  if (!isConfigured) {
    sessionStorage.setItem(SS_ADMIN, '1');
    demoListeners.forEach((cb) => cb(demoUser()));
    return;
  }
  await init();
  const provider = new fa.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await fa.signInWithPopup(auth, provider);
}

export async function signOutUser() {
  if (!isConfigured) {
    sessionStorage.removeItem(SS_ADMIN);
    demoListeners.forEach((cb) => cb(null));
    return;
  }
  await init();
  await fa.signOut(auth);
}

export async function onAuth(cb) {
  if (!isConfigured) {
    demoListeners.add(cb);
    cb(demoUser());
    return () => demoListeners.delete(cb);
  }
  await init();
  return fa.onAuthStateChanged(auth, cb);
}

export function isAdmin(user) {
  if (!user) return false;
  if (!isConfigured) return true;
  return ADMIN_EMAILS.includes((user.email || '').toLowerCase());
}
