// Reglas del escritorio: xfrmParteDatos.SeleccionarCapitulo/CentroCoste/TipoHora.
import {appendRows} from './responsive.js?v=fluidez-7';
export const pointCatalog=work=>String(work||'').includes('A')?'centros':'capitulos';
export function pointValues(row,kind,count=8){
 return Array.from({length:count},(_,i)=>kind==='centros'?(i===0?row.CentroCoste:i===1?row.SubCentro:undefined):row['N'+(i+1)]);
}
export function mergePoints(current,row,kind,count=current.length){
 const values=pointValues(row,kind,count);return Array.from({length:count},(_,i)=>values[i]===null||values[i]===undefined?current[i]??'':String(values[i]));
}
export function catalogData(state,name){
 const rows=state?.completo?.catalogos?.[name]?.filas?.map(row=>row.datos)||[];
 const fallback=name==='obras'?state?.obras:name==='tipos'?state?.tipos_hora:[];
 return (rows.length?rows:fallback||[]).filter(row=>name==='obras'?row.Cerrada!==true:row.Valido!==false);
}
export function typeDefaults(row,current){
 if(!row.NumObra)return {...current,tipo_hora:String(row.TipoHora)};
 return {...current,tipo_hora:String(row.TipoHora),obra:String(row.NumObra),titulo:current.titulo||row.DescripcionHoras||'',notas:current.notas||row.Aclaraciones||''};
}
const make=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
export class CatalogPicker{
 constructor(state){this.state=state;this.dialog=make('dialog',undefined,'pc-picker');this.dialog.setAttribute('aria-label','Seleccionar del catálogo');document.body.append(this.dialog);this.dialog.addEventListener('close',()=>this.opener?.isConnected&&this.opener.focus());}
 bind(input,action,name='Seleccionar'){
  if(!input||input.dataset.picker)return;input.dataset.picker='true';
  const wrap=make('span',undefined,'pc-pick-field'),button=make('button',name,'pc-pick-button');button.type='button';button.setAttribute('aria-label',name);input.replaceWith(wrap);wrap.append(input,button);
  const open=event=>{event?.preventDefault();if(!input.disabled)action();};button.addEventListener('click',open);input.addEventListener('dblclick',open);input.addEventListener('keydown',event=>{if(event.key==='F4'||event.altKey&&event.key==='ArrowDown')open(event);});
 }
 choose(name,onChoose){
  const titles={obras:'Seleccionar obra',tipos:'Seleccionar tipo de hora',capitulos:'Seleccionar capítulo / puntos',centros:'Seleccionar centro de coste'};
  const columns={obras:['NumObra','DescripcionObra','Cliente'],tipos:['TipoHora','DescripcionHoras','NumObra'],capitulos:['N1','N2','N3','N4','N5','N6','N7','N8','Descripcion','Departamento'],centros:['CentroCoste','SubCentro','LugarTrabajo','Zona']}[name];
  this.opener=document.activeElement;const dialog=this.dialog;dialog.replaceChildren();let selected;
  const heading=make('h2',titles[name]),label=make('label','Buscar'),search=make('input'),area=make('div',undefined,'pc-picker-results'),status=make('p',undefined,'muted'),actions=make('div',undefined,'pc-actions');search.type='search';search.placeholder='Código, descripción o departamento';label.append(search);status.setAttribute('role','status');
  const cancel=make('button','Cancelar'),accept=make('button','Seleccionar','primary');cancel.type=accept.type='button';accept.disabled=true;cancel.addEventListener('click',()=>dialog.close());
  const apply=()=>{if(!selected)return;onChoose(selected);dialog.close();};accept.addEventListener('click',apply);actions.append(cancel,accept);dialog.append(heading,label,area,status,actions);
  const rows=catalogData(this.state(),name);
  const searchIndex=rows.map(row=>columns.map(key=>String(row[key]??'').toLocaleLowerCase('es')));
  const render=()=>{area.replaceChildren();selected=undefined;accept.disabled=true;const query=search.value.trim().toLocaleLowerCase('es');const shown=rows.filter((row,index)=>!query||searchIndex[index].some(value=>value.includes(query)));
   status.textContent=shown.length?shown.length+' registros. Selecciona una fila y pulsa Seleccionar, o haz doble clic.':rows.length?'No hay coincidencias. Cambia la búsqueda.':'Este catálogo todavía no contiene registros. Sincroniza con el PC y vuelve a intentarlo.';
   if(!shown.length)return;const table=make('table'),head=make('thead'),hr=make('tr'),body=make('tbody');for(const key of columns){const th=make('th',({Descripcion:'Descripción',DescripcionObra:'Título de obra',TipoHora:'Tipo',DescripcionHoras:'Descripción',NumObra:'N.º obra',CentroCoste:'Centro',SubCentro:'Subcentro',LugarTrabajo:'Lugar de trabajo'})[key]||key);th.scope='col';hr.append(th);}head.append(hr);table.append(head,body);
   appendRows(body,shown,row=>{const tr=make('tr');tr.setAttribute('aria-selected','false');const select=()=>{selected=row;accept.disabled=false;for(const other of body.children)other.setAttribute('aria-selected',String(other===tr));};
    for(const [i,key]of columns.entries()){const td=make('td');if(i===0){const button=make('button',String(row[key]??'—'),'pc-picker-code');button.type='button';button.setAttribute('aria-label',columns.map(c=>row[c]).filter(v=>v!==null&&v!==undefined&&v!=='').join(' · '));button.addEventListener('click',select);button.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();select();apply();}});td.append(button);}else td.textContent=String(row[key]??'');tr.append(td);}tr.addEventListener('click',select);tr.addEventListener('dblclick',()=>{select();apply();});return tr;
   });area.append(table);
  };search.addEventListener('input',render);render();dialog.showModal();search.focus();
 }
 daily(form){
  const f=form.elements;if(f.pending_work)f.pending_work.addEventListener('change',()=>{if(f.pending_work.checked)f.obra.value='';});
  this.bind(f.obra,()=>this.choose('obras',row=>{f.obra.value=row.NumObra;f.titulo.value=row.DescripcionObra||'';if(f.pending_work)f.pending_work.checked=false;}),'Seleccionar obra');
  this.bind(f.tipo_hora,()=>this.choose('tipos',row=>{const values=typeDefaults(row,{tipo_hora:f.tipo_hora.value,obra:f.obra.value,titulo:f.titulo.value,notas:f.notas.value});for(const [name,value]of Object.entries(values))f[name].value=value;if(f.pending_work&&values.obra)f.pending_work.checked=false;}),'Seleccionar tipo');
  const points=()=>this.choose(pointCatalog(f.obra.value),row=>{const inputs=Array.from({length:8},(_,i)=>f['nivel_'+(i+1)]),next=mergePoints(inputs.map(input=>input.value),row,pointCatalog(f.obra.value));inputs.forEach((input,i)=>input.value=next[i]);});
  for(let i=1;i<=8;i++){const input=f['nivel_'+i];input.addEventListener('dblclick',points);input.addEventListener('keydown',event=>{if(event.key==='F4'){event.preventDefault();points();}});}
  const button=make('button','Seleccionar puntos','pc-pick-button');button.type='button';button.addEventListener('click',points);form.querySelector('.pc-levels').append(button);
 }
 fields(input,name,container){
  const find=key=>container.querySelector('[data-field="'+key+'"]');
  if(['NumObra','NumeroObra'].includes(name))this.bind(input,()=>this.choose('obras',row=>{input.value=row.NumObra;const title=find('TituloObra')||find('Titulo');if(title)title.value=row.DescripcionObra||'';const client=find('Cliente');if(client)client.value=row.Cliente||'';}),'Seleccionar obra');
  if(name==='TipoHora')this.bind(input,()=>this.choose('tipos',row=>{input.value=row.TipoHora;const work=find('NumObra');if(work&&row.NumObra){work.value=row.NumObra;const title=find('TituloObra'),notes=find('Notas');if(title&&!title.value)title.value=row.DescripcionHoras||'';if(notes&&!notes.value)notes.value=row.Aclaraciones||'';}}),'Seleccionar tipo');
  if(/^Punto[1-6]$/.test(name)||['Capitulo','Subcapitulo'].includes(name))this.bind(input,()=>{
   const work=find('NumObra')||find('NumeroObra')||find('Obra'),kind=pointCatalog(work?.value);
   this.choose(kind,row=>{const names=name.startsWith('Punto')?Array.from({length:6},(_,i)=>'Punto'+(i+1)):['Capitulo','Subcapitulo'];const inputs=names.map(find);const next=mergePoints(inputs.map(i=>i?.value||''),row,kind,names.length);inputs.forEach((field,i)=>{if(field)field.value=next[i];});});
  },'Seleccionar puntos');
 }
}
