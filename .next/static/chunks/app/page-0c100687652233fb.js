(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[931],{4159:function(e,a,t){Promise.resolve().then(t.bind(t,7342))},794:function(e,a,t){"use strict";t.d(a,{F:function(){return s},f:function(){return r}});var n=t(7437),o=t(2265);let l=(0,o.createContext)(void 0),r=e=>{let{children:a}=e,[t,r]=(0,o.useState)("dark");return(0,o.useEffect)(()=>{document.documentElement.setAttribute("data-theme",t)},[t]),(0,n.jsx)(l.Provider,{value:{theme:t,toggleTheme:()=>{r(e=>"light"===e?"dark":"light")}},children:a})},s=()=>{let e=(0,o.useContext)(l);if(!e)throw Error("useTheme must be used within a ThemeProvider");return e}},7342:function(e,a,t){"use strict";t.r(a),t.d(a,{default:function(){return j}});var n=t(7437),o=t(8059),l=t.n(o),r=t(2265),s=t(998),i=t(794),c=t(6920),d=t(5079),h=t(7346),u=t(5211);function m(){let e="#";for(let a=0;a<6;a++)e+="0123456789ABCDEF"[Math.floor(16*Math.random())];return e}function p(e){let{data:a}=e,[t,o]=(0,r.useState)([]),[l,s]=(0,r.useState)([]),[c,d]=(0,r.useState)(!1),[u,p]=(0,r.useState)(!1),[f,g]=(0,r.useState)(null),[b,x]=(0,r.useState)("all"),[y,j]=(0,r.useState)(null),[k,w]=(0,r.useState)({}),{theme:v}=(0,i.F)();(0,r.useEffect)(()=>{let e={};a.forEach(a=>{e[a.channel_name]||(e[a.channel_name]=m())}),w(e)},[a]),console.log("Datos en Charts:",a);let C=a.reduce((e,a)=>{let t=a.fecha.split("T")[0];return e[t]||(e[t]=[]),e[t].push(a),e},{}),N=e=>{o(a=>a.includes(e)?a.filter(a=>a!==e):[...a,e])},S=(0,r.useCallback)(()=>{s(t.flatMap(e=>C[e])),p(!0),d(!1)},[t,C]),z=e=>{g(e)},A=function(e,a){let t=arguments.length>2&&void 0!==arguments[2]&&arguments[2],o=Array.from(new Set(a.map(e=>e.channel_name))),l="channel"===b&&y?a.filter(e=>e.channel_name===y):a,r=o.map(e=>{let a=l.filter(a=>a.channel_name===e).sort((e,a)=>new Date("".concat(e.fecha.split("T")[0],"T").concat(e.hora)).getTime()-new Date("".concat(a.fecha.split("T")[0],"T").concat(a.hora)).getTime()).map(e=>({x:new Date("".concat(e.fecha.split("T")[0],"T").concat(e.hora)),y:e.youtube})),t=k[e]||m();return{label:e,data:a,borderColor:t,backgroundColor:"rgba(0, 0, 0, 0)",pointRadius:0,pointHoverRadius:6,borderWidth:2,tension:.1}}),s=a.filter(e=>e.youtube>0).map(e=>new Date("".concat(e.fecha.split("T")[0],"T").concat(e.hora)).getTime());return(0,n.jsxs)("div",{className:"chart-container ".concat(t?"modal-chart":"card-chart"," ").concat(v),children:[(0,n.jsx)(h.x1,{data:{datasets:r},options:{interaction:{mode:"nearest",axis:"x",intersect:!1},scales:{x:{type:"time",time:{unit:"minute",stepSize:1,displayFormats:{minute:"HH:mm"},min:Math.min(...s),max:Math.max(...s)},ticks:{source:"auto",autoSkip:!1,callback:function(e){return new Date(e).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})},color:"dark"===v?"#ffffff":"#000000",font:{family:"Arial, sans-serif",size:12}},grid:{color:"dark"===v?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)"}},y:{beginAtZero:!0,ticks:{color:"dark"===v?"#ffffff":"#000000",font:{family:"Arial, sans-serif",size:12}},grid:{color:"dark"===v?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)"}}},plugins:{title:{display:!0,text:"Viewers - ".concat(e),font:{size:18,family:"Arial, sans-serif"},color:"dark"===v?"#ffffff":"#000000"},legend:{display:"channel"!==b,labels:{color:"dark"===v?"#ffffff":"#000000",font:{family:"Arial, sans-serif",size:12}},onClick:(e,a,t)=>{let n=a.datasetIndex,o=t.chart,l=o.getDatasetMeta(n);l.hidden=null===l.hidden?!o.data.datasets[n].hidden:null;let r=o.data.datasets.filter((e,a)=>!o.getDatasetMeta(a).hidden).flatMap(e=>e.data).filter(e=>e.y>0),s=Math.max(...r.map(e=>e.y))+10,i=Math.min(...r.map(e=>e.x)),c=Math.max(...r.map(e=>e.x));o.options.scales.y.suggestedMax=s,o.options.scales.x.min=i,o.options.scales.x.max=c,o.update()}},tooltip:{backgroundColor:"dark"===v?"rgba(0, 0, 0, 1)":"rgba(0, 0, 0, 0.8)",titleFont:{family:"Arial, sans-serif",size:14,color:"#ffffff",borderWidth:1,boxPadding:4},bodyFont:{family:"Arial, sans-serif",size:12,color:"#ffffff"},callbacks:{title:e=>{let t=a.find(a=>new Date("".concat(a.fecha.split("T")[0],"T").concat(a.hora)).getTime()===new Date(e[0].parsed.x).getTime()),n=new Date(t?"".concat(t.fecha.split("T")[0],"T").concat(t.hora):"");return"".concat(n.toLocaleDateString("en-US",{day:"numeric",month:"short",year:"numeric"}),", ").concat(n.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:!1}))},label:e=>{let t=r[e.datasetIndex],n=a.find(a=>a.channel_name===t.label&&new Date("".concat(a.fecha.split("T")[0],"T").concat(a.hora)).getTime()===new Date(e.parsed.x).getTime());return n?"".concat(t.label,": ").concat(n.youtube," Viewers"):""},labelColor:e=>{let a=r[e.datasetIndex];return{borderColor:a.borderColor,backgroundColor:a.borderColor}}}}},maintainAspectRatio:!1}}),!t&&!u&&(0,n.jsx)("span",{onClick:()=>z(e),className:"expand-text ".concat(v),children:"Ampliar Gr\xe1fico"})]},e)},T=l.length>0&&A("Combined",l);return(0,n.jsxs)("div",{className:"charts-container ".concat(v),children:[(0,n.jsxs)("div",{className:"view-mode-toggle",children:[(0,n.jsx)("button",{onClick:()=>{if(x(e=>"all"===e?"channel":"all"),"all"===b){var e;j((null===(e=a[0])||void 0===e?void 0:e.channel_name)||null)}else j(null)},className:"button-toggle ".concat(v),children:"all"===b?"Ver por canal":"Ver todos los canales"}),"channel"===b&&(0,n.jsx)("select",{value:y||"",onChange:e=>{j(e.target.value)},className:"channel-select ".concat(v),children:Array.from(new Set(a.map(e=>e.channel_name))).map(e=>(0,n.jsx)("option",{value:e,children:e},e))})]}),!u&&(0,n.jsx)("button",{onClick:()=>d(!c),className:"button-combine-toggle ".concat(v),children:c?"Cancelar":"Combinar Gr\xe1ficos"}),c&&(0,n.jsxs)("div",{className:"selection-list ".concat(c?"show":""," ").concat(v),children:[Object.keys(C).map(e=>(0,n.jsxs)("div",{className:"selection-list-item",children:[(0,n.jsx)("input",{type:"checkbox",checked:t.includes(e),onChange:()=>N(e),className:"selection-list-checkbox"}),(0,n.jsx)("label",{className:"selection-list-label ".concat(v),children:e})]},e)),(0,n.jsx)("button",{onClick:S,disabled:t.length<2,className:"button-combine ".concat(v),children:"Combinar Seleccionados"})]}),u&&(0,n.jsxs)("div",{children:[(0,n.jsx)("button",{onClick:()=>{s([]),o([]),p(!1)},className:"button-revert ".concat(v),children:"Revertir Combinaci\xf3n"}),T]}),!u&&(0,n.jsx)("div",{className:"charts-grid-container",children:(0,n.jsx)("div",{className:"charts-grid",children:Object.keys(C).map(e=>A(e,C[e]))})}),f&&(0,n.jsx)("div",{className:"modal-overlay",children:(0,n.jsxs)("div",{className:"modal-content-chart ".concat(v),children:[(0,n.jsx)("button",{className:"close-button ".concat(v),onClick:()=>{g(null)},children:"\xd7"}),A(f,C[f],!0)]})})]})}function f(e){let{data:a}=e,{theme:t}=(0,i.F)();console.log("Datos en BarChart:",a);let o=a.reduce((e,a)=>((!e[a.channel_name]||e[a.channel_name].likes<a.likes)&&(e[a.channel_name]=a),e),{}),l={labels:Object.keys(o),datasets:[{label:"Likes",data:Object.values(o).map(e=>e.likes),backgroundColor:Object.keys(o).map(()=>(function(){let e="#";for(let a=0;a<6;a++)e+="0123456789ABCDEF"[Math.floor(16*Math.random())];return e})()),borderWidth:0,borderRadius:10}]};return(0,n.jsxs)("div",{className:"card-small ".concat(t),children:[(0,n.jsx)("h2",{style:{color:"dark"===t?"#ffffff":"#000000",textAlign:"center"},children:"Pico de Likes por Canal"}),(0,n.jsx)(h.$Q,{data:l,options:{interaction:{mode:"index",intersect:!1},plugins:{title:{display:!0,font:{size:18},color:"#ffffff"},legend:{display:!1},tooltip:{callbacks:{title:e=>{let a=e[0].dataIndex,t=Object.values(o)[a];return"Canal: ".concat(t.channel_name)},label:e=>{let a=e.dataIndex,t=Object.values(o)[a];return"Likes: ".concat(t.likes,", Programa: ").concat(t.title)}}}},maintainAspectRatio:!1,scales:{y:{beginAtZero:!0,grid:{color:"dark"===t?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)"},ticks:{color:"dark"===t?"#ffffff":"#000000"}},x:{grid:{color:"dark"===t?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)"},ticks:{color:"dark"===t?"#ffffff":"#000000"}}}}})]})}function g(e){let{data:a}=e,[t,o]=(0,r.useState)(null),{theme:l}=(0,i.F)(),s=Object.values(a.reduce((e,a)=>((!e[a.channel_name]||e[a.channel_name].youtube<a.youtube)&&(e[a.channel_name]=a),e),{})).sort((e,a)=>a.youtube-e.youtube),c=e=>{e.length>0&&o(s[e[0].index])},d=["rgba(75, 192, 192, 1)","rgba(255, 99, 132, 1)","rgba(54, 162, 235, 1)","rgba(255, 206, 86, 1)","rgba(153, 102, 255, 1)","rgba(255, 159, 64, 1)","rgba(199, 199, 199, 1)"],u={labels:s.map(e=>e.channel_name),datasets:[{label:"Pico de Viewers",data:s.map(e=>e.youtube),backgroundColor:d,borderColor:d,borderWidth:0,borderRadius:6}]};return(0,n.jsxs)("div",{className:"card-summary ".concat(l),children:[(0,n.jsx)("h3",{children:"Pico de Viewers"}),(0,n.jsx)("div",{className:"chart-container-sumary ".concat(l),style:{marginTop:"20px"},children:(0,n.jsx)(h.$Q,{data:u,options:{responsive:!0,maintainAspectRatio:!1,onClick:(e,a)=>c(a),scales:{y:{beginAtZero:!0,grid:{color:"dark"===l?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)"},ticks:{color:"dark"===l?"#ffffff":"#000000"}},x:{grid:{color:"dark"===l?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)"},ticks:{color:"dark"===l?"#ffffff":"#000000"}}}}})}),t&&(0,n.jsx)("div",{className:"modal-summary",children:(0,n.jsxs)("div",{className:"modal-content-summary",children:[(0,n.jsx)("span",{className:"close",onClick:()=>{o(null)},children:"\xd7"}),(0,n.jsx)("h2",{children:"Detalles del Pico"}),(0,n.jsxs)("p",{children:[(0,n.jsx)("strong",{children:"Canal:"})," ",t.channel_name]}),(0,n.jsxs)("p",{children:[(0,n.jsx)("strong",{children:"T\xedtulo:"})," ",t.title]}),(0,n.jsxs)("p",{children:[(0,n.jsx)("strong",{children:"Fecha:"})," ",(e=>{let a=new Date(e),t=String(a.getUTCDate()).padStart(2,"0"),n=String(a.getUTCMonth()+1).padStart(2,"0"),o=a.getUTCFullYear();return"".concat(t,"/").concat(n,"/").concat(o)})(t.fecha)]}),(0,n.jsxs)("p",{children:[(0,n.jsx)("strong",{children:"Hora:"})," ",t.hora]}),(0,n.jsxs)("p",{children:[(0,n.jsx)("strong",{children:"Pico mas alto:"})," ",t.youtube]})]})})]})}t(531),t(9733),u.kL.register(u.uw,u.f$,u.od,u.jn,u.Dx,u.u,u.De,u.FB),t(5313),u.kL.register(u.uw,u.f$,u.ZL,u.Dx,u.u,u.De),t(1180);var b=e=>{let{isOpen:a,onClose:t}=e,[o,l]=(0,r.useState)(""),[i,h]=(0,r.useState)(""),[u,m]=(0,r.useState)(!1),[p,f]=(0,r.useState)(""),g=async e=>{e.preventDefault();let a=await (0,s.signIn)("credentials",{redirect:!1,username:o,password:i});(null==a?void 0:a.error)?f(a.error):window.location.href="/admin"};return a?(0,n.jsx)("div",{className:"fixed inset-0 flex items-center justify-center bg-black bg-opacity-50",children:(0,n.jsxs)("div",{className:"bg-gray-800 p-6 rounded-lg shadow-lg w-80 relative",children:[(0,n.jsx)("img",{src:"/logo-expansion-verde.png",alt:"Logo",className:"absolute top-4 right-4 w-8 h-8"}),(0,n.jsx)("h2",{className:"text-2xl font-semibold mb-6 text-center text-white",children:"Iniciar Sesi\xf3n"}),(0,n.jsxs)("form",{onSubmit:g,children:[(0,n.jsxs)("div",{className:"mb-6 relative",children:[(0,n.jsx)("input",{id:"username",type:"text",value:o,onChange:e=>l(e.target.value),required:!0,className:"peer mt-1 block w-full bg-gray-700 text-white border-b-2 border-gray-600 focus:border-indigo-500 focus:outline-none transition-all duration-500 ease-in-out placeholder-transparent",placeholder:"Nombre de Usuario"}),(0,n.jsx)("label",{htmlFor:"username",className:"absolute left-0 -top-4 text-gray-400 text-sm transition-all duration-500 ease-in-out peer-placeholder-shown:top-0 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-4 peer-focus:text-sm peer-focus:text-indigo-500",children:"Nombre de Usuario"})]}),(0,n.jsxs)("div",{className:"mb-4 relative",children:[(0,n.jsx)("input",{id:"password",type:u?"text":"password",value:i,onChange:e=>h(e.target.value),required:!0,className:"peer mt-1 block w-full bg-gray-700 text-white border-b-2 border-gray-600 focus:border-indigo-500 focus:outline-none transition-all duration-500 ease-in-out placeholder-transparent",placeholder:"Contrase\xf1a"}),(0,n.jsx)("label",{htmlFor:"password",className:"absolute left-0 -top-4 text-gray-400 text-sm transition-all duration-500 ease-in-out peer-placeholder-shown:top-0 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-4 peer-focus:text-sm peer-focus:text-indigo-500",children:"Contrase\xf1a"}),(0,n.jsx)("button",{type:"button",onClick:()=>{m(!u)},className:"absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-400",children:(0,n.jsx)(c.G,{icon:u?d.Aq:d.Mdf})})]}),p&&(0,n.jsx)("div",{className:"text-red-500 text-sm mb-4",children:p}),(0,n.jsxs)("div",{className:"flex justify-end",children:[(0,n.jsx)("button",{type:"button",onClick:t,className:"mr-2 py-2 px-4 border border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-500 ease-in-out",children:"Cancelar"}),(0,n.jsx)("button",{type:"submit",className:"py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-500 ease-in-out",children:"Iniciar sesi\xf3n"})]})]})]})}):null};t(2651),t(9051),t(5291);var x=t(6648);t(269);let y=()=>(0,n.jsxs)("div",{className:"jsx-21483a5a502ed8f3 preloader",children:[(0,n.jsx)("div",{className:"jsx-21483a5a502ed8f3 preloader-chart",children:(0,n.jsx)("div",{className:"jsx-21483a5a502ed8f3 line"})}),(0,n.jsx)(l(),{id:"21483a5a502ed8f3",children:'.preloader.jsx-21483a5a502ed8f3{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;height:100%}.preloader-chart.jsx-21483a5a502ed8f3{width:100px;height:100px;position:relative}.line.jsx-21483a5a502ed8f3{width:100%;height:100%;border-left:2px solid#4CAF50;border-bottom:2px solid#4CAF50;position:absolute;top:0;left:0}.line.jsx-21483a5a502ed8f3::before{content:"";position:absolute;width:100%;height:100%;background:-webkit-linear-gradient(left,#4CAF50,#4CAF50 50%,transparent 50%);background:-moz-linear-gradient(left,#4CAF50,#4CAF50 50%,transparent 50%);background:-o-linear-gradient(left,#4CAF50,#4CAF50 50%,transparent 50%);background:linear-gradient(90deg,#4CAF50,#4CAF50 50%,transparent 50%);-webkit-background-size:200%100%;-moz-background-size:200%100%;-o-background-size:200%100%;background-size:200%100%;-webkit-animation:zigzag 2s infinite;-moz-animation:zigzag 2s infinite;-o-animation:zigzag 2s infinite;animation:zigzag 2s infinite}@-webkit-keyframes zigzag{0%{-webkit-clip-path:polygon(0%100%,0%100%,0%100%,0%100%);clip-path:polygon(0%100%,0%100%,0%100%,0%100%)}25%{-webkit-clip-path:polygon(0%100%,25%75%,50%100%,75%75%,100%100%);clip-path:polygon(0%100%,25%75%,50%100%,75%75%,100%100%)}50%{-webkit-clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%);clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}75%{-webkit-clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%);clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}100%{-webkit-clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%);clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}}@-moz-keyframes zigzag{0%{clip-path:polygon(0%100%,0%100%,0%100%,0%100%)}25%{clip-path:polygon(0%100%,25%75%,50%100%,75%75%,100%100%)}50%{clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}75%{clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}100%{clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}}@-o-keyframes zigzag{0%{clip-path:polygon(0%100%,0%100%,0%100%,0%100%)}25%{clip-path:polygon(0%100%,25%75%,50%100%,75%75%,100%100%)}50%{clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}75%{clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}100%{clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}}@keyframes zigzag{0%{-webkit-clip-path:polygon(0%100%,0%100%,0%100%,0%100%);clip-path:polygon(0%100%,0%100%,0%100%,0%100%)}25%{-webkit-clip-path:polygon(0%100%,25%75%,50%100%,75%75%,100%100%);clip-path:polygon(0%100%,25%75%,50%100%,75%75%,100%100%)}50%{-webkit-clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%);clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}75%{-webkit-clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%);clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}100%{-webkit-clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%);clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}}'})]});function j(){let{data:e,status:a}=(0,s.useSession)(),{theme:t,toggleTheme:o}=(0,i.F)(),[l,h]=(0,r.useState)(!1),[u,m]=(0,r.useState)([]),[j,k]=(0,r.useState)(!1),[w,v]=(0,r.useState)(""),[C,N]=(0,r.useState)(""),[S,z]=(0,r.useState)(!1);(0,r.useEffect)(()=>{document.documentElement.setAttribute("data-theme",t)},[t]);let A=async()=>{if(!w||!C)return;z(!0);let e=await fetch("/api/fetchData?startDate=".concat(w,"&endDate=").concat(C)),a=await e.json();console.log("Datos obtenidos:",a),m(a),z(!1)},T=()=>{z(!1)};return(0,n.jsxs)("div",{className:"flex flex-col min-h-screen ".concat("dark"===t?"bg-black text-white":"bg-gray-100 text-black"),children:[(0,n.jsxs)("header",{className:"w-full flex justify-between items-center p-4 shadow-md ".concat("dark"===t?"header-dark":"header-light"),children:[(0,n.jsxs)("div",{className:"flex items-center",children:[(0,n.jsx)(x.default,{src:"/logo-expansion-verde.png",alt:"Logo Verde",width:50,height:50,className:"mr-4"}),(0,n.jsx)("h1",{className:"text-2xl font-bold",children:"YouTube Viewers Analysis"})]}),(0,n.jsxs)("div",{className:"flex items-center",children:[(0,n.jsx)("button",{onClick:o,className:"btn btn-secondary mr-4 transition-transform transform hover:scale-110",children:"dark"===t?(0,n.jsx)(c.G,{icon:d.enB}):(0,n.jsx)(c.G,{icon:d.DBF})}),"loading"===a?(0,n.jsx)("p",{children:"Cargando..."}):e?(0,n.jsxs)("button",{onClick:()=>(0,s.signOut)(),className:"btn btn-secondary p-2 rounded-lg bg-red-500 text-white hover:bg-red-700 transition-transform transform hover:scale-110",children:[(0,n.jsx)(c.G,{icon:d.jLD,className:"mr-2"}),"Cerrar sesi\xf3n"]}):(0,n.jsxs)("button",{onClick:()=>{h(!0)},className:"btn btn-primary p-2 rounded-lg bg-green-500 text-white hover:bg-green-700 transition-transform transform hover:scale-110",children:[(0,n.jsx)(c.G,{icon:d.$Wj,className:"mr-2"}),"Iniciar sesi\xf3n"]})]})]}),(0,n.jsxs)("main",{className:"flex-grow flex",children:[(0,n.jsxs)("aside",{className:"w-64 p-4 shadow-md ".concat("dark"===t?"dark":"light"),children:[(0,n.jsxs)("button",{onClick:()=>{k(!0)},className:"btn btn-primary w-full mb-4 p-2 rounded-lg text-white hover:bg-gray-900 transition-transform transform hover:scale-110",style:{backgroundColor:"#4CAF50"},children:[(0,n.jsx)(c.G,{icon:d.Stf,className:"mr-2"}),"Consultar M\xe9tricas"]}),j&&(0,n.jsxs)("div",{className:"flex flex-col space-y-4",children:[(0,n.jsx)("input",{type:"date",value:w,onChange:e=>v(e.target.value),className:"p-2 border rounded-lg ".concat("dark"===t?"bg-gray-700 text-white":"bg-white text-black")}),(0,n.jsx)("input",{type:"date",value:C,onChange:e=>N(e.target.value),className:"p-2 border rounded-lg ".concat("dark"===t?"bg-gray-700 text-white":"bg-white text-black")}),(0,n.jsx)("button",{onClick:A,className:"btn btn-secondary w-full p-2 rounded-lg text-white hover:bg-gray-900 transition-transform transform hover:scale-110",style:{backgroundColor:"#4CAF50"},children:"Consultar"})]})]}),(0,n.jsxs)("section",{className:"flex-grow p-8",children:[(0,n.jsx)("h2",{className:"text-3xl font-bold mt-8 mb-4",children:"Consulta las m\xe9tricas de los canales"}),S?(0,n.jsx)(y,{}):u.length>0&&(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)("div",{children:(0,n.jsx)("div",{children:(0,n.jsx)(p,{data:u,onRendered:T})})}),(0,n.jsxs)("div",{className:"flex flex-col md:flex-row justify-between w-full mt-8 space-y-4 md:space-y-0 md:space-x-4 px-4 md:px-16",children:[(0,n.jsx)("div",{className:"chart-container-small-bar w-full md:w-1/2",children:(0,n.jsx)(f,{data:u,onRendered:T})}),(0,n.jsx)("div",{className:"chart-container-small-sumary w-full md:w-1/2",children:(0,n.jsx)(g,{data:u,onRendered:T})})]})]}),(0,n.jsx)(b,{isOpen:l,onClose:()=>{h(!1)}})]})]}),(0,n.jsx)("footer",{className:"w-full p-4 text-center ".concat("dark"===t?"footer-dark":"footer-light"),children:(0,n.jsx)("p",{children:"\xa9 2024 YouTube Viewers Analysis. Todos los derechos reservados."})})]})}},5313:function(){},9733:function(){},1180:function(){},269:function(){}},function(e){e.O(0,[644,619,983,676,674,998,648,14,887,971,23,744],function(){return e(e.s=4159)}),_N_E=e.O()}]);