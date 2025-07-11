(()=>{var e={};e.id=409,e.ids=[409],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},8875:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>o.a,__next_app__:()=>m,originalPathname:()=>d,pages:()=>u,routeModule:()=>p,tree:()=>l}),s(7352),s(35866),s(16138);var a=s(23191),r=s(88716),i=s(37922),o=s.n(i),n=s(95231),c={};for(let e in n)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(c[e]=()=>n[e]);s.d(t,c);let l=["",{children:["/_not-found",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.t.bind(s,35866,23)),"next/dist/client/components/not-found-error"]}]},{}]},{layout:[()=>Promise.resolve().then(s.bind(s,16138)),"C:\\Users\\German\\Desktop\\Dashboard Viewers- LaCasa\\youtube-viewers-lacasa\\src\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,35866,23)),"next/dist/client/components/not-found-error"]}],u=[],d="/_not-found/page",m={require:s,loadChunk:()=>Promise.resolve()},p=new a.AppPageRouteModule({definition:{kind:r.x.APP_PAGE,page:"/_not-found/page",pathname:"/_not-found",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:l}})},98532:(e,t,s)=>{Promise.resolve().then(s.t.bind(s,12994,23)),Promise.resolve().then(s.t.bind(s,96114,23)),Promise.resolve().then(s.t.bind(s,9727,23)),Promise.resolve().then(s.t.bind(s,79671,23)),Promise.resolve().then(s.t.bind(s,41868,23)),Promise.resolve().then(s.t.bind(s,84759,23))},79806:(e,t,s)=>{Promise.resolve().then(s.bind(s,95477))},38267:(e,t,s)=>{"use strict";s.d(t,{F:()=>n,f:()=>o});var a=s(10326),r=s(17577);let i=(0,r.createContext)(void 0),o=({children:e})=>{let[t,s]=(0,r.useState)("dark"),[o,n]=(0,r.useState)(!1);return(0,r.useEffect)(()=>{s(localStorage.getItem("theme")||"dark"),n(!0)},[]),(0,r.useEffect)(()=>{o&&(document.documentElement.setAttribute("data-theme",t),document.documentElement.className=t)},[t,o]),a.jsx(i.Provider,{value:{theme:t,toggleTheme:()=>{s(e=>{let t="light"===e?"dark":"light";return localStorage.setItem("theme",t),t})}},children:o?e:a.jsx("div",{className:"min-h-screen bg-gray-900 flex items-center justify-center",children:a.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"})})})},n=()=>{let e=(0,r.useContext)(i);if(!e)throw Error("useTheme must be used within a ThemeProvider");return e}},95477:(e,t,s)=>{"use strict";s.d(t,{default:()=>l});var a=s(10326),r=s(77109),i=s(38267),o=s(17577),n=s.n(o);s(23409);let c=()=>{let{theme:e}=(0,i.F)(),[t,s]=(0,o.useState)(!1),[r,c]=(0,o.useState)([{id:"1",type:"ai",content:"\xa1Hola! \uD83D\uDC4B Soy tu asistente IA para el Dashboard de M\xe9tricas. \xbfEn qu\xe9 puedo ayudarte?",timestamp:new Date}]),[l,u]=(0,o.useState)(""),[d,m]=(0,o.useState)(!1),p=(0,o.useRef)(null),x=(0,o.useRef)(null),f=()=>{p.current?.scrollIntoView({behavior:"smooth"})};(0,o.useEffect)(()=>{f()},[r]),(0,o.useEffect)(()=>{t&&x.current&&x.current.focus()},[t]);let h=async()=>{if(!l.trim()||d)return;let e={id:Date.now().toString(),type:"user",content:l.trim(),timestamp:new Date};c(t=>[...t,e]),u(""),m(!0);try{let t=await v(e.content),s={id:(Date.now()+1).toString(),type:"ai",content:t,timestamp:new Date};c(e=>[...e,s])}catch(t){console.error("Error al obtener respuesta de IA:",t);let e={id:(Date.now()+1).toString(),type:"ai",content:"❌ Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.",timestamp:new Date};c(t=>[...t,e])}finally{m(!1)}},v=async e=>{let t=`
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
    `;try{let s=await fetch("/api/ai-chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"system",content:t},{role:"user",content:e}]})});if(!s.ok)throw Error("Error en la API");return(await s.json()).response}catch(t){return b(e)}},b=e=>{let t=e.toLowerCase();return t.includes("viewer")&&(t.includes("cuanto")||t.includes("cantidad"))?`📊 Para calcular viewers necesarios, considera:

• **Meta de viewers**: Define tu objetivo (ej: 1000 viewers)
• **Duraci\xf3n**: Elige el servicio adecuado (1h-8h)
• **Presupuesto**: Los servicios m\xe1s largos suelen ser m\xe1s eficientes
• **Timing**: Programa las operaciones en horas pico

💡 **Ejemplo**: Para 1000 viewers en 2 horas, usa Service ID 336 con la cantidad deseada dividida entre los bloques que planees usar.

\xbfTienes una meta espec\xedfica en mente?`:t.includes("costo")||t.includes("precio")?`💰 **Optimizaci\xf3n de Costos**:

• **Servicios largos**: Mejor costo por viewer (6h-8h)
• **Servicios cortos**: M\xe1s flexibilidad pero mayor costo
• **M\xfaltiples bloques**: Divide la carga para mejor gesti\xf3n
• **Horarios**: Algunos momentos pueden tener mejor rendimiento

📈 Revisa el dashboard para ver tu "Costo por Viewer" actual y optimiza desde ah\xed.

\xbfQuieres que te ayude a calcular el costo para una campa\xf1a espec\xedfica?`:t.includes("bloque")||t.includes("configurar")?`⚙️ **Configuraci\xf3n de Bloques**:

1. **URL del video**: Aseg\xfarate que sea p\xfablica
2. **Cantidad de viewers**: Divide entre bloques para mejor control
3. **Duraci\xf3n del servicio**: Elige seg\xfan tu estrategia
4. **Timing**: Programa cuando tu audiencia est\xe9 m\xe1s activa

💡 **Tip**: Usa m\xfaltiples bloques para distribuir la carga y tener mejor control sobre el proceso.

\xbfNecesitas ayuda con alguna configuraci\xf3n espec\xedfica?`:t.includes("estrategia")||t.includes("crecer")?`🚀 **Estrategias de Crecimiento**:

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

\xbfQu\xe9 te gustar\xeda saber?`};return(0,a.jsxs)(a.Fragment,{children:[!t&&a.jsx("button",{onClick:()=>s(!0),className:`ai-chat-button ${e}`,title:"Hablar con IA Assistant",children:"\uD83E\uDD16"}),t&&(0,a.jsxs)("div",{className:`ai-chat-container ${e}`,children:[(0,a.jsxs)("div",{className:"ai-chat-header",children:[(0,a.jsxs)("div",{className:"ai-chat-title",children:[a.jsx("span",{className:"ai-icon",children:"\uD83E\uDD16"}),(0,a.jsxs)("div",{children:[a.jsx("h4",{children:"IA Assistant"}),a.jsx("span",{className:"ai-status",children:"En l\xednea"})]})]}),(0,a.jsxs)("div",{className:"ai-chat-controls",children:[a.jsx("button",{onClick:()=>{c([{id:"1",type:"ai",content:"\xa1Chat reiniciado! \uD83D\uDD04 \xbfEn qu\xe9 puedo ayudarte?",timestamp:new Date}])},className:"ai-control-btn",title:"Limpiar chat",children:"\uD83D\uDDD1️"}),a.jsx("button",{onClick:()=>s(!1),className:"ai-control-btn",title:"Cerrar chat",children:"✕"})]})]}),(0,a.jsxs)("div",{className:"ai-chat-messages",children:[r.map(e=>a.jsx("div",{className:`ai-message ${e.type}`,children:(0,a.jsxs)("div",{className:"ai-message-content",children:[a.jsx("div",{className:"ai-message-text",children:e.content.split("\n").map((t,s)=>(0,a.jsxs)(n().Fragment,{children:[t,s<e.content.split("\n").length-1&&a.jsx("br",{})]},s))}),a.jsx("div",{className:"ai-message-time",children:e.timestamp.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})})]})},e.id)),d&&a.jsx("div",{className:"ai-message ai",children:a.jsx("div",{className:"ai-message-content",children:(0,a.jsxs)("div",{className:"ai-typing",children:[a.jsx("span",{}),a.jsx("span",{}),a.jsx("span",{})]})})}),a.jsx("div",{ref:p})]}),(0,a.jsxs)("div",{className:"ai-chat-input",children:[a.jsx("input",{ref:x,type:"text",value:l,onChange:e=>u(e.target.value),onKeyPress:e=>{"Enter"!==e.key||e.shiftKey||(e.preventDefault(),h())},placeholder:"Preg\xfantame sobre viewers, costos, estrategias...",disabled:d}),a.jsx("button",{onClick:h,disabled:!l.trim()||d,className:"ai-send-btn",children:d?"⏳":"\uD83D\uDCE4"})]})]})]})};function l({children:e}){return a.jsx(r.SessionProvider,{children:(0,a.jsxs)(i.f,{children:[e,a.jsx(c,{})]})})}},16399:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var s in t)Object.defineProperty(e,s,{enumerable:!0,get:t[s]})}(t,{isNotFoundError:function(){return r},notFound:function(){return a}});let s="NEXT_NOT_FOUND";function a(){let e=Error(s);throw e.digest=s,e}function r(e){return"object"==typeof e&&null!==e&&"digest"in e&&e.digest===s}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},7352:(e,t,s)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var s in t)Object.defineProperty(e,s,{enumerable:!0,get:t[s]})}(t,{PARALLEL_ROUTE_DEFAULT_PATH:function(){return r},default:function(){return i}});let a=s(16399),r="next/dist/client/components/parallel-route-default.js";function i(){(0,a.notFound)()}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},16138:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>c,metadata:()=>n});var a=s(19510),r=s(25384),i=s.n(r);s(5023);let o=(0,s(68570).createProxy)(String.raw`C:\Users\German\Desktop\Dashboard Viewers- LaCasa\youtube-viewers-lacasa\src\app\components\ClientProvider.tsx#default`),n={title:"Create Next App",description:"Generated by create next app"};function c({children:e}){return a.jsx("html",{lang:"en",children:(0,a.jsxs)("body",{className:i().className,children:[a.jsx(o,{children:e})," "]})})}},23409:()=>{},5023:()=>{}};var t=require("../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),a=t.X(0,[948,819],()=>s(8875));module.exports=a})();