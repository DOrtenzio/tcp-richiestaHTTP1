//Inserimento carte
fetch('https://friendly-space-giggle-x5r5977xv7q426wqr-3000.app.github.dev/api/users', {
    headers: { 'accept': '*/*' }
})
.then(response => {
    if (!response.ok) throw new Error("Errore nella risposta");
    return response.json();
})
.then(data => {
    if(ottieniConf().length===0) salvaConf(data);

    data.forEach(user => {
        const templ = document.getElementById("template").content.cloneNode(true);
        const cloneCard = templ.querySelector('.card'); 

        cloneCard.querySelector(".card-title").textContent = user.name;
        cloneCard.dataset.user = user.name;

        cloneCard.querySelector(".card-subtitle").textContent = user.role ? `Ruolo: ${user.role}` : "Ruolo: Non Presente";
        cloneCard.querySelector(".card-text").textContent = `Età: ${user.age}`;

        const btnElimina = document.createElement("button");
        btnElimina.className = "btn btn-danger me-2";
        btnElimina.textContent = "Elimina Utente";
        btnElimina.onclick = () => eliminautente(user.name);
        cloneCard.querySelector(".card-footer").appendChild(btnElimina);

        const btnModifica = document.createElement("button");
        btnModifica.className = "btn btn-secondary me-2";
        btnModifica.textContent = "Modifica Utente";
        btnModifica.onclick = () => modificautente(user,cloneCard);
        cloneCard.querySelector(".card-footer").appendChild(btnModifica);

        const btnDettagli = document.createElement("button");
        btnDettagli.className = "btn btn-info";
        btnDettagli.textContent = "Dettagli Utente";
        btnDettagli.onclick = () => dettagliutente(user.name);
        cloneCard.querySelector(".card-footer").appendChild(btnDettagli);

        document.getElementById("contenitore").appendChild(templ);
    });
})
.catch(error => console.error('Errore:', error));
//Aggiornamento
setInterval(() => {
    fetch('https://friendly-space-giggle-x5r5977xv7q426wqr-3000.app.github.dev/api/users', {
        headers: { 'accept': '*/*' }
    })
    .then(response => {
        if (!response.ok) throw new Error("Errore nella risposta");
        return response.json();
    }) .then(nuoviDati => {
        const modificati = ottieniModifiche(nuoviDati).modificati;
        const cancellati = ottieniModifiche(nuoviDati).cancellati;
        if(modificati.length===0) return;
        pulisciBordi();
        for(const utenteModificato of modificati){
            let nomeutente=utenteModificato.name;
            const carta=document.querySelector(`[data-user="${nomeutente}"]`);
            if(!carta){
                    const temp = document.getElementById("template").content.cloneNode(true);
                    const cloneCard = temp.querySelector('.card'); 

                    cloneCard.querySelector(".card-title").textContent = utenteModificato.name;
                    cloneCard.dataset.user = utenteModificato.name;

                    cloneCard.querySelector(".card-subtitle").textContent = utenteModificato.role ? `Ruolo: ${utenteModificato.role}` : "Ruolo: Non Presente";
                    cloneCard.querySelector(".card-text").textContent = `Età: ${utenteModificato.age}`;

                    const btnElimina = document.createElement("button");
                    btnElimina.className = "btn btn-danger me-2";
                    btnElimina.textContent = "Elimina Utente";
                    btnElimina.onclick = () => eliminautente(utenteModificato.name);
                    cloneCard.querySelector(".card-footer").appendChild(btnElimina);

                    const btnModifica = document.createElement("button");
                    btnModifica.className = "btn btn-secondary me-2";
                    btnModifica.textContent = "Modifica Utente";
                    btnModifica.onclick = () => modificautente(utenteModificato,cloneCard);
                    cloneCard.querySelector(".card-footer").appendChild(btnModifica);

                    const btnDettagli = document.createElement("button");
                    btnDettagli.className = "btn btn-info";
                    btnDettagli.textContent = "Dettagli Utente";
                    btnDettagli.onclick = () => dettagliutente(utenteModificato.name);
                    cloneCard.querySelector(".card-footer").appendChild(btnDettagli);

                    document.getElementById("contenitore").appendChild(temp);
            } else{
                carta.querySelector(".card-subtitle").textContent = utenteModificato.role ? `Ruolo: ${utenteModificato.role}` : "Ruolo: Non Presente";
                carta.querySelector(".card-text").textContent = `Età: ${utenteModificato.age}`;
                carta.classList.add('border-warning');
            } 
        }
        for(const utenteCancellato of cancellati){
            let nomeutente=utenteCancellato.name;
            const carta=document.querySelector(`[data-user="${nomeutente}"]`);
            if(carta){
                carta.remove();
            }
        }
        salvaConf(nuoviDati);
    }).catch(error => console.error('Errore:', error));
}, 2000);

