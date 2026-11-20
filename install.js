// La instalación pertenece exclusivamente a /DT-EVOLUCION/.
let installPrompt;
const installButton=document.getElementById('install-app');
window.addEventListener('beforeinstallprompt',event=>{
 event.preventDefault();installPrompt=event;installButton.hidden=false;
});
installButton.addEventListener('click',async()=>{
 if(!installPrompt)return;
 const prompt=installPrompt;installPrompt=undefined;installButton.disabled=true;
 try{await prompt.prompt();await prompt.userChoice;}
 finally{installButton.disabled=false;installButton.hidden=true;}
});
window.addEventListener('appinstalled',()=>{installPrompt=undefined;installButton.hidden=true;});
