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
        const bottone = document.getElementById("cont-bottoneinvio");
        document.body.removeChild(bottone);
        aggiungiTornaIndietro();
    });
}

function mostraContenuto(result) {
    const contenuto = document.getElementById("cont-contenuto");
    contenuto.style.visibility = "visible";
    for( let ogg of result){
        contenuto.appendChild(new Oggetto(ogg.id, ogg.name, ogg.data).creaElementoGrafica());
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
            for (const [key, value] of Object.entries(this.data)) { s += `${key}: ${value}\n`;}
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
}