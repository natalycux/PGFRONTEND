// Debe coincidir con JwtSettings:InactivityTimeoutMinutes en appsettings.json del backend
const INACTIVITY_MINUTES = 2;

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

class SessionManager {
  constructor() {
    this.timer = null;
    this.onExpire = this.onExpire.bind(this);
    this.resetActivity = this.resetActivity.bind(this);
  }

  start() {
    this.stop(); // evita timers duplicados si start() se llama dos veces
    this.resetActivity();
    ACTIVITY_EVENTS.forEach((evento) => {
      window.addEventListener(evento, this.resetActivity, { passive: true });
    });
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    ACTIVITY_EVENTS.forEach((evento) => {
      window.removeEventListener(evento, this.resetActivity);
    });
  }

  resetActivity() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.onExpire, INACTIVITY_MINUTES * 60 * 1000);
  }

  onExpire() {
    console.warn(`Sesión cerrada por ${INACTIVITY_MINUTES} minutos de inactividad`);
    this.forceLogout();
  }

  // Reutiliza el mismo evento que el interceptor de axios dispara ante un 401,
  // para que AuthContext limpie el estado y React Router navegue a /login sin recargar la página.
  forceLogout() {
    this.stop();
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }
}

export const sessionManager = new SessionManager();
