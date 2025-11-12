const urlBase = 'https://friendly-space-giggle-x5r5977xv7q426wqr-3000.app.github.dev/api';

//Inserimento carte
fetch(urlBase+"/users", {
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

        cloneCard.querySelector(".card-subtitle").textContent = user.role ? `Ruolo: ${user.role}` : "Ruolo: Schiaccia Dettagli";
        cloneCard.querySelector(".card-text").textContent = `Età: ${user.age}`;

        const btnElimina = document.createElement("button");
        btnElimina.className = "btn btn-danger me-2";
        btnElimina.textContent = "Elimina Utente";
        btnElimina.onclick = () => {
            if (confirm(`Sei sicuro di voler eliminare l'utente ${user.name}?`)) {
                eliminautente(user.name);
            }
        };
        cloneCard.querySelector(".card-footer").appendChild(btnElimina);

        const btnModifica = document.createElement("button");
        btnModifica.className = "btn btn-secondary me-2";
        btnModifica.textContent = "Modifica Utente";
        btnModifica.onclick = () => modificautente(user,cloneCard);
        cloneCard.querySelector(".card-footer").appendChild(btnModifica);

        const btnDettagli = document.createElement("button");
        btnDettagli.className = "btn btn-info";
        btnDettagli.textContent = "Dettagli Utente";
        btnDettagli.dataset.isdettagliata="false";
        btnDettagli.onclick = () => dettagliutente(user.name);
        cloneCard.querySelector(".card-footer").appendChild(btnDettagli);

        document.getElementById("contenitore").appendChild(templ);
    });
})
.catch(error => console.error('Errore:', error));
//Aggiornamento
setInterval(() => {
    fetch(urlBase+"/users", {
        headers: { 'accept': '*/*' }
    })
    .then(response => {
        if (!response.ok) throw new Error("Errore nella risposta");
        return response.json();
    }) .then(nuoviDati => {
        const ogg_appoggio=ottieniModifiche(nuoviDati);
        const modificati = ogg_appoggio.modificati;
        const cancellati = ogg_appoggio.cancellati;
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

                    cloneCard.querySelector(".card-subtitle").textContent = utenteModificato.role ? `Ruolo: ${utenteModificato.role}` : "Ruolo: Schiaccia Dettagli";
                    cloneCard.querySelector(".card-text").textContent = `Età: ${utenteModificato.age}`;

                    const btnElimina = document.createElement("button");
                    btnElimina.className = "btn btn-danger me-2";
                    btnElimina.textContent = "Elimina Utente";
                    btnElimina.onclick = () => {
                        if (confirm(`Sei sicuro di voler eliminare l'utente ${utenteModificato.name}?`)) {
                            eliminautente(utenteModificato.name);
                        }
                    };
                    cloneCard.querySelector(".card-footer").appendChild(btnElimina);

                    const btnModifica = document.createElement("button");
                    btnModifica.className = "btn btn-secondary me-2";
                    btnModifica.textContent = "Modifica Utente";
                    btnModifica.onclick = () => modificautente(utenteModificato,cloneCard);
                    cloneCard.querySelector(".card-footer").appendChild(btnModifica);

                    const btnDettagli = document.createElement("button");
                    btnDettagli.className = "btn btn-info";
                    btnDettagli.textContent = "Dettagli Utente";
                    btnDettagli.dataset.isdettagliata="false";
                    btnDettagli.onclick = () => dettagliutente(utenteModificato.name);
                    cloneCard.querySelector(".card-footer").appendChild(btnDettagli);

                    document.getElementById("contenitore").appendChild(temp);
            } else{
                carta.querySelector(".card-subtitle").textContent = utenteModificato.role ? `Ruolo: ${utenteModificato.role}` : "Ruolo: Non Presente";
                carta.querySelector(".card-text").textContent = `Età: ${utenteModificato.age}`;
                carta.dataset.isdettagliata='false';
                carta.classList.add('border-warning');
            } 
        }
        if(cancellati){
            for(const utenteCancellato of cancellati){
                let nomeutente=utenteCancellato.name;
                const carta=document.querySelector(`[data-user="${nomeutente}"]`);
                if(carta){
                    carta.remove();
                }
            }
        }
        if(cancellati || modificati){
            salvaConf(nuoviDati);
        }
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
    sessionStorage.setItem('config',JSON.stringify(config));
}

function ottieniConf(){
    if(sessionStorage.getItem('config')){
        return JSON.parse(sessionStorage.getItem('config'));
    } else {
        return [];
    }
}

function ottieniModifiche(nuovaConf) {
    let modificati = [];
    let rimossi = [];
    const conf = sessionStorage.getItem('config') ? JSON.parse(sessionStorage.getItem('config')) : [];

    for (const utNuovo of nuovaConf) {
        let vecchio;
        for (const utVecchio of conf) {
            if (utVecchio.name === utNuovo.name) {
                vecchio = utVecchio;
                break;
            }
        }
        if (!vecchio) modificati.push(utNuovo);
        else if (!oggettiUguali(vecchio, utNuovo)) modificati.push(utNuovo);
    }

    for (const utVecchio of conf) {
        let presente = false;
        for (const nuovo of nuovaConf) {
            if (nuovo.name === utVecchio.name) {
                presente = true;
                break;
            }
        }
        if (!presente) rimossi.push(utVecchio);
    }
    return { modificati, rimossi };
}

function oggettiUguali(ogg1, ogg2) {
    return ogg1.name === ogg2.name && ogg1.age === ogg2.age;
}



//funz su singolo
function dettagliutente(nomeutente) {
    const btnDettagli = document.querySelector(`.card[data-user="${nomeutente}"]`).querySelector(".btn.btn-info");
    if(btnDettagli.dataset.isdettagliata==="false"){
        fetch(urlBase+"/users"+`/${nomeutente}`, {
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
                        let testo = carta.querySelector(".card-text-2").innerHTML;
                        if(isUnOggetto(valore)){ //se è un oggetto annidato
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
            btnDettagli.dataset.isdettagliata="true";
            btnDettagli.innerHTML="Vedi Meno";
        })
        .catch(error => console.error('Errore:', error));
    }else{
        const carta = document.querySelector(`.card[data-user="${nomeutente}"]`);
        carta.querySelector(".card-text-2").innerHTML = "";
        btnDettagli.dataset.isdettagliata="false";
        btnDettagli.innerHTML="Dettagli Utente";
    }
}
function isUnOggetto(val){
    return Object.prototype.toString.call(val) === '[object Object]'; //richiedo prototipo forzando il this su val
}
function eliminautente(nomeutente) {
    fetch(urlBase+"/users"+`/${nomeutente}`, {
        method: 'DELETE',
        headers: { 'accept': '*/*', 'Authorization': 'Bearer 5IDtoken' }
    })
    .then(response => {
        if (!response.ok) {
            alert("Errore nell'eliminazione dell'utente");
            throw new Error("Errore nella risposta");
        }
        const carta = document.querySelector(`.card[data-user="${nomeutente}"]`);
        if (carta) carta.remove();
    })
    .catch(error => console.error('Errore:', error));
}
function modificautente(utenteNoDettaglio, carta) {
    fetch(urlBase+"/users"+`/${utenteNoDettaglio.name}`, {
        headers: { 'accept': '*/*' }
    })
    .then(response => {
        if (!response.ok) throw new Error("Errore nella risposta");
        return response.json();
    })
    .then(dataUtente=>{
        const utente=dataUtente;

        // Creo form modifica
        const templateform = document.getElementById("template-form").content.cloneNode(true);
        const form = templateform.querySelector('form');
        form.dataset.form_modifica = utente.name;

        const spazio_input = form.querySelector('.spazio_input');
        const inputName = spazio_input.querySelector(".template-name");
        inputName.value = utente.name;
        const inputEta = spazio_input.querySelector(".template-eta");
        inputEta.value = utente.age;

        const divRole = document.createElement("div");
        divRole.className = "mb-2";
        const labelRole = document.createElement("label");
        labelRole.className = "form-label small text-muted";
        labelRole.textContent = "Ruolo:";
        divRole.appendChild(labelRole);
        const inputRole = document.createElement("input");
        inputRole.type = "text";
        inputRole.value = utente.role || "";
        inputRole.required = true;
        inputRole.name = "role-modifica";
        inputRole.className = "form-control";
        divRole.appendChild(inputRole);
        spazio_input.appendChild(divRole);

        
        if (Object.keys(utente).length > 2) { 
            let cont = 1;
            for (const [chiave, valore] of Object.entries(utente)) {
                if (chiave !== "name" && chiave !== "age" && chiave !== "role") {
                    const div_contenitore = document.createElement("div");
                    div_contenitore.className = "card card-body bg-light mb-3 p-3 border-0 shadow-sm";
                    const labelCampo = document.createElement("h6");
                    labelCampo.className = "fw-semibold text-secondary mb-3";
                    labelCampo.textContent = `Campo ${cont++}`;
                    div_contenitore.appendChild(labelCampo);
                    const divChiave = document.createElement("div");
                    divChiave.className = "mb-2";
                    divChiave.innerHTML = `
                        <label class="form-label small text-muted">Chiave</label>
                        <input type="text" class="form-control" name="key-${chiave}-modifica"
                            value="${chiave}" required />
                    `;
                    div_contenitore.appendChild(divChiave);
                    if (isUnOggetto(valore)) {
                        for (const [subChiave, subValore] of Object.entries(valore)) {
                            const divSub = document.createElement("div");
                            divSub.className = "row g-2 align-items-center mb-2";

                            divSub.innerHTML = `
                                <div class="col-5">
                                    <input type="text" class="form-control form-control-sm"
                                        name="subkey-${chiave}-${subChiave}" placeholder="Sottochiave"
                                        value="${subChiave}" required />
                                </div>
                                <div class="col-5">
                                    <input type="text" class="form-control form-control-sm"
                                        name="subvalue-${chiave}-${subChiave}" placeholder="Sottovalore"
                                        value="${subValore}" required />
                                </div>
                                <div class="col-2 d-flex justify-content-end">
                                    <button type="button" class="btn btn-sm btn-outline-danger">X</button>
                                </div>
                            `;
                            divSub.querySelector("button").onclick = () => divSub.remove();
                            div_contenitore.appendChild(divSub);
                        }
                    } else {
                        const divValore = document.createElement("div");
                        divValore.className = "mb-2";
                        divValore.innerHTML = `
                            <label class="form-label small text-muted">Valore</label>
                            <input type="text" class="form-control" name="data-${chiave}-modifica"
                                value="${valore}" required />
                        `;
                        div_contenitore.appendChild(divValore);
                    }
                    const divBtnRemove = document.createElement("div");
                    divBtnRemove.className = "mt-2";
                    divBtnRemove.innerHTML = `
                        <button type="button" class="btn btn-sm btn-outline-danger">
                            Rimuovi campo
                        </button>
                    `;
                    divBtnRemove.querySelector("button").onclick = () => div_contenitore.remove();
                    div_contenitore.appendChild(divBtnRemove);

                    spazio_input.appendChild(div_contenitore);
                }
            }
        }


        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-outline-secondary mx-2';
        button.textContent = 'Aggiungi Parametro';
        button.onclick = () => {
            const div_contenitore = document.createElement("div");
            div_contenitore.className = "card card-body bg-light mb-3 p-3 border-0 shadow-sm";
            const labelCampo = document.createElement("h6");
            labelCampo.className = "fw-semibold text-secondary mb-3";
            div_contenitore.appendChild(labelCampo);
            const divChiave = document.createElement("div");
            divChiave.className = "mb-2";
            divChiave.innerHTML = `
                <label class="form-label small text-muted">Chiave</label>
                <input type="text" class="form-control data-nuovo-chiave" placeholder="Campo" required />
            `;
            div_contenitore.appendChild(divChiave);
            const divValore = document.createElement("div");
            divValore.className = "mb-2";
            divValore.innerHTML = `
                <label class="form-label small text-muted">Valore</label>
                <input type="text" class="form-control data-nuovo-valore" placeholder="Valore" required />
            `;
            div_contenitore.appendChild(divValore);
            const divBtnRemove = document.createElement("div");
            divBtnRemove.className = "mt-2";
            divBtnRemove.innerHTML = `
                <button type="button" class="btn btn-sm btn-outline-danger">
                    Rimuovi campo
                </button>
            `;
            divBtnRemove.querySelector("button").onclick = () => div_contenitore.remove();
            div_contenitore.appendChild(divBtnRemove);

            spazio_input.appendChild(div_contenitore);
        };


        const annulla = document.createElement('button');
        annulla.type = 'button';
        annulla.className = 'btn btn-secondary mx-2';
        annulla.textContent = 'Annulla Modifica';
        annulla.onclick = () => {
            const formEsistente = carta.querySelector('[data-form_modifica="' + utente.name + '"]');
            if (formEsistente) formEsistente.remove();
        };

        const bottoni_spazio = form.querySelector('.bottoni_spazio');
        bottoni_spazio.appendChild(annulla);
        bottoni_spazio.appendChild(button);

        carta.appendChild(templateform);

        const input_form = carta.querySelector('[data-form_modifica="' + utente.name + '"]').querySelector('.spazio_input'); // salvataggio modifica
        const btnModificaForm = bottoni_spazio.querySelector('.button-form');
        btnModificaForm.onclick = () => {
            const bodyuno = {
                name: input_form.querySelector('.template-name').value.trim(),
                age: input_form.querySelector('.template-eta').value,
                role: input_form.querySelector('input[name="role-modifica"]').value.trim()
            };

            const campiDiv = input_form.querySelectorAll('.card.card-body'); //ricavo tutti box grigini
            campiDiv.forEach(div => {
                const inputChiave = div.querySelector('input[name^="key-"]');
                if (!inputChiave) return;

                const chiave = inputChiave.value.trim();
                if (!chiave) return;

                const subDivs = div.querySelectorAll(':scope > div');
                if (subDivs.length > 0) {
                    bodyuno[chiave] = {};
                    subDivs.forEach(subDiv => {
                        const subChiaveInput = subDiv.querySelector('input[name^="subkey-"]');
                        const subValoreInput = subDiv.querySelector('input[name^="subvalue-"]');
                        if (subChiaveInput && subValoreInput) {
                            const subChiave = subChiaveInput.value.trim();
                            const subValore = subValoreInput.value.trim();
                            if (subChiave) bodyuno[chiave][subChiave] = subValore;
                        }
                    });
                } else {
                    const inputValore = div.querySelector('input[name^="data-"]');
                    if (inputValore) bodyuno[chiave] = inputValore.value.trim();
                }
            });

            const nuoviDiv = input_form.querySelectorAll('.card.card-body .data-nuovo-chiave');
            nuoviDiv.forEach(inputChiave => {
                let inputValore = null;
                const cardBody = inputChiave.closest('.card-body');
                if (cardBody) inputValore = cardBody.querySelector('.data-nuovo-valore');
                const chiave = inputChiave.value.trim();
                const valore = inputValore ? inputValore.value.trim() : "";
                if (chiave) bodyuno[chiave] = valore;
            });


            fetch(urlBase + "/users" + `/${utente.name}`, {
                method: 'PUT',
                headers: {
                    'accept': '*/*',
                    'Authorization': 'Bearer 5IDtoken',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyuno)
            })
            .then(resp => {
                if (resp.ok) {
                    const formEsistente = carta.querySelector('[data-form_modifica="' + utente.name + '"]');
                    if (formEsistente) formEsistente.remove();
                    return resp.json();
                } else throw new Error('Errore nella modifica');
            })
            .then(data => console.log('Modifica avvenuta:', data))
            .catch(err => console.error(err));
        };
    })
    .catch(error => console.error('Errore:', error));
}