function pulisciBordi(){
    const carte=document.querySelectorAll('.card');
    carte.forEach(carta => {
        carta.classList.remove('border-warning');
    });
}

//funz per salvare elementi presenti così da aggiornare solo modificati
function salvaConf (config){
    if(sessionStorage.getItem('config')) sessionStorage.setItem('config',JSON.stringify(JSON.parse(sessionStorage.getItem('config'))));
    else sessionStorage.setItem('config',JSON.stringify(config));
}

function ottieniConf(){
    if(sessionStorage.getItem('config')){
        return JSON.parse(sessionStorage.getItem('config'));
    } else {
        return [];
    }
}

function ottieniModifiche(nuovaConf){
    if(sessionStorage.getItem('config')){
        let conf=JSON.parse(sessionStorage.getItem('config'));
        let modificati=[];
        for(const elemento of nuovaConf){
            let esiste = false;
            for (const oldEl of conf) {
                if (JSON.stringify(oldEl) === JSON.stringify(elemento)) {
                    esiste = true;
                    break;
                }
            }
        }

        const rimossi=[];
        for (const oldEl of conf) {
            let ancoraPresente = false;
            for (const elemento of nuovaConf) {
                if (JSON.stringify(oldEl) === JSON.stringify(elemento)) {
                ancoraPresente = true;
                break;
                }
            }
            if (!ancoraPresente) {
                rimossi.push(oldEl);
            }
        }
        return {
            modificati,
            rimossi
        };
    } else {
        return {
            modificati:nuovaConf,
            cancellati:rimossi
        };
    }
}

