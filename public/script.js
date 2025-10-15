let arrayIdPrivati=[]; 
const salvati = sessionStorage.getItem("arrayIdPrivati"); //uso le sessioni perchè mi sono più comode
if (salvati) {
    arrayIdPrivati = JSON.parse(salvati);
}else {
    sessionStorage.setItem("arrayIdPrivati",JSON.stringify(arrayIdPrivati))
}

//funzioni utili 
function aggiungiDato() {
    const contDati = document.getElementById('contdati-form-add');
    const nuovoDatoDiv = document.createElement('div');
    nuovoDatoDiv.id = 'nuovo-dato-div';

    const inputChiave = document.createElement('input');
    inputChiave.type = 'text';
    inputChiave.className = 'dati-form-add';
    inputChiave.placeholder = 'Memoria';
    inputChiave.required = true;

    const inputValore = document.createElement('input');
    inputValore.type = 'text';
    inputValore.className = 'dati-form-add';
    inputValore.placeholder = '128 GB';
    inputValore.required = true;

    const cancellazione = document.createElement('button');
    cancellazione.textContent = 'X';
    cancellazione.className = "bottone-cancella";
    cancellazione.type = "button";
    cancellazione.onclick = function(event) {
        event.preventDefault();
        contDati.removeChild(nuovoDatoDiv);
    };

    nuovoDatoDiv.appendChild(inputChiave);
    nuovoDatoDiv.appendChild(inputValore);
    nuovoDatoDiv.appendChild(cancellazione);

    contDati.appendChild(nuovoDatoDiv);
}
function ricarica(){
    window.location.reload();
    scrollTo(0,0);
}
    
function modificaVistaFormAggiunta(isVisible){
    document.getElementById('formaggiunta').style.visibility = isVisible ? 'visible' : 'hidden';
}
function mostraPopupErrore(messaggio) {
    const popup = document.getElementById("popup-errore");
    popup.innerText = messaggio;
    popup.style.display = "block";
    setTimeout(() => {
        popup.style.display = "none";
    }, 4000); // 4 sec
}


//funzioni che parlano con api
//richiesta lista ogg
function eseguiRichiesta() { 
    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };

    fetch("https://api.restful-api.dev/objects", requestOptions)
    .then((response) => response.text())
    .then((result) => mostraContenuto(JSON.parse(result)))
    .catch((error) => console.error(error))
    .finally(()=>{ 
        if(document.getElementById("cont-bottone") != null)
            (document.getElementById("cont-titolo")).removeChild(document.getElementById("cont-bottone"));
    });
}
//aggiunta ogg personale
function eseguiAggiunta(stringaJsonAggiunta){
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = stringaJsonAggiunta; 

    const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
    };

    fetch("https://api.restful-api.dev/objects", requestOptions)
    .then((response) => {
        if (!response.ok){
            mostraPopupErrore(`Errore ${response.status}: Impossibile aggiungere l'oggetto.`);
            return response.text();
        }
        return response.text();
    })
    .then((result) => {
        if(result != null){
            const ogg = JSON.parse(result);
            arrayIdPrivati.push(ogg.id); //salvo id privato
            sessionStorage.setItem("arrayIdPrivati", JSON.stringify(arrayIdPrivati)); 
            eseguiRichiesta();
        }
    })
    .catch((error) => console.error(error));
}
//cancella ogg solo personale
function rimuoviElemento(id){
    const requestOptions = {
    method: "DELETE",
    redirect: "follow"
    };

    fetch("https://api.restful-api.dev/objects/"+id, requestOptions)
    .then((response) => {
        if (!response.ok){
            mostraPopupErrore(`Errore ${response.status}: Impossibile rimuovere l'oggetto.`);
            return response.text();
        } else{
            arrayIdPrivati = arrayIdPrivati.filter(ids => ids !== id);
            sessionStorage.setItem("arrayIdPrivati", JSON.stringify(arrayIdPrivati)); 
        }
        return response.text();
    })
    .then((result) => eseguiRichiesta())
    .catch((error) => console.error(error));
}
//modifica ogg solo personale
function eseguiModifica(stringaJsonModifica, id){
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: stringaJsonModifica,
    redirect: "follow"
    };

    fetch("https://api.restful-api.dev/objects/"+id, requestOptions)
    .then((response) => response.text())
    .then((result) => mostraContenuto(JSON.parse(result)))
    .catch((error) => console.error(error));
}

