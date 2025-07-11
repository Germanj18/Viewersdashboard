exports.id=703,exports.ids=[703],exports.modules={98532:(e,s,a)=>{Promise.resolve().then(a.t.bind(a,12994,23)),Promise.resolve().then(a.t.bind(a,96114,23)),Promise.resolve().then(a.t.bind(a,9727,23)),Promise.resolve().then(a.t.bind(a,79671,23)),Promise.resolve().then(a.t.bind(a,41868,23)),Promise.resolve().then(a.t.bind(a,84759,23))},79806:(e,s,a)=>{Promise.resolve().then(a.bind(a,95477))},38267:(e,s,a)=>{"use strict";a.d(s,{F:()=>n,f:()=>o});var t=a(10326),r=a(17577);let i=(0,r.createContext)(void 0),o=({children:e})=>{let[s,a]=(0,r.useState)("dark"),[o,n]=(0,r.useState)(!1);return(0,r.useEffect)(()=>{a(localStorage.getItem("theme")||"dark"),n(!0)},[]),(0,r.useEffect)(()=>{o&&(document.documentElement.setAttribute("data-theme",s),document.documentElement.className=s)},[s,o]),t.jsx(i.Provider,{value:{theme:s,toggleTheme:()=>{a(e=>{let s="light"===e?"dark":"light";return localStorage.setItem("theme",s),s})}},children:o?e:t.jsx("div",{className:"min-h-screen bg-gray-900 flex items-center justify-center",children:t.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"})})})},n=()=>{let e=(0,r.useContext)(i);if(!e)throw Error("useTheme must be used within a ThemeProvider");return e}},95477:(e,s,a)=>{"use strict";a.d(s,{default:()=>l});var t=a(10326),r=a(77109),i=a(38267),o=a(17577),n=a.n(o);a(23409);let c=()=>{let{theme:e}=(0,i.F)(),[s,a]=(0,o.useState)(!1),[r,c]=(0,o.useState)([{id:"1",type:"ai",content:"\xa1Hola! \uD83D\uDC4B Soy tu asistente IA para el Dashboard de M\xe9tricas. \xbfEn qu\xe9 puedo ayudarte?",timestamp:new Date}]),[l,d]=(0,o.useState)(""),[u,m]=(0,o.useState)(!1),p=(0,o.useRef)(null),x=(0,o.useRef)(null),h=()=>{p.current?.scrollIntoView({behavior:"smooth"})};(0,o.useEffect)(()=>{h()},[r]),(0,o.useEffect)(()=>{s&&x.current&&x.current.focus()},[s]);let v=async()=>{if(!l.trim()||u)return;let e={id:Date.now().toString(),type:"user",content:l.trim(),timestamp:new Date};c(s=>[...s,e]),d(""),m(!0);try{let s=await f(e.content),a={id:(Date.now()+1).toString(),type:"ai",content:s,timestamp:new Date};c(e=>[...e,a])}catch(s){console.error("Error al obtener respuesta de IA:",s);let e={id:(Date.now()+1).toString(),type:"ai",content:"❌ Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.",timestamp:new Date};c(s=>[...s,e])}finally{m(!1)}},f=async e=>{let s=`
    Eres un asistente especializado en el Dashboard de M\xe9tricas para YouTube viewers. 
    
    INFORMACI\xd3N DEL SISTEMA:
    - Es un dashboard para comprar viewers de YouTube
    - Los servicios disponibles son:
      * Service ID 334: 1 hora - viewers temporales
      * Service ID 335: 1.5 horas - viewers temporales  
      * Service ID 336: 2 horas - viewers temporales
      * Service ID 337: 2.5 horas - viewers temporales
      * Service ID 338: 3 horas - viewers temporales
      * Service ID 459: 4 horas - viewers temporales
      * Service ID 460: 6 horas - viewers temporales
      * Service ID 657: 8 horas - viewers temporales
    - Los costos var\xedan seg\xfan la cantidad y duraci\xf3n
    - Los usuarios pueden configurar m\xfaltiples bloques para diferentes videos
    - El sistema rastrea m\xe9tricas como tasa de \xe9xito, costos totales, etc.
    
    INSTRUCCIONES:
    - Responde en espa\xf1ol de manera amigable y profesional
    - Da consejos espec\xedficos y pr\xe1cticos
    - Si preguntan sobre c\xe1lculos, proporciona ejemplos concretos
    - Si preguntan sobre estrategias, explica pros y contras
    - Mant\xe9n las respuestas concisas pero informativas
    - Usa emojis ocasionalmente para hacer la conversaci\xf3n m\xe1s amigable
    `;try{let a=await fetch("/api/ai-chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"system",content:s},{role:"user",content:e}]})});if(!a.ok)throw Error("Error en la API");return(await a.json()).response}catch(s){return b(e)}},b=e=>{let s=e.toLowerCase();return s.includes("viewer")&&(s.includes("cuanto")||s.includes("cantidad"))?`📊 Para calcular viewers necesarios, considera:

• **Meta de viewers**: Define tu objetivo (ej: 1000 viewers)
• **Duraci\xf3n**: Elige el servicio adecuado (1h-8h)
• **Presupuesto**: Los servicios m\xe1s largos suelen ser m\xe1s eficientes
• **Timing**: Programa las operaciones en horas pico

💡 **Ejemplo**: Para 1000 viewers en 2 horas, usa Service ID 336 con la cantidad deseada dividida entre los bloques que planees usar.

\xbfTienes una meta espec\xedfica en mente?`:s.includes("costo")||s.includes("precio")?`💰 **Optimizaci\xf3n de Costos**:

• **Servicios largos**: Mejor costo por viewer (6h-8h)
• **Servicios cortos**: M\xe1s flexibilidad pero mayor costo
• **M\xfaltiples bloques**: Divide la carga para mejor gesti\xf3n
• **Horarios**: Algunos momentos pueden tener mejor rendimiento

📈 Revisa el dashboard para ver tu "Costo por Viewer" actual y optimiza desde ah\xed.

\xbfQuieres que te ayude a calcular el costo para una campa\xf1a espec\xedfica?`:s.includes("bloque")||s.includes("configurar")?`⚙️ **Configuraci\xf3n de Bloques**:

1. **URL del video**: Aseg\xfarate que sea p\xfablica
2. **Cantidad de viewers**: Divide entre bloques para mejor control
3. **Duraci\xf3n del servicio**: Elige seg\xfan tu estrategia
4. **Timing**: Programa cuando tu audiencia est\xe9 m\xe1s activa

💡 **Tip**: Usa m\xfaltiples bloques para distribuir la carga y tener mejor control sobre el proceso.

\xbfNecesitas ayuda con alguna configuraci\xf3n espec\xedfica?`:s.includes("estrategia")||s.includes("crecer")?`🚀 **Estrategias de Crecimiento**:

• **Consistencia**: Mejor varios videos con pocos viewers que uno con muchos
• **Timing**: Publica y promociona en horas pico de tu audiencia
• **Combinaci\xf3n**: Usa viewers + engagement org\xe1nico real
• **An\xe1lisis**: Revisa las m\xe9tricas del dashboard regularmente

📊 El dashboard te muestra patrones de \xe9xito que puedes replicar.

\xbfQuieres que analicemos tu estrategia actual?`:`🤔 No estoy seguro de entender exactamente lo que necesitas. \xbfPodr\xedas ser m\xe1s espec\xedfico sobre tu consulta? 

Por ejemplo, puedes preguntarme:
- "\xbfCu\xe1ntos viewers necesito?"
- "\xbfC\xf3mo optimizo costos?"
- "\xbfCu\xe1l servicio es mejor?"
- "\xbfC\xf3mo configuro un bloque?"

\xbfQu\xe9 te gustar\xeda saber?`};return(0,t.jsxs)(t.Fragment,{children:[!s&&t.jsx("button",{onClick:()=>a(!0),className:`ai-chat-button ${e}`,title:"Hablar con IA Assistant",children:"\uD83E\uDD16"}),s&&(0,t.jsxs)("div",{className:`ai-chat-container ${e}`,children:[(0,t.jsxs)("div",{className:"ai-chat-header",children:[(0,t.jsxs)("div",{className:"ai-chat-title",children:[t.jsx("span",{className:"ai-icon",children:"\uD83E\uDD16"}),(0,t.jsxs)("div",{children:[t.jsx("h4",{children:"IA Assistant"}),t.jsx("span",{className:"ai-status",children:"En l\xednea"})]})]}),(0,t.jsxs)("div",{className:"ai-chat-controls",children:[t.jsx("button",{onClick:()=>{c([{id:"1",type:"ai",content:"\xa1Chat reiniciado! \uD83D\uDD04 \xbfEn qu\xe9 puedo ayudarte?",timestamp:new Date}])},className:"ai-control-btn",title:"Limpiar chat",children:"\uD83D\uDDD1️"}),t.jsx("button",{onClick:()=>a(!1),className:"ai-control-btn",title:"Cerrar chat",children:"✕"})]})]}),(0,t.jsxs)("div",{className:"ai-chat-messages",children:[r.map(e=>t.jsx("div",{className:`ai-message ${e.type}`,children:(0,t.jsxs)("div",{className:"ai-message-content",children:[t.jsx("div",{className:"ai-message-text",children:e.content.split("\n").map((s,a)=>(0,t.jsxs)(n().Fragment,{children:[s,a<e.content.split("\n").length-1&&t.jsx("br",{})]},a))}),t.jsx("div",{className:"ai-message-time",children:e.timestamp.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})})]})},e.id)),u&&t.jsx("div",{className:"ai-message ai",children:t.jsx("div",{className:"ai-message-content",children:(0,t.jsxs)("div",{className:"ai-typing",children:[t.jsx("span",{}),t.jsx("span",{}),t.jsx("span",{})]})})}),t.jsx("div",{ref:p})]}),(0,t.jsxs)("div",{className:"ai-chat-input",children:[t.jsx("input",{ref:x,type:"text",value:l,onChange:e=>d(e.target.value),onKeyPress:e=>{"Enter"!==e.key||e.shiftKey||(e.preventDefault(),v())},placeholder:"Preg\xfantame sobre viewers, costos, estrategias...",disabled:u}),t.jsx("button",{onClick:v,disabled:!l.trim()||u,className:"ai-send-btn",children:u?"⏳":"\uD83D\uDCE4"})]})]})]})};function l({children:e}){return t.jsx(r.SessionProvider,{children:(0,t.jsxs)(i.f,{children:[e,t.jsx(c,{})]})})}},16138:(e,s,a)=>{"use strict";a.r(s),a.d(s,{default:()=>c,metadata:()=>n});var t=a(19510),r=a(25384),i=a.n(r);a(5023);let o=(0,a(68570).createProxy)(String.raw`C:\Users\German\Desktop\Dashboard Viewers- LaCasa\youtube-viewers-lacasa\src\app\components\ClientProvider.tsx#default`),n={title:"Create Next App",description:"Generated by create next app"};function c({children:e}){return t.jsx("html",{lang:"en",children:(0,t.jsxs)("body",{className:i().className,children:[t.jsx(o,{children:e})," "]})})}},73881:(e,s,a)=>{"use strict";a.r(s),a.d(s,{default:()=>r});var t=a(66621);let r=e=>[{type:"image/x-icon",sizes:"16x16",url:(0,t.fillMetadataSegment)(".",e.params,"favicon.ico")+""}]},23409:()=>{},5023:()=>{}};