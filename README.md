CREDITSMART - SISTEMA DE GESTION DE SOLICITUDES DE CREDITO


INFORMACION DEL ESTUDIANTE:

NOMBRE: Brislleily Sirley Carmona Correa
PROGRAMA: Tecnologia en desarrollo de Sotfware
CURSO: Ingenieria Web I
GRUPO: PREICA2502B020022


DESCRIPCION BREVE DEL PROYECTO:

CreditSmart es una aplicación web dinámica desarrollada en React que permite a los usuarios consultar opciones de crédito disponibles, simular préstamos y solicitar créditos en línea. La aplicación evolucionó de un diseño estático a un sistema completamente funcional con persistencia de datos en la nube mediante Firebase Firestore.

ESTRUCTURA DE LOS ARCHIVOS:

CREDITSMART-REACT-FIREBASE/
    src/
    ─ components/          Componentes reutilizables
       ─ Navbar.jsx      * Barra de navegación
       ─ Navbar.css
       ─ CreditCard.css
       ─ CreditCard.jsx  * Tarjeta de producto crediticio
       ─ AddCredit.css
       ─ AddCredit.jsx   * Formulario para agregar créditos (admin)
    ─ data/
       ─ creditsData.js   * Datos iniciales de créditos
    ─ firebase/
       ─ config.js        * Configuración de Firebase
    ─ pages/
       ─ Home.jsx           * Página de inicio
       ─ Home.css
       ─ Simulator.jsx      * Simulador de créditos
       ─ Simulator.css
       ─ RequestCredit.jsx  * Solicitud de crédito
       ─ RequestCredit.css
       ─ MyApplications.jsx * Mis solicitudes
       ─ MyApplications.css

    ─ services/
       ─ firebaseService.js * Operaciones CRUD

    ─ App.jsx 
    ─ App.css               * Componente principal
    ─ main.jsx              * Punto de entrada

INSTRUCCIONES PARA EJECUTAR EL PROYECTO

USANDO EL SERVIDOR LOCAL
Instalar una extensión de servidor local como "Live Server" en VS Code
Abrir la carpeta del proyecto en VS Code
Hacer clic derecho en index.html y seleccionar "Open with Live Server"
El proyecto se abrirá en http://localhost:5500 o puerto alguno parecido

CAPTURAS DE PANTALLA:
https://drive.google.com/drive/folders/1wSaCD3VpwbqJ8FAGyH0zt03uEcqt4wj_?usp=sharing
