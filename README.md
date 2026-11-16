# 💃 Bug Squad: arregla los bugs de Shakira

Un chat estilo Teams donde tu manager, **Shakira**, reporta bugs de una tienda online cada cierto tiempo.
Tus amigos se unen al chat, clonan este repo, arreglan los bugs y abren un PR (o hacen push).
GitHub Actions comprueba si el arreglo funciona y, si es así, Shakira felicita en el chat a quien lo resolvió y le suma los puntos.

```
┌──────────────┐  STOMP/WebSocket  ┌──────────────────────┐   POST /api/ci/results   ┌───────────────────┐
│ React (Vite) │◀─────────────────▶│ Spring Boot backend  │◀─────────────────────────│ GitHub Actions    │
│ estilo Teams │   REST /api/*     │ Shakira + puntos     │   (secreto compartido)   │ corre los retos   │
└──────────────┘                   └──────────────────────┘                          └───────────────────┘
                                                                                        ▲ push / PR
                                                                     amigos ────────────┘ (buggy-site/src)
```

| Carpeta | Qué hay |
|---|---|
| `buggy-site/` | **La tienda con bugs** (HTML + JS sin dependencias). Aquí trabajan los jugadores. |
| `buggy-site/tests/challenges/` | Un test por reto. Hoy fallan todos; arreglar el bug hace que pase. |
| `backend/` | Spring Boot 3 (Java 21): chat, Shakira, ranking y webhook de CI. H2 como base de datos. |
| `frontend/` | React 18 + TypeScript + Vite: la interfaz estilo Teams. |
| `.github/workflows/` | CI, evaluación de retos y CD. |

## 🎯 Retos

| Id | Dificultad | Puntos | Archivo |
|---|---|---|---|
| `cart-total` | Fácil | 10 | `src/cart.js` |
| `email-validation` | Fácil | 10 | `src/validation.js` |
| `price-format` | Fácil | 10 | `src/format.js` |
| `search-case` | Media | 25 | `src/search.js` |
| `pagination` | Media | 25 | `src/pagination.js` |
| `discount-code` | Media | 25 | `src/discount.js` |
| `xss-reviews` | Difícil | 50 | `src/reviews.js` |
| `sort-price` | Difícil | 50 | `src/sort.js` |
| `shipping-days` | Difícil | 50 | `src/shipping.js` |

Shakira anuncia retos al azar, con un máximo de 3 abiertos a la vez. **Los puntos son para quien lo arregla primero.**
Si alguien arregla un bug antes de que ella lo reporte, también suma, y Shakira lo comenta.

En el chat puedes escribir `@Shakira pista`, `@Shakira ranking` o `@Shakira retos`.

---

## 🌐 Abrir la partida (anfitrión)

Necesitas Docker Desktop abierto y `gh` con sesión iniciada. Desde la raíz del repo:

```bash
./scripts/jugar.sh
```

El script hace esto:

1. La primera vez crea un `.env` con un secreto aleatorio y lo guarda como secret `SHAKIRA_WEBHOOK_SECRET` en GitHub.
2. Levanta la app con Docker Compose.
3. Abre un túnel público gratis de Cloudflare (`https://algo.trycloudflare.com`).
4. Guarda esa URL en la variable `SHAKIRA_API_URL` del repo para que GitHub Actions sepa a dónde avisarle a Shakira.

Comparte la URL con tus amigos. El túnel vive mientras el script esté corriendo: con `Ctrl+C` se cierra. Si lo vuelves a abrir, la URL cambia, así que tendrás que compartir la nueva; la variable de GitHub se actualiza sola.

---

## 🕹️ Cómo jugar (amigos)

1. Abre la URL que te pasó el anfitrión y entra con tu nombre y tu **usuario de GitHub**.
2. Haz **fork** de https://github.com/GorkyAnge/shakira-bugs y clónalo:

```bash
git clone https://github.com/<tu-usuario>/shakira-bugs.git
cd shakira-bugs/buggy-site
npm run challenges        # ver qué retos pasan (no necesita npm install)
npm start                 # ver la tienda en http://localhost:5500
node --test tests/challenges/cart-total.test.js   # probar un solo reto
```

3. Cuando Shakira reporte un bug, arréglalo en `buggy-site/src/…`. No toques los tests, porque CI usa los de `main`.
4. Haz push a tu fork y abre un **Pull Request** hacia `GorkyAnge/shakira-bugs`. En un par de minutos Shakira te felicita en el chat y suma tus puntos.

> La primera vez que alguien abre un PR desde un fork, GitHub pide al dueño del repo que apruebe la ejecución (**Approve and run** en el PR).

