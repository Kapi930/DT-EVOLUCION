const UPDATE_VERSION='20261120-4';

function workerVersion(worker,timeout=1000){
 if(!worker)return Promise.resolve(null);
 return new Promise(resolve=>{
  const channel=new MessageChannel();let timer;
  const finish=value=>{clearTimeout(timer);channel.port1.close();channel.port2.close();resolve(value);};
  channel.port1.onmessage=event=>finish(event.data?.version||null);
  timer=setTimeout(()=>finish(null),timeout);
  try{worker.postMessage({type:'DT_VERSION'},[channel.port2]);}catch{finish(null);}
 });
}

async function waitForVersion(registration,expected,limit=45000){
 const deadline=Date.now()+limit;
 while(Date.now()<deadline){
  if(await workerVersion(registration.active)===expected)return;
  await new Promise(resolve=>setTimeout(resolve,250));
 }
 throw new Error('La actualización todavía no está lista. Comprueba Internet y vuelve a pulsar Actualizar.');
}

function installUpdateUI(){
 const button=document.getElementById('update-app'),status=document.getElementById('update-status');
 button.addEventListener('click',async()=>{
  if(button.disabled)return;
  button.disabled=true;status.textContent='Descargando y comprobando la actualización…';
  try{
   if(!navigator.serviceWorker)throw new Error('Abre esta página en Chrome o Edge actualizado.');
   const scope=new URL('./',location.href).href;
   const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
   if(registration.scope!==scope)throw new Error('La actualización no corresponde a esta instalación de DT Evolución.');
   await registration.update();
   await waitForVersion(registration,UPDATE_VERSION);
   status.textContent='Versión comprobada. Abriendo DT Evolución…';
   location.replace('./index.html?version='+UPDATE_VERSION);
  }catch(error){status.textContent=error.message||'No se ha podido actualizar. Vuelve a intentarlo.';}
  finally{button.disabled=false;}
 });
}
installUpdateUI();
