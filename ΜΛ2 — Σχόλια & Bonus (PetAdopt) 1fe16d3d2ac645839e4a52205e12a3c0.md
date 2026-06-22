# ΜΛ2 — Σχόλια & Bonus (PetAdopt)

<aside>
🎯

Διόρθωση των απαντήσεων σου + πλήρης οδηγός σχολίων (Ερώτημα 4) + δύσκολες bonus ερωτήσεις + άσκηση από άλλα labs.

</aside>

## ✅ Διόρθωση των απαντήσεών σου

### Ερώτημα 1 (AVA) — ΣΩΣΤΟ ✅

Το test σου είναι σωστό: prefix `api/v1/` (χωρίς leading slash), `res.status`, `await res.json()`, και `body.data.name` (γιατί το `ok()` τυλίγει σε `{ success, message, data }`). Καμία αλλαγή.

### Ερώτημα 2 (Cypress) — 1 ΒΑΣΙΚΟ λάθος ❌

Το `cy.url().should("include", "//pets/:id/")` είναι λάθος: (α) διπλό slash `//`, (β) το `:id` είναι placeholder — στο πραγματικό URL γράφει `/pets/1`, όχι τη λέξη `:id`. Το `include` θέλει υπο-συμβολοσειρά που όντως υπάρχει → `/pets/`.

```jsx
it("pet flow -> login", () => {
  cy.visit("http://localhost:3000");
  cy.get(".pet-card").should("have.length", 5);
  cy.get(".pet-card").first().click();
  cy.url().should("include", "/pets/");   // ✅ όχι "//pets/:id/"
  cy.contains("button", "Adopt").click();
  cy.url().should("include", "/login");
});
```

<aside>
💡

Το σχόλιό σου «όλο το card είναι <Link> → /events/:id» είναι leftover από το Thessevent — εδώ το route είναι `/pets/:id`.

</aside>

### Ερώτημα 3 (ESLint) — 21 → 0 warnings (πιο προσεκτικά απ' ό,τι νομίζεις)

<aside>
⚠️

Προσοχή στα `result == null` στους controllers: **ΜΗΝ τα κάνεις `=== null`!** Το `.find()` γυρίζει `undefined`, όχι `null` → το `=== null` δεν πιάνει ποτέ το 404 (εισάγεις bug). Σωστό: `if (!result)`.

</aside>

| Αρχείο / warning | Σωστή διόρθωση |
| --- | --- |
| `database.js` connectionAttempted (unused + prefer-const) | Σβήσε τη γραμμή — φεύγουν και τα 2 warnings |
| `petController.js:12` eqeqeq | `result == null` → **`if (!result)`** (ΌΧΙ ===) |
| `shelterController.js:1` created unused | `import { ok, notFound }` (βγάλε `created`) |
| `shelterController.js:7` eqeqeq | `result == null` → **`if (!result)`** |
| `userController.js:1` created unused | `import { ok, badRequest, unauthorized }` (βγάλε `created`) |
| `userController.js:11` eqeqeq | `result == null` → **`if (!result)`** |
| `auth.js:10,22` eqeqeq (`== null`) | `=== null` ✅ (η decodeToken γυρίζει ρητά null) — ή `if (!decoded)` |
| `auth.js:13,25` eqeqeq (`!=`) | `!= 'user'/'shelter'` → `!==` |
| `errorHandler.js:1` _next unused | **ΜΗΝ το σβήσεις** (χρειάζεται 4 args) → config `argsIgnorePattern: "^_"` |
| `petRoutes.js:3-4` 3 unused imports | Βγάλε τις 2 γραμμές import (authenticateUser/Shelter, validatePetId) |
| `userRoutes.js:3` validateLogin/Language unused | Βγάλε τη γραμμή import |
| `helpers.js:2,7` password unused | **ΜΗΝ το αλλάξεις** → config `ignoreRestSiblings: true` |
| `validators.js:1` var + unused | Σβήσε τη γραμμή `var validationStrict` — φεύγουν και τα 2 |