//funzioni per grafica
function mostraContenuto(result) { //result è un array di oggetti convertito prima
    const contenuto = document.getElementById("cont-contenuto");
    contenuto.style.visibility = "visible";
    contenuto.innerHTML = "";

    for( let ogg of result){
        contenuto.appendChild(new Oggetto(ogg.id, ogg.name, ogg.data).creaElementoGrafica());
    }  
    
    const salvati = sessionStorage.getItem("arrayIdPrivati"); 
    if (salvati) arrayIdPrivati = JSON.parse(salvati);

    if(arrayIdPrivati.length > 0){ 
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        let stringaRichiesta="https://api.restful-api.dev/objects";
        if(arrayIdPrivati.length>1) stringaRichiesta+="?";
        else stringaRichiesta+="/";
        for(let idp of arrayIdPrivati){
            if(arrayIdPrivati.length===1) stringaRichiesta+=`${idp}`;
            else stringaRichiesta+=`id=${idp}&`;
        }
        if(stringaRichiesta.endsWith("&")) stringaRichiesta=stringaRichiesta.slice(0, -1);
        fetch(stringaRichiesta, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            let oggPriv = JSON.parse(result);
            if(!Array.isArray(oggPriv)) oggPriv = [oggPriv];
            for(let ogg of oggPriv){
                contenuto.appendChild(new Oggetto(ogg.id, ogg.name, ogg.data).creaElementoModificaGrafica());
            }
        })
        .catch((error) => console.error(error))
        .finally(aggiungiTornaIndietro);
    } else
        aggiungiTornaIndietro();
}
function aggiungiTornaIndietro(){
    const bottone = document.createElement("button");
    bottone.id = "bottoneindietro";
    bottone.innerText = "Torna Indietro";
    bottone.onclick = function() { 
        window.location.reload(); 
        scrollTo(0,0);
    };

    const contenuto = document.getElementById("cont-contenuto");
    contenuto.appendChild(bottone);
}

//classe
class Oggetto {
    constructor(id, nome, data) {
        this.id = id;
        this.nome = nome;
        this.data = data;
    }

    toString(){   
        let s = `Nome: ${this.nome}\n`;
        if(this.data != null && typeof this.data === "object") {
            s += "Dati:\n";
            for (const [key, value] of Object.entries(this.data)) { s += `${key}: ${value}\n`;} //Elemento ripreso da https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries , per leggere le coppie chhe variano in base all'oggetto    
        } else {
            s += "Dati: Non inseriti\n";
        }
        return s;
    }

    creaElementoGrafica(){ 
        const elemento = document.createElement("div");
        elemento.className = "oggetto_restituito";
        elemento.innerText = this.toString();
        return elemento;
    }