//funz su singolo
function dettagliutente(nomeutente) {
    const btnDettagli = document.querySelector(`.card[data-user="${nomeutente}"]`).querySelector(".btn.btn-info");
    if(btnDettagli.dataset.isdettagliata==='false'){
        fetch(`https://friendly-space-giggle-x5r5977xv7q426wqr-3000.app.github.dev/api/users/${nomeutente}`, {
            headers: { 'accept': '*/*' }
        })
        .then(response => {
            if (!response.ok) throw new Error("Errore nella risposta");
            return response.json();
        })
        .then(data => {
            const carta = document.querySelector(`.card[data-user="${data.name}"]`);
            carta.querySelector(".card-subtitle").textContent = data.role ? `Ruolo: ${data.role}` : "Ruolo: Non Presente";
            carta.querySelector(".card-text").textContent = `Età: ${data.age}`;

            if (Object.keys(data).length>2) {
                for(const [chiave,valore] of Object.entries(data)){
                    if(chiave!=="name" && chiave!=="age" && chiave!=="role"){
                        let testo ="";
                        if(isPlainObject(valore)){ //se è un oggetto annidato
                            testo += `<p>${chiave}:</p><ul>`;
                            for(const [subChiave, subValore] of Object.entries(valore)){
                                testo += `<li>${subChiave}: ${subValore}</li>`;
                            }
                            testo += `</ul>`;
                        } else
                            testo += `<p>${chiave}: ${valore}</p>`;
                        carta.querySelector(".card-text-2").innerHTML = testo;
                    }
                }
            }
            btnDettagli.dataset.isdettagliata='true';
        })
        .catch(error => console.error('Errore:', error));
    }else{
        const carta = document.querySelector(`.card[data-user="${nomeutente}"]`);
        carta.querySelector(".card-text-2").innerHTML = "";
        btnDettagli.dataset.isdettagliata='false';
    }
}
function isPlainObject(val){
    return Object.prototype.toString.call(val) === '[object Object]';
}
function eliminautente(nomeutente) {
    fetch(`https://friendly-space-giggle-x5r5977xv7q426wqr-3000.app.github.dev/api/users/${nomeutente}`, {
        method: 'DELETE',
        headers: { 'accept': '*/*', 'Authorization': 'Bearer 5IDtoken' }
    })
    .then(response => {
        if (!response.ok) {
            alert("Errore nell'eliminazione dell'utente");
            throw new Error("Errore nella risposta");
        }
        const contenitore = document.querySelector(`.card[data-user="${nomeutente}"]`);
        if (contenitore) contenitore.remove();
    })
    .catch(error => console.error('Errore:', error));
}
function modificautente(utente, carta) {
    //creo form modifica
    const templateform = document.getElementById("template-form").content.cloneNode(true);
    const form = templateform.querySelector('form');

    form.dataset.form_modifica=utente.name;

    const spazio_input=form.querySelector('.spazio_input');
    spazio_input.querySelector(".template-name").value = utente.name;
    spazio_input.querySelector(".template-eta").value = utente.age;

    if(Object.keys(utente).length>2){
        for(const [chiave, valore] of Object.entries(utente)){
            if(chiave!=="name" && chiave!=="age" && chiave!=="role"){
                const labelData = document.createElement("label");
                labelData.className = "form-label me-2";
                labelData.textContent = `${chiave}:`;
                spazio_input.appendChild(labelData);
                const inputData = document.createElement("input");
                inputData.type = "text";
                inputData.value = valore;
                inputData.required=true;
                inputData.name = `data-${chiave}-modifica`;
                spazio_input.appendChild(inputData);
            } else if(chiave==="role"){
                const labelRole = document.createElement("label");
                labelRole.className = "form-label me-2";
                labelRole.textContent = "Ruolo Utente:";
                spazio_input.appendChild(labelRole);
                const inputRole = document.createElement("input");
                inputRole.type = "text";
                inputRole.value = utente.role;
                inputRole.required=true;
                inputRole.name = "role-modifica";
                spazio_input.appendChild(inputRole);
            }
        }
    }

    const button=document.createElement('button');
    button.type='button';
    button.className='btn btn-outline-secondary mx-2';
    button.textContent='Aggiungi Parametro';
    button.onclick=()=>{
                    const labelData = document.createElement("input");
                    labelData.className = "form-label me-2 ";
                    labelData.type="text";
                    labelData.placeholder="Inserisci il nome del campo aggiuntivo";
                    labelData.required=true;
                    labelData.name = `data-nuovo-modifica`;

                    const inputData = document.createElement("input");
                    inputData.type = "text";
                    inputData.placeholder = "Inserisci il valore del campo aggiuntivo";
                    inputData.name = `data-nuovo-modifica`;
                    inputData.required=true;

                    spazio_input.appendChild(labelData);
                    spazio_input.appendChild(inputData);
    };
    const annulla=document.createElement('button');
    annulla.type='button';
    annulla.className='btn btn-secondary mx-2';
    annulla.textContent='Annulla Modifica';
    annulla.onclick=()=>{
        const formEsistente=carta.querySelector('[data-form_modifica="' + utente.name + '"]');
        if(formEsistente){
            formEsistente.remove(); 
        }
    };
    const bottoni_spazio=form.querySelector('.bottoni_spazio');
    bottoni_spazio.appendChild(annulla);
    bottoni_spazio.appendChild(button);
    carta.appendChild(templateform);

    const input_form = carta.querySelector('[data-form_modifica="' + utente.name + '"]').querySelector('spazio_input');
    const btnModificaForm = bottoni_spazio.querySelector('.button-form');
    btnModificaForm.onclick = () => {
        const bodyuno={};
        const nameVal = input_form.querySelector('.template-name').value.trim();
        const ageVal = input_form.querySelector('.template-eta').value;
        bodyuno.name=nameVal;
        bodyuno.age=ageVal;

        if(Object.keys(utente).length>2){ //Attributi oggetto già presenti
            for(const chiave of Object.keys(utente)){
                if(chiave!=="name" && chiave!=="age" && chiave!=="role") bodyuno[chiave] = input_form.querySelector(`input[name="data-${chiave}-modifica"]`).value.trim();
                else if(attributo==="role") bodyuno.role=input_form.querySelector('input[name="role-modifica"]').value.trim();
            }
        }

        const nuoviCampi = input_form.querySelectorAll('.data-nuovo-modifica'); //dati nuovi inseriti 
        if(nuoviCampi.length>0 && nuoviCampi.length%2===0){
            for(let i=0; i<nuoviCampi.length;i+=2){
                bodyuno[nuoviCampi[i].value.trim()]=nuoviCampi[i+1].value.trim();
            }
        }


        fetch(`https://friendly-space-giggle-x5r5977xv7q426wqr-3000.app.github.dev/api/users/${utente.name}`, {
            method: 'PUT',
            headers: {
                'accept': '*/*',
                'Authorization': 'Bearer 5IDtoken',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyuno)
        })
        .then(resp => {
            if (!resp.ok) throw new Error('Errore nella modifica');
            return resp.json();
        })
        .then(()=> location.reload())
        .catch(err => console.error(err));
    };
}