Στο `.eslintrc.json` (για _next & password — χωρίς να σβήσεις κώδικα):

```json
"no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "ignoreRestSiblings": true }]
```

<aside>
🔧

Το `--fix` προσφέρει μόνο **2** (τα ασφαλή). Τα `no-unused-vars` ΠΟΤΕ auto-fix, και τα `== null` ΔΕΝ τα αγγίζει (θα άλλαζε σημασιολογία). Άρα τα περισσότερα χειροκίνητα.

</aside>

---

## ✍️ Ερώτημα 4 — Πλήρως σχολιασμένος κώδικας (ανά τύπο αρχείου)

<aside>
🧭

**2 κανόνες:** ① ένα **file-header** πάνω-πάνω σε ΚΑΘΕ αρχείο · ② ένα **JSDoc** πάνω από ΚΑΘΕ function/component. Inline ΜΟΝΟ σε μη-προφανή σημεία.

</aside>

### 🔹 Entry point — `server.js` & `app.js`

```jsx
/**
 * server.js -- Entry point: συνδέει τη (mock) βάση και σηκώνει τον HTTP server.
 */
connectDatabase();                 // init σύνδεσης πριν δεχτούμε requests
app.listen(config.port, () => console.log(`PetAdopt API on :${config.port}`));
```

```jsx
/**
 * app.js -- Ρυθμίζει τον Express app: CORS, JSON parsing, routes, error handling.
 */
const app = express();
app.use(cors({ origin: config.corsOrigin })); // δέξου requests από το frontend (:3000)
app.use(express.json());                       // parse JSON body (αλλιώς req.body = undefined)
app.use(config.apiPrefix, routes);             // όλα τα routes κάτω από /api/v1
app.use(errorHandler);                         // ΠΑΝΤΑ τελευταίο
export default app;
```

### 🔹 `config/` — file-header + JSDoc στις functions

```jsx
/**
 * database.js -- (Mock) διαχείριση σύνδεσης βάσης.
 */
let isConnected = false;

/**
 * Αρχικοποιεί τη σύνδεση με τη βάση.
 * @returns {boolean} true όταν η σύνδεση είναι ενεργή
 */
export function connectDatabase() {
  isConnected = true;
  return isConnected;
}
```

### 🔹 `routes/` — 1 σχόλιο ανά route

```jsx
/**
 * petRoutes.js -- Routes για τα pets.
 */
const router = express.Router();
router.get('/pets', listPets);      // λίστα published pets
router.get('/pets/:id', getPet);    // ένα pet βάσει id
export default router;
```

### 🔹 `controllers/` — JSDoc με **HTTP method + route**

```jsx
/**
 * petController.js -- Handlers για τα pets.
 */

/**
 * GET /pets -- επιστρέφει ΜΟΝΟ τα published pets.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {import('express').Response} 200 + λίστα pets
 */
export function listPets(req, res) {
  const published = pets.filter((p) => p.status === 'published');
  return ok(res, 'Pets retrieved', published);
}

/**
 * GET /pets/:id -- επιστρέφει ένα pet ή 404.
 * @param {import('express').Request} req - χρησιμοποιεί req.params.id
 * @param {import('express').Response} res
 * @returns {import('express').Response} 200 + pet ή 404
 */
export function getPet(req, res) {
  const result = pets.find((p) => p.id === Number(req.params.id));
  if (!result) {                 // ⚠️ find() -> undefined, ΌΧΙ === null
    return notFound(res, 'Pet not found');
  }
  return ok(res, 'Pet retrieved', result);
}
```

### 🔹 `middleware/` — JSDoc «τι ελέγχει + πότε next()»

```jsx
/**
 * Επιτρέπει μόνο authenticated users· αλλιώς 401/403.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next - καλείται ΜΟΝΟ αν το token είναι έγκυρο
 * @returns {void}
 */
export function authenticateUser(req, res, next) {
  const decoded = decodeToken(req.headers.authorization);
  if (decoded === null) {        // decodeToken γυρίζει ρητά null -> === σωστό
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  if (decoded.type !== 'user') return res.status(403).json({ success: false, message: 'Forbidden' });
  req.user = decoded;
  return next();
}
```