    creaElementoModificaGrafica(){ 
        const elemento = document.createElement("div");
        elemento.className = "oggetto_restituito";
        elemento.innerText = this.toString();
        const bottone = document.createElement("button");
        bottone.innerText = "Modifica";
        bottone.onclick = ()=>{ 
            elemento.innerText = "";
            const formModifica = document.createElement("form");
            formModifica.id = "form-modifica";
            formModifica.eventPreventDefault=true;
            formModifica.onsubmit =()=>{
                const nome = document.getElementById("nome-form-mod").value;
                const datiF = document.getElementsByClassName('dati-form-mod');
                const dati = {};

                for (let i = 0; i < datiF.length; i += 2) { 
                    const chiave = datiF[i].value;
                    const valore = datiF[i + 1].value;
                    dati[chiave] = valore;
                }

                modificaVistaFormAggiunta(false);
                eseguiModifica(JSON.stringify({
                    name: nome,
                    data: dati
                }), this.id);
            };

            const idInput=document.createElement("input");
            idInput.type="text";
            idInput.id="id-form-mod";
            idInput.value=this.id;
            idInput.readOnly=true;

            const nomeInput=document.createElement("input");
            nomeInput.type="text";
            nomeInput.id="nome-form-mod";
            nomeInput.value=this.nome;
            nomeInput.required=true;

            formModifica.appendChild(idInput);
            formModifica.appendChild(nomeInput);

            const contDati = document.createElement('div');
            contDati.id = 'contdati-form-mod';
            formModifica.appendChild(contDati);

            for (const [key, value] of Object.entries(this.data)){
                const div=document.createElement("div");
                div.style.display = "flex";
                div.style.alignItems = "center";
                div.style.width="95%";
                div.style.gap = "8px";
                
                const dataInput=document.createElement("input");
                dataInput.type="text";
                dataInput.value=key;
                dataInput.required=true;
                dataInput.className='dati-form-mod';

                const valDataInput=document.createElement("input");
                valDataInput.type="text";
                valDataInput.value=value;
                valDataInput.required=true;
                valDataInput.className='dati-form-mod';

                const cancellazione = document.createElement('button');
                cancellazione.textContent = 'X';
                cancellazione.className = "bottone-cancella";
                cancellazione.onclick = function(event) {
                    event.preventDefault(); 
                    contDati.removeChild(div);
                };

                div.appendChild(dataInput);
                div.appendChild(document.createTextNode(" : "));
                div.appendChild(valDataInput);
                div.appendChild(cancellazione);
                contDati.appendChild(div);
            }

            const aggiungiDatoBtn = document.createElement("button");
            aggiungiDatoBtn.innerText = "Aggiungi Dato";
            aggiungiDatoBtn.style.width="95%";
            aggiungiDatoBtn.type="button";
            aggiungiDatoBtn.onclick=()=>{
                const div=document.createElement("div");
                div.style.display = "flex";
                div.style.alignItems = "center";
                div.style.width="95%";
                div.style.gap = "8px";
                
                const dataInput=document.createElement("input");
                dataInput.type="text";
                dataInput.placeholder = 'Memoria';
                dataInput.required=true;
                dataInput.className='dati-form-mod';

                const valDataInput=document.createElement("input");
                valDataInput.type="text";
                valDataInput.placeholder = '128 GB';
                valDataInput.required=true;
                valDataInput.className='dati-form-mod';

                const cancellazione = document.createElement('button');
                cancellazione.textContent = 'X';
                cancellazione.className = "bottone-cancella";
                cancellazione.onclick = function(event) {
                    event.preventDefault(); 
                    contDati.removeChild(div);
                };

                div.appendChild(dataInput);
                div.appendChild(valDataInput);
                div.appendChild(cancellazione);
                contDati.appendChild(div);
            };

            const divButton=document.createElement("div");
            divButton.style.display = "flex";
            divButton.style.gap = "5%";

            const inviaBtn=document.createElement("input");
            inviaBtn.type="submit";
            inviaBtn.style.width="55%";
            inviaBtn.value="Salva";

            const resetBtn=document.createElement("input");
            resetBtn.type="reset";
            resetBtn.style.width="35%";
            resetBtn.value="Annulla";
            resetBtn.onclick=()=>eseguiRichiesta();

            divButton.appendChild(inviaBtn);
            divButton.appendChild(resetBtn);

            formModifica.appendChild(aggiungiDatoBtn);
            formModifica.appendChild(divButton);

            elemento.appendChild(formModifica);
            formModifica.scrollIntoView();
         };
        const bottoneCanc = document.createElement("button");
        bottoneCanc.type="button";
        bottoneCanc.innerText = "X";
        bottoneCanc.className = "bottone-cancella";
        bottoneCanc.onclick = () => rimuoviElemento(this.id);
        elemento.appendChild(bottone);
        elemento.appendChild(bottoneCanc);
        return elemento;
    }
}





