let arrayIdPrivati=[]; 
const salvati = sessionStorage.getItem("arrayIdPrivati"); //uso le sessioni perchè mi sono più comode
if (salvati) {
    arrayIdPrivati = JSON.parse(salvati);
}

function eseguiRichiesta() { //Metodo che riprende il codice di postman
    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };

    fetch("https://api.restful-api.dev/objects", requestOptions)
    .then((response) => response.text())
    .then((result) => mostraContenuto(JSON.parse(result)))
    .catch((error) => console.error(error))
    .finally(()=>{ 
        const bottone = document.getElementById("cont-bottoneinvio");
        document.body.removeChild(bottone);
        aggiungiTornaIndietro();
    });
}

function eseguiAggiunta(stringaJsonAggiunta){
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = stringaJsonAggiunta; //stringa json che prevedo sia già convertita in json

    const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
    };

    fetch("https://api.restful-api.dev/objects", requestOptions)
    .then((response) => {
        if (!response.ok){
            const contenuto = document.getElementById("cont-contenuto");
            contenuto.style.visibility = "visible";
            contenuto.innerText = `Errore ${response.status}: Impossibile aggiungere l'oggetto.`;
            setTimeout(() => { 
                contenuto.innerText = ""; 
                contenuto.style.visibility = "hidden"; 
                window.location.reload();
            }, 120000); //2 minuti
            return;
        }
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

function mostraContenuto(result) { //result è un array di oggetti convertito prima
    const contenuto = document.getElementById("cont-contenuto");
    contenuto.style.visibility = "visible";
    for( let ogg of result){
        contenuto.appendChild(new Oggetto(ogg.id, ogg.name, ogg.data).creaElementoGrafica());
    }  
    
    if(arrayIdPrivati.length > 0){ 
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        let stringaRichiesta="https://api.restful-api.dev/objects/";
        for(let idp of arrayIdPrivati){
            stringaRichiesta+=`id=${idp}&`;
        }
        fetch(stringaRichiesta, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            const oggPriv = JSON.parse(result);
            for(let ogg of oggPriv){
                contenuto.appendChild(new Oggetto(ogg.id, ogg.name, ogg.data).creaElementoGrafica());
            }
        })
        .catch((error) => console.error(error));
    }
}

function aggiungiTornaIndietro(){
    const bottone = document.createElement("button");
    bottone.id = "bottoneindietro";
    bottone.innerText = "Torna Indietro";
    bottone.onclick = function() { window.location.reload(); };

    const contenuto = document.getElementById("cont-contenuto");
    contenuto.appendChild(bottone);
}

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
        bottone.onclick = function() { 
            const contenuto = document.getElementById("cont-contenuto");
            contenuto.style.visibility = "hidden";

            const formModifica = document.getElementById("formmodifica");
            formModifica.style.visibility = "visible";
            document.getElementById("id-form").value = this.id;
            document.getElementById("nome-form").value = this.nome;
            for (const [key, value] of Object.entries(this.data)){
                const hString = document.createElement("h2");
                hString.innerText = key;
                const inputString = document.createElement("input");
                inputString.type = "text";
                inputString.id = `form-${key}`;
                inputString.placeholder = `Inserisci ${key}`;
                inputString.value = value;
                formModifica.appendChild(hString);
                formModifica.appendChild(inputString);
            }
         };
        elemento.appendChild(bottone);
        return elemento;
    }
}