```jsx
/**
 * errorHandler.js -- Κεντρικός χειρισμός σφαλμάτων.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} _next - αχρησιμοποίητο αλλά ΑΠΑΡΑΙΤΗΤΟ (arity 4)
 */
export function errorHandler(err, req, res, _next) {
  res.status(err.status || 500).json({ success: false, message: err.message, data: null });
}
```

### 🔹 `utils/` — helper με `@param`/`@returns`

```jsx
/**
 * Επιτυχία 200 — τυλίγει σε { success, message, data }.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {*} data - το payload (μπαίνει στο body.data)
 * @returns {import('express').Response}
 */
export function ok(res, message, data) {
  return res.status(200).json({ success: true, message, data });
}
```

```jsx
/**
 * Αφαιρεί το password από user object (ασφαλής έξοδος).
 * @param {Object} user
 * @returns {Object} ο user χωρίς το password
 */
export function sanitizeUser(user) {
  const { password, ...sanitized } = user; // rest-destructure: «πετάμε» το password
  return sanitized;
}
```

### 🔹 React component / page / api

```jsx
/**
 * PetCard.jsx -- Κάρτα ενός pet· link στη σελίδα λεπτομερειών.
 * @param {{ pet: { id:number, name:string, species:string } }} props
 * @returns {JSX.Element}
 */
export default function PetCard({ pet }) {
  return (
    <Link to={`/pets/${pet.id}`} className="pet-card">
      <h3>{pet.name}</h3>
    </Link>
  );
}
```

```jsx
/**
 * client.js -- Κεντρικό axios instance· κρατά το baseURL του backend.
 */
const client = axios.create({ baseURL: 'http://localhost:3001/api/v1' });
export default client;
```

<aside>
📌

**Memory hook — τι σχόλιο πάει πού:** entry/config → *file-header* · routes → *1 σχόλιο/route* · controllers → *JSDoc method+route* · services → *«τι επιστρέφει»* · middleware → *«πότε next()»* · utils/validators → *@param/@returns* · React → *«τι render-άρει + props»*.

</aside>

---

## 🔥 Μέρος Γ — Δύσκολες ερωτήσεις (bonus)

**Γ1.** Γιατί το `result == null` στο `getPet` ΔΕΝ γίνεται `=== null`, ενώ στο `auth.js` το `decoded == null` γίνεται;

**Γ2.** Πόσο είναι το Cyclomatic Complexity της `authenticateUser`;

**Γ3.** (AVA) Test ότι το `GET /pets` ΔΕΝ περιέχει το draft pet (id=6).

**Γ4.** (AVA) Test για `POST /users/login` με κενό body → 400.

**Γ5.** (Trap) Το `GET /pets/6` (draft) τι γυρίζει τώρα; Είναι bug; Πώς το διορθώνεις;

**Γ6.** (Theory) SAST ή DAST για hard-coded secret; Γιατί;

**Γ7.** (CI/CD) Σε PR από feature branch (όχι main), με `cd` που έχει `needs: ci` + `if: ...main`, τι τρέχει;

**Γ8.** (k6) Thresholds: 99% < 800ms ΚΑΙ error rate < 0.5% που να ΣΠΑΕΙ το test.

