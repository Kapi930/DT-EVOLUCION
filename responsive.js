// Mantiene disponibles el teclado y los toques al construir tablas grandes.
// Las primeras filas aparecen en el mismo turno; el resto cede al navegador.
export function appendRows(body,rows,createRow,batchSize=40){
 let index=0;
 const append=()=>{
  const end=Math.min(index+batchSize,rows.length);
  for(;index<end;index++)body.append(createRow(rows[index]));
  if(index<rows.length)setTimeout(()=>{if(body.isConnected)append();},0);
 };
 append();
}