---

## 🛠️ Correrlo localmente

**Opción A: todo con Docker**

```bash
cp .env.example .env
docker compose up --build
```

Abre http://localhost:3000. Para que Shakira hable más seguido al probar: `SHAKIRA_MIN_DELAY=10 SHAKIRA_MAX_DELAY=30 docker compose up`.

**Opción B: modo desarrollo** (Java 21 + Maven, Node 20+)

```bash
cd backend && mvn spring-boot:run
```

```bash
cd frontend && npm install && npm run dev
```

Abre http://localhost:5173. Vite redirige `/api` y `/ws` al backend en el puerto 8080.

**Simular lo que haría CI** (sin GitHub):

```bash
curl -X POST localhost:8080/api/ci/results -H 'Content-Type: application/json' -H 'X-Shakira-Secret: cambia-este-secreto' -d '{"githubUser":"ana-dev","event":"pull_request","branch":"fix/cart","sha":"abc123","passed":["cart-total"],"failed":[]}'
```

Forzar una alerta nueva de Shakira:

```bash
curl -X POST localhost:8080/api/manager/next -H 'X-Shakira-Secret: cambia-este-secreto'
```

---

## 🚀 CI/CD

| Workflow | Cuándo | Qué hace |
|---|---|---|
| `ci.yml` (**CI**) | Cada push y PR | `mvn verify` del backend, build del frontend y una tabla con los retos que pasan. |
| `challenge-report.yml` | Al terminar CI | Corre los retos **con los tests de `main`** sobre `buggy-site/src` del commit y envía el resultado al backend. |
| `cd.yml` (**CD**) | CI verde en `main` | Publica `ghcr.io/<repo>-backend` y `-frontend` en GHCR y llama a `DEPLOY_HOOK_URL` si está configurado. |

### Configuración en GitHub (una vez)

1. **Settings → Secrets and variables → Actions**
   - Secret `SHAKIRA_WEBHOOK_SECRET`: el mismo valor que en el `.env` del backend.
   - Variable `SHAKIRA_API_URL`: la URL pública del backend, por ejemplo `https://shakira.midominio.com`.
   - Secret opcional `DEPLOY_HOOK_URL`: el deploy hook de Render, Railway, Coolify, etc.
2. **Settings → Branches → main**: activa *Require a pull request* y *Require review from Code Owners*, y edita `.github/CODEOWNERS` con tu usuario.
3. **Settings → Actions → General**: elige *Require approval for first-time contributors* si vas a aceptar forks.

> **¿El backend corre en tu laptop?** GitHub necesita poder llegar a él. Usa un túnel como
> `cloudflared tunnel --url http://localhost:8080` o `ngrok http 8080` y pon esa URL en `SHAKIRA_API_URL`.

> **Deploy:** el backend guarda los datos en H2 dentro de `/app/data`. Monta ahí un volumen persistente o, si prefieres Postgres, cambia `DB_URL` y añade el driver.

### ¿Por qué no se puede hacer trampa (fácilmente)?

- `challenge-report.yml` usa `workflow_run`, así que el workflow, los tests y el runner **siempre salen de `main`**. Un PR no puede cambiarlos.
- Del commit del jugador solo se copia `buggy-site/src`.
- El job que ejecuta código del jugador **no tiene el secreto**. El job que sí lo tiene solo valida el JSON y hace el `POST`.
- El backend compara el secreto en tiempo constante, ignora ids de reto desconocidos y descarta commits repetidos (el push y el PR de un mismo commit cuentan una sola vez).
- Sigue siendo un juego entre amigos: alguien muy creativo podría escribir un `src` que "engañe" a los tests. Si lo hace, ¡que se lleve los puntos por ingenio! 😄

### Volver a jugar

Al hacer merge de los arreglos, `main` queda sin bugs. Antes de empezar, guarda la versión rota con una etiqueta:

```bash
git tag bugs-v1 && git push origin bugs-v1
```

Para reiniciar la partida:

```bash
git checkout bugs-v1 -- buggy-site/src && git commit -m "Reiniciar bugs"
```

Después borra el volumen del backend:

```bash
docker compose down -v
```

### Añadir un reto nuevo

1. Mete el bug en `buggy-site/src/<archivo>.js`.
2. Crea `buggy-site/tests/challenges/<id>.test.js`, que debe fallar con el bug.
3. Añade la entrada en `backend/src/main/resources/challenges.json` con `id`, `title`, `difficulty` (`EASY`, `MEDIUM` o `HARD`), `file`, `alert` y `hint`.