- ✅ Λύσεις Μέρους Γ
    
    **Γ1.** Το `find()` γυρίζει `undefined` (ΌΧΙ null). Το `== null` πιάνει και τα δύο → `=== null` θα έσπαγε το 404. Σωστό: `if (!result)`. Στο auth.js η decodeToken γυρίζει ρητά null → `=== null` σωστό. **Η σημασιολογία κρίνει.**
    
    **Γ2.** 2 `if` → complexity = 2 + 1 = **3**.
    
    **Γ3.**
    
    ```jsx
    test('GET /pets excludes drafts', async (t) => {
      const res = await t.context.fetch('api/v1/pets');
      const body = await res.json();
      t.is(body.data.length, 5);
      t.false(body.data.some((p) => p.id === 6));
    });
    ```
    
    **Γ4.**
    
    ```jsx
    test('POST login χωρίς body -> 400', async (t) => {
      const res = await t.context.fetch('api/v1/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      t.is(res.status, 400);
    });
    ```
    
    **Γ5.** Γυρίζει **200 + το draft pet** — bug, γιατί το getPet ΔΕΝ φιλτράρει status. Fix: `if (!result || result.status !== 'published') return notFound(...)`.
    
    **Γ6.** **SAST** (διαβάζει πηγαίο κώδικα — το secret είναι γραμμένο μέσα). Το DAST (runtime/black-box) δεν βλέπει κώδικα. CWE-798.
    
    **Γ7.** Κανένα cd — το `ci` τρέχει, το `cd` όχι (`if` false). Το `needs: ci` απλώς επιβάλλει σειρά.
    
    **Γ8.**
    
    ```jsx
    thresholds: {
      http_req_duration: ['p(99)<800'],
      http_req_failed: [{ threshold: 'rate<0.005', abortOnFail: true }],
    }
    ```
    

---

## 🛡️ Μέρος Δ — Άσκηση από άλλα Labs (SAST / k6 / CI-CD)

### 🔎 Δ.1 SAST (Lab 8) — Βρες CWE + διόρθωσε

```jsx
// (a)
const q = "SELECT * FROM pets WHERE name LIKE '%" + req.query.name + "%'"; db.query(q);
// (b)
el.innerHTML = req.query.bio;
// (c)
const data = fs.readFileSync(req.query.file);
// (d)
const out = eval(req.body.expr);
// (e)
const hash = crypto.createHash('md5').update(password).digest('hex');
```

### ⚡ Δ.2 k6 (Lab 11)

Γράψε `options`: ramp 0→1000 VUs σε 5m, hold 1000 για 20m, ramp→0 σε 5m · thresholds p(95)<400 & error rate<1% (να ΣΠΑΕΙ) + check status 200.

### 🔄 Δ.3 CI/CD (Lab 5)

Γράψε (α) το step που τρέχει τα tests και (β) κάνε το `cd` να εξαρτάται από το `ci` και να τρέχει μόνο στο main.

- ✅ Λύσεις Μέρους Δ
    
    **Δ.1 SAST:**
    
    - (a) **SQL Injection (CWE-89)** → parameterized: `db.query('... LIKE :q', { replacements: { q:` %${[req.query.name](http://req.query.name)}% `} })`
    - (b) **XSS (CWE-79)** → `el.textContent = req.query.bio` (όχι innerHTML)
    - (c) **Path Traversal (CWE-73)** → `path.basename()` + allowlist + `path.join(SAFE_DIR, safe)`
    - (d) **Code Injection / eval (CWE-95)** → βγάλε το eval → `JSON.parse(...)`
    - (e) **Cryptographic Issue (CWE-327)** → `await bcrypt.hash(password, 10)`
    
    **Δ.2 k6:**
    
    ```jsx
    export const options = {
      stages: [
        { duration: '5m', target: 1000 },
        { duration: '20m', target: 1000 },
        { duration: '5m', target: 0 },
      ],
      thresholds: {
        http_req_duration: ['p(95)<400'],
        http_req_failed: [{ threshold: 'rate<0.01', abortOnFail: true }],
      },
    };
    export default () => {
      const res = http.get('http://localhost:3000');
      check(res, { 'status 200': (r) => r.status === 200 });
    };
    ```
    
    **Δ.3 CI/CD:**
    
    ```yaml
    jobs:
      ci:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with: { node-version: '22' }
          - run: npm install
          - run: npm test          # (a)
      cd:
        needs: ci                  # (β) εξαρτάται από το ci
        if: github.ref == 'refs/heads/main'   # μόνο main
        runs-on: ubuntu-latest
        steps:
          - run: echo deploy
    ```