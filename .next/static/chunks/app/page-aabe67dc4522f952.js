(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[931],{4159:function(e,t,a){Promise.resolve().then(a.bind(a,807))},794:function(e,t,a){"use strict";a.d(t,{F:function(){return o},f:function(){return s}});var n=a(7437),r=a(2265);let l=(0,r.createContext)(void 0),s=e=>{let{children:t}=e,[a,s]=(0,r.useState)("dark");return(0,r.useEffect)(()=>{document.documentElement.setAttribute("data-theme",a)},[a]),(0,n.jsx)(l.Provider,{value:{theme:a,toggleTheme:()=>{s(e=>"light"===e?"dark":"light")}},children:t})},o=()=>{let e=(0,r.useContext)(l);if(!e)throw Error("useTheme must be used within a ThemeProvider");return e}},807:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return j}});var n=a(7437),r=a(8059),l=a.n(r),s=a(2265),o=a(998),i=a(794),c=a(6920),d=a(5079),u=a(7346),h=a(5211);function g(){let e="#";for(let t=0;t<6;t++)e+="0123456789ABCDEF"[Math.floor(16*Math.random())];return e}function m(e){let{data:t}=e,[a,r]=(0,s.useState)([]),[l,o]=(0,s.useState)([]),[c,d]=(0,s.useState)(!1),[h,m]=(0,s.useState)(!1),[p,x]=(0,s.useState)(null),[b,f]=(0,s.useState)("all"),[j,y]=(0,s.useState)(null),[w,k]=(0,s.useState)({}),[v,N]=(0,s.useState)("00:00"),[C,z]=(0,s.useState)("23:59"),{theme:T}=(0,i.F)();(0,s.useEffect)(()=>{k({luzu:g(),olga:g(),gelatina:g(),blender:g(),lacasa:g(),vorterix:g(),bondi:g(),carajo:g(),azz:g()})},[t]),console.log("Datos en Charts:",t);let S=t.reduce((e,t)=>{let a=t.date.split("T")[0];return e[a]||(e[a]=[]),e[a].push(t),e},{}),D=e=>{r(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e])},A=(0,s.useCallback)(()=>{o(a.flatMap(e=>S[e])),m(!0),d(!1)},[a,S]),F=e=>{x(e)},M=e=>{let t=new Date("1970-01-01T".concat(v,":00")).getTime(),a=new Date("1970-01-01T".concat(C,":00")).getTime();return e.filter(e=>{let n=new Date("1970-01-01T".concat(e.hour,":00")).getTime();return n>=t&&n<=a})},E=function(e,t){var a;let r=arguments.length>2&&void 0!==arguments[2]&&arguments[2],l=M(t),s=["luzu","olga","gelatina","blender","lacasa","vorterix","bondi","carajo","azz"],o="channel"===b&&j?l.filter(e=>void 0!==e[j]):l,i=("channel"===b&&j?[j]:s).map(e=>{let t=o.filter(t=>void 0!==t[e]).sort((e,t)=>new Date("".concat(e.date.split("T")[0],"T").concat(e.hour)).getTime()-new Date("".concat(t.date.split("T")[0],"T").concat(t.hour)).getTime()).map(t=>({x:new Date("".concat(t.date.split("T")[0],"T").concat(t.hour)),y:t[e]})),a=w[e]||g();return{label:e,data:t,borderColor:a,backgroundColor:"rgba(0, 0, 0, 0)",pointRadius:0,pointHoverRadius:6,borderWidth:2,tension:.1}}),c=l.flatMap(e=>s.map(t=>Number(e[t])>0?new Date("".concat(e.date.split("T")[0],"T").concat(e.hour)).getTime():null)).filter(e=>null!==e),d={interaction:{mode:"nearest",axis:"x",intersect:!1},scales:{x:{type:"time",time:{unit:"minute",stepSize:1,displayFormats:{minute:"HH:mm"},min:Math.min(...c),max:Math.max(...c)},ticks:{source:"auto",autoSkip:!1,callback:function(e){return new Date(e).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})},color:"dark"===T?"#ffffff":"#000000",font:{family:"Arial, sans-serif",size:12}},grid:{color:"dark"===T?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)"}},y:{beginAtZero:!0,ticks:{color:"dark"===T?"#ffffff":"#000000",font:{family:"Arial, sans-serif",size:12}},grid:{color:"dark"===T?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)"}}},plugins:{title:{display:!0,text:"".concat((a=new Date(e+"T00:00:00").toLocaleDateString("es-ES",{weekday:"long"})).charAt(0).toUpperCase()+a.slice(1)," - ").concat(e),font:{size:18,family:"Arial, sans-serif"},color:"dark"===T?"#ffffff":"#000000"},legend:{display:"channel"!==b,labels:{color:"dark"===T?"#ffffff":"#000000",font:{family:"Arial, sans-serif",size:12}},onClick:(e,t,a)=>{let n=t.datasetIndex,r=a.chart,l=r.getDatasetMeta(n);l.hidden=null===l.hidden?!r.data.datasets[n].hidden:null;let s=r.data.datasets.filter((e,t)=>!r.getDatasetMeta(t).hidden).flatMap(e=>e.data).filter(e=>e.y>0),o=Math.max(...s.map(e=>e.y))+10,i=Math.min(...s.map(e=>e.x)),c=Math.max(...s.map(e=>e.x));r.options.scales.y.suggestedMax=o,r.options.scales.x.min=i,r.options.scales.x.max=c,r.update()}},tooltip:{backgroundColor:"dark"===T?"rgba(0, 0, 0, 1)":"rgba(0, 0, 0, 0.8)",titleFont:{family:"Arial, sans-serif",size:14,color:"#ffffff",borderWidth:1,boxPadding:4},bodyFont:{family:"Arial, sans-serif",size:12,color:"#ffffff"},callbacks:{title:e=>{let t=l.find(t=>new Date("".concat(t.date.split("T")[0],"T").concat(t.hour)).getTime()===new Date(e[0].parsed.x).getTime()),a=new Date(t?"".concat(t.date.split("T")[0],"T").concat(t.hour):"");return"".concat(a.toLocaleDateString("en-US",{day:"numeric",month:"short",year:"numeric"}),", ").concat(a.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:!1}))},label:e=>{let t=i[e.datasetIndex],a=l.find(t=>new Date("".concat(t.date.split("T")[0],"T").concat(t.hour)).getTime()===new Date(e.parsed.x).getTime());return a?"".concat(t.label,": ").concat(a[t.label]," Viewers"):""},labelColor:e=>{let t=i[e.datasetIndex];return{borderColor:t.borderColor,backgroundColor:t.borderColor}}}}},maintainAspectRatio:!1};return(0,n.jsxs)("div",{className:"chart-container ".concat(r?"modal-chart":"card-chart"," ").concat(T),children:[(0,n.jsx)(u.x1,{data:{datasets:i},options:d}),!r&&!h&&(0,n.jsx)("span",{onClick:()=>F(e),className:"expand-text ".concat(T),children:"Ampliar Gr\xe1fico"})]},e)},G=l.length>0&&E("Combined",l),L=Object.keys(S).sort((e,t)=>new Date(e).getTime()-new Date(t).getTime());return(0,n.jsxs)("div",{className:"charts-container ".concat(T),children:[(0,n.jsxs)("div",{className:"view-mode-toggle",children:[(0,n.jsx)("button",{onClick:()=>{f(e=>"all"===e?"channel":"all"),"all"===b&&y(null)},className:"button-toggle ".concat(T),children:"all"===b?"Ver por canal":"Ver todos los canales"}),"channel"===b&&(0,n.jsx)("select",{value:j||"",onChange:e=>{y(e.target.value)},className:"channel-select ".concat(T),children:["luzu","olga","gelatina","blender","lacasa","vorterix","bondi","carajo","azz"].map(e=>(0,n.jsx)("option",{value:e,children:e},e))})]}),(0,n.jsxs)("div",{className:"time-range-filters",children:[(0,n.jsxs)("label",{children:["Hora de inicio:",(0,n.jsx)("input",{type:"time",value:v,onChange:e=>N(e.target.value)})]}),(0,n.jsxs)("label",{children:["Hora de fin:",(0,n.jsx)("input",{type:"time",value:C,onChange:e=>z(e.target.value)})]})]}),!h&&(0,n.jsx)("button",{onClick:()=>d(!c),className:"button-combine-toggle ".concat(T),children:c?"Cancelar":"Combinar Gr\xe1ficos"}),c&&(0,n.jsxs)("div",{className:"selection-list ".concat(c?"show":""," ").concat(T),children:[L.map(e=>(0,n.jsxs)("div",{className:"selection-list-item",children:[(0,n.jsx)("input",{type:"checkbox",checked:a.includes(e),onChange:()=>D(e),className:"selection-list-checkbox"}),(0,n.jsx)("label",{className:"selection-list-label ".concat(T),children:e})]},e)),(0,n.jsx)("button",{onClick:A,disabled:a.length<2,className:"button-combine ".concat(T),children:"Combinar Seleccionados"})]}),h&&(0,n.jsxs)("div",{children:[(0,n.jsx)("button",{onClick:()=>{o([]),r([]),m(!1)},className:"button-revert ".concat(T),children:"Revertir Combinaci\xf3n"}),G]}),!h&&(0,n.jsx)("div",{className:"charts-grid-container",children:(0,n.jsx)("div",{className:"charts-grid",children:L.map(e=>E(e,S[e]))})}),p&&(0,n.jsx)("div",{className:"modal-overlay",children:(0,n.jsxs)("div",{className:"modal-content-chart ".concat(T),children:[(0,n.jsx)("button",{className:"close-button ".concat(T),onClick:()=>{x(null)},children:"\xd7"}),E(p,S[p],!0)]})})]})}function p(e){let{data:t}=e,[a,r]=(0,s.useState)(null),[l,o]=(0,s.useState)(["luzu","olga","gelatina","blender","lacasa","vorterix","bondi","carajo","azz"]),{theme:c}=(0,i.F)(),d=e=>{o(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e])},h=Object.values(t.reduce((e,t)=>(["luzu","olga","gelatina","blender","lacasa","vorterix","bondi","carajo","azz"].forEach(a=>{(!e[a]||e[a].viewers<Number(t[a]))&&(e[a]={channel_name:a,date:t.date,hour:t.hour,viewers:Number(t[a])})}),e),{})).filter(e=>l.includes(e.channel_name)).sort((e,t)=>t.viewers-e.viewers),g=e=>{e.length>0&&r(h[e[0].index])},m=["rgba(75, 192, 192, 1)","rgba(255, 99, 132, 1)","rgba(54, 162, 235, 1)","rgba(255, 206, 86, 1)","rgba(153, 102, 255, 1)","rgba(255, 159, 64, 1)","rgba(199, 199, 199, 1)"],p={labels:h.map(e=>e.channel_name),datasets:[{label:"Pico de Viewers",data:h.map(e=>e.viewers),backgroundColor:m,borderColor:m,borderWidth:0,borderRadius:6}]};return(0,n.jsxs)("div",{className:"card-summary ".concat(c),children:[(0,n.jsx)("h3",{children:"Pico de Viewers"}),(0,n.jsx)("div",{className:"channel-filters",children:["luzu","olga","gelatina","blender","lacasa","vorterix","bondi","carajo","azz"].map(e=>(0,n.jsxs)("div",{className:"channel-filter ".concat(c),children:[(0,n.jsx)("input",{type:"checkbox",id:e,checked:l.includes(e),onChange:()=>d(e)}),(0,n.jsx)("label",{htmlFor:e,children:e})]},e))}),(0,n.jsx)("div",{className:"chart-container-sumary ".concat(c),style:{marginTop:"20px"},children:(0,n.jsx)(u.$Q,{data:p,options:{responsive:!0,maintainAspectRatio:!1,onClick:(e,t)=>g(t),scales:{y:{beginAtZero:!0,grid:{color:"dark"===c?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)"},ticks:{color:"dark"===c?"#ffffff":"#000000"}},x:{grid:{color:"dark"===c?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)"},ticks:{color:"dark"===c?"#ffffff":"#000000"}}}}})}),a&&(0,n.jsx)("div",{className:"modal-summary",children:(0,n.jsxs)("div",{className:"modal-content-summary",children:[(0,n.jsx)("span",{className:"close",onClick:()=>{r(null)},children:"\xd7"}),(0,n.jsx)("h2",{children:"Detalles del Pico"}),(0,n.jsxs)("p",{children:[(0,n.jsx)("strong",{children:"Canal:"})," ",a.channel_name]}),(0,n.jsxs)("p",{children:[(0,n.jsx)("strong",{children:"Fecha:"})," ",(e=>{let t=new Date(e),a=String(t.getUTCDate()).padStart(2,"0"),n=String(t.getUTCMonth()+1).padStart(2,"0"),r=t.getUTCFullYear();return"".concat(a,"/").concat(n,"/").concat(r)})(a.date)]}),(0,n.jsxs)("p",{children:[(0,n.jsx)("strong",{children:"Hora:"})," ",a.hour]}),(0,n.jsxs)("p",{children:[(0,n.jsx)("strong",{children:"Pico m\xe1s alto:"})," ",a.viewers]})]})})]})}a(6612),a(9733),h.kL.register(h.uw,h.f$,h.od,h.jn,h.ZL,h.Dx,h.u,h.De,h.FB),a(1180);var x=e=>{let{isOpen:t,onClose:a}=e,[r,l]=(0,s.useState)(""),[i,u]=(0,s.useState)(""),[h,g]=(0,s.useState)(!1),[m,p]=(0,s.useState)(""),x=async e=>{e.preventDefault();let t=await (0,o.signIn)("credentials",{redirect:!1,username:r,password:i});(null==t?void 0:t.error)?p(t.error):window.location.href="/admin"};return t?(0,n.jsx)("div",{className:"fixed inset-0 flex items-center justify-center bg-black bg-opacity-50",children:(0,n.jsxs)("div",{className:"bg-gray-800 p-6 rounded-lg shadow-lg w-80 relative",children:[(0,n.jsx)("img",{src:"/logo-expansion-verde.png",alt:"Logo",className:"absolute top-4 right-4 w-8 h-8"}),(0,n.jsx)("h2",{className:"text-2xl font-semibold mb-6 text-center text-white",children:"Iniciar Sesi\xf3n"}),(0,n.jsxs)("form",{onSubmit:x,children:[(0,n.jsxs)("div",{className:"mb-6 relative",children:[(0,n.jsx)("input",{id:"username",type:"text",value:r,onChange:e=>l(e.target.value),required:!0,className:"peer mt-1 block w-full bg-gray-700 text-white border-b-2 border-gray-600 focus:border-indigo-500 focus:outline-none transition-all duration-500 ease-in-out placeholder-transparent",placeholder:"Nombre de Usuario"}),(0,n.jsx)("label",{htmlFor:"username",className:"absolute left-0 -top-4 text-gray-400 text-sm transition-all duration-500 ease-in-out peer-placeholder-shown:top-0 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-4 peer-focus:text-sm peer-focus:text-indigo-500",children:"Nombre de Usuario"})]}),(0,n.jsxs)("div",{className:"mb-4 relative",children:[(0,n.jsx)("input",{id:"password",type:h?"text":"password",value:i,onChange:e=>u(e.target.value),required:!0,className:"peer mt-1 block w-full bg-gray-700 text-white border-b-2 border-gray-600 focus:border-indigo-500 focus:outline-none transition-all duration-500 ease-in-out placeholder-transparent",placeholder:"Contrase\xf1a"}),(0,n.jsx)("label",{htmlFor:"password",className:"absolute left-0 -top-4 text-gray-400 text-sm transition-all duration-500 ease-in-out peer-placeholder-shown:top-0 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-4 peer-focus:text-sm peer-focus:text-indigo-500",children:"Contrase\xf1a"}),(0,n.jsx)("button",{type:"button",onClick:()=>{g(!h)},className:"absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-400",children:(0,n.jsx)(c.G,{icon:h?d.Aq:d.Mdf})})]}),m&&(0,n.jsx)("div",{className:"text-red-500 text-sm mb-4",children:m}),(0,n.jsxs)("div",{className:"flex justify-end",children:[(0,n.jsx)("button",{type:"button",onClick:a,className:"mr-2 py-2 px-4 border border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-500 ease-in-out",children:"Cancelar"}),(0,n.jsx)("button",{type:"submit",className:"py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-500 ease-in-out",children:"Iniciar sesi\xf3n"})]})]})]})}):null};a(2651),a(9051),a(5291);var b=a(6648);a(269);let f=()=>(0,n.jsxs)("div",{className:"jsx-21483a5a502ed8f3 preloader",children:[(0,n.jsx)("div",{className:"jsx-21483a5a502ed8f3 preloader-chart",children:(0,n.jsx)("div",{className:"jsx-21483a5a502ed8f3 line"})}),(0,n.jsx)(l(),{id:"21483a5a502ed8f3",children:'.preloader.jsx-21483a5a502ed8f3{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;height:100%}.preloader-chart.jsx-21483a5a502ed8f3{width:100px;height:100px;position:relative}.line.jsx-21483a5a502ed8f3{width:100%;height:100%;border-left:2px solid#4CAF50;border-bottom:2px solid#4CAF50;position:absolute;top:0;left:0}.line.jsx-21483a5a502ed8f3::before{content:"";position:absolute;width:100%;height:100%;background:-webkit-linear-gradient(left,#4CAF50,#4CAF50 50%,transparent 50%);background:-moz-linear-gradient(left,#4CAF50,#4CAF50 50%,transparent 50%);background:-o-linear-gradient(left,#4CAF50,#4CAF50 50%,transparent 50%);background:linear-gradient(90deg,#4CAF50,#4CAF50 50%,transparent 50%);-webkit-background-size:200%100%;-moz-background-size:200%100%;-o-background-size:200%100%;background-size:200%100%;-webkit-animation:zigzag 2s infinite;-moz-animation:zigzag 2s infinite;-o-animation:zigzag 2s infinite;animation:zigzag 2s infinite}@-webkit-keyframes zigzag{0%{-webkit-clip-path:polygon(0%100%,0%100%,0%100%,0%100%);clip-path:polygon(0%100%,0%100%,0%100%,0%100%)}25%{-webkit-clip-path:polygon(0%100%,25%75%,50%100%,75%75%,100%100%);clip-path:polygon(0%100%,25%75%,50%100%,75%75%,100%100%)}50%{-webkit-clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%);clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}75%{-webkit-clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%);clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}100%{-webkit-clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%);clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}}@-moz-keyframes zigzag{0%{clip-path:polygon(0%100%,0%100%,0%100%,0%100%)}25%{clip-path:polygon(0%100%,25%75%,50%100%,75%75%,100%100%)}50%{clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}75%{clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}100%{clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}}@-o-keyframes zigzag{0%{clip-path:polygon(0%100%,0%100%,0%100%,0%100%)}25%{clip-path:polygon(0%100%,25%75%,50%100%,75%75%,100%100%)}50%{clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}75%{clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}100%{clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}}@keyframes zigzag{0%{-webkit-clip-path:polygon(0%100%,0%100%,0%100%,0%100%);clip-path:polygon(0%100%,0%100%,0%100%,0%100%)}25%{-webkit-clip-path:polygon(0%100%,25%75%,50%100%,75%75%,100%100%);clip-path:polygon(0%100%,25%75%,50%100%,75%75%,100%100%)}50%{-webkit-clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%);clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}75%{-webkit-clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%);clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}100%{-webkit-clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%);clip-path:polygon(0%100%,25%75%,50%50%,75%25%,100%0%)}}'})]});function j(){let{data:e,status:t}=(0,o.useSession)(),{theme:a,toggleTheme:r}=(0,i.F)(),[l,u]=(0,s.useState)(!1),[h,g]=(0,s.useState)([]),[j,y]=(0,s.useState)(!1),[w,k]=(0,s.useState)(""),[v,N]=(0,s.useState)(""),[C,z]=(0,s.useState)(!1);(0,s.useEffect)(()=>{document.documentElement.setAttribute("data-theme",a)},[a]);let T=async()=>{if(!w||!v)return;z(!0);let e=await fetch("/api/fetchData?startDate=".concat(w,"&endDate=").concat(v)),t=await e.json();console.log("Datos obtenidos:",t),g(t),z(!1)},S=()=>{z(!1)};return(0,n.jsxs)("div",{className:"flex flex-col min-h-screen ".concat("dark"===a?"bg-black text-white":"bg-gray-100 text-black"),children:[(0,n.jsxs)("header",{className:"w-full flex justify-between items-center p-4 shadow-md ".concat("dark"===a?"header-dark":"header-light"),children:[(0,n.jsxs)("div",{className:"flex items-center",children:[(0,n.jsx)(b.default,{src:"/logo-expansion-verde.png",alt:"Logo Verde",width:50,height:50,className:"mr-4"}),(0,n.jsx)("h1",{className:"text-2xl font-bold",children:"YouTube Viewers Analysis"})]}),(0,n.jsxs)("div",{className:"flex items-center",children:[(0,n.jsx)("button",{onClick:r,className:"btn btn-theme mr-4 transition-transform transform hover:scale-110",children:"dark"===a?(0,n.jsx)(c.G,{icon:d.enB}):(0,n.jsx)(c.G,{icon:d.DBF})}),"loading"===t?(0,n.jsx)("p",{children:"Cargando..."}):e?(0,n.jsxs)("button",{onClick:()=>(0,o.signOut)(),className:"btn btn-secondary p-2 rounded-lg bg-red-500 text-white hover:bg-red-700 transition-transform transform hover:scale-110",children:[(0,n.jsx)(c.G,{icon:d.jLD,className:"mr-2"}),"Cerrar sesi\xf3n"]}):(0,n.jsxs)("button",{onClick:()=>{u(!0)},className:"btn btn-primary p-2 rounded-lg bg-green-500 text-white hover:bg-green-700 transition-transform transform hover:scale-110",children:[(0,n.jsx)(c.G,{icon:d.$Wj,className:"mr-2"}),"Iniciar sesi\xf3n"]})]})]}),(0,n.jsxs)("main",{className:"flex-grow flex",children:[(0,n.jsxs)("div",{className:"w-64 p-4 shadow-md ".concat("dark"===a?"bg-[#1e1e1e] text-white":"bg-white text-black"),children:[(0,n.jsxs)("button",{onClick:()=>{y(!0)},className:"btn btn-primary w-full mb-4 p-2 rounded-lg text-white hover:bg-gray-900 transition-transform transform hover:scale-110",style:{backgroundColor:"#4CAF50"},children:[(0,n.jsx)(c.G,{icon:d.Stf,className:"mr-2"}),"Consultar M\xe9tricas"]}),j&&(0,n.jsxs)("div",{className:"flex flex-col space-y-4",children:[(0,n.jsx)("input",{type:"date",value:w,onChange:e=>k(e.target.value),className:"p-2 border rounded-lg ".concat("dark"===a?"bg-gray-700 text-white":"bg-white text-black")}),(0,n.jsx)("input",{type:"date",value:v,onChange:e=>N(e.target.value),className:"p-2 border rounded-lg ".concat("dark"===a?"bg-gray-700 text-white":"bg-white text-black")}),(0,n.jsx)("button",{onClick:T,className:"btn btn-secondary w-full p-2 rounded-lg text-white hover:bg-gray-900 transition-transform transform hover:scale-110",style:{backgroundColor:"#4CAF50"},children:"Consultar"})]})]}),(0,n.jsxs)("section",{className:"flex-grow p-8",children:[C?(0,n.jsx)(f,{}):h.length>0&&(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)("section",{className:"mb-8",children:[(0,n.jsx)("h2",{className:"text-2xl font-bold mb-4",children:"Gr\xe1ficos de L\xednea"}),(0,n.jsx)(m,{data:h,onRendered:S})]}),(0,n.jsxs)("section",{className:"mb-8",children:[(0,n.jsx)("h2",{className:"text-2xl font-bold mb-4",children:"Gr\xe1ficos de Barras"}),(0,n.jsx)("div",{className:"flex flex-col md:flex-row justify-between w-full space-y-4 md:space-y-0 md:space-x-4",children:(0,n.jsx)("div",{className:"chart-container-small-sumary w-full md:w-1/2",children:(0,n.jsx)(p,{data:h,onRendered:S})})})]})]}),(0,n.jsx)(x,{isOpen:l,onClose:()=>{u(!1)}})]})]}),(0,n.jsx)("footer",{className:"w-full p-4 text-center ".concat("dark"===a?"footer-dark":"footer-light"),children:(0,n.jsx)("p",{children:"\xa9 2024 YouTube Viewers Analysis. Todos los derechos reservados."})})]})}},9733:function(){},1180:function(){},269:function(){}},function(e){e.O(0,[205,619,983,676,674,998,648,167,335,971,23,744],function(){return e(e.s=4159)}),_N_E=e.O()}]);