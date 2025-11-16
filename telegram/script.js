const token = 'seeeeeee';
const url_api_tg = `https://api.telegram.org/bot${token}`;
let ultimo_offset=-1;

const getMebtn = document.getElementById('getMeBtn');
const getMerisposta = document.getElementById('getMeResponse');

const sendMessagebtn = document.getElementById('sendMessageBtn');
const sendMessageLinkbtn = document.getElementById('sendMessageLinkBtn');
const sendMessagerisposta = document.getElementById('sendMessageResponse');

const idchat = document.getElementById('chatId');
const testoMessaggio = document.getElementById('messageText');
const selettoreFormattazione = document.getElementById('parseMode');
const bottoniemoji = document.querySelectorAll('.emoji-btn');
const testoLink=document.getElementById('linkText');

const idchat2 = document.getElementById('chatId2');
const testoMessaggio2 = document.getElementById('messageText2');
const fileInput=document.getElementById('documentoFile');
const sendDocumentbtn = document.getElementById('sendDocumentBtn');
const sendDocumentRisposta = document.getElementById('sendDocumentResponse');

const getUpdatesbtn = document.getElementById('getUpdatesBtn');
const getUpdatesrisposta = document.getElementById('getUpdatesResponse');

const dbUser = document.getElementById('dbUser');

//GET ME -> https://core.telegram.org/bots/api#getme
getMebtn.addEventListener('click', () => {
    getMerisposta.textContent = 'Caricamento...';
    fetch(`${url_api_tg}/getMe`)
    .then((response) => {
        console.log(response);
        return response.json();
    })
    .then((data) => {
        getMerisposta.textContent = JSON.stringify(data, null, 2);
    })
    .catch(error =>getMerisposta.textContent ='Errore: '+error.message);
});

// sendMessage -> https://core.telegram.org/bots/api#sendmessage
sendMessagebtn.addEventListener('click', () => {
    const chatId = idchat.value;
    const testo = testoMessaggio.value;
    const modFormattazione = selettoreFormattazione.value;
    
    if (!chatId || !testo) {
        sendMessagerisposta.textContent = 'Inserisci Chat ID, testo del messaggio e se vuoi seleziona la modalità di formattazione';
        return;
    }
    const bodyRichiesta = {
        chat_id: chatId,
        text: testo
    };
    if(modFormattazione) bodyRichiesta.parse_mode=modFormattazione; //opzionale in teoria
    
    fetch(`${url_api_tg}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyRichiesta)
    })
    .then((response)=>{
        console.log(response);
        return response.json();
    })
    .then((data)=>{
        sendMessagerisposta.textContent=JSON.stringify(data,null,2); //in teoria la risposta è la copia del mess inviato
    })
    .catch(error =>sendMessagerisposta.textContent ='Errore: '+error.message)
});

//sendMessage con link -> https://core.telegram.org/bots/api#inlinekeyboardmarkup
sendMessageLinkbtn.addEventListener('click', () => {
    const chatId = idchat.value;
    const testo = testoMessaggio.value;

    const links = testoLink.value; //json inserito dall'utente
    console.log(links);
    const linksOgg=JSON.parse(links); //array di array convertito da json
    console.log(linksOgg);
    
    if (!chatId || !testo || !links) {
        sendMessagerisposta.textContent = 'Inserisci Chat ID, testo del messaggio e il link.';
        return;
    }
    if(!Array.isArray(linksOgg)) {
        sendMessagerisposta.textContent = 'Ricontrolla la formattazione dei link.';
        return;
    }

    const bodyRichiesta = {
        chat_id: chatId,
        text: testo,
        reply_markup:{
            inline_keyboard:linksOgg
        }
    };
    
    fetch(`${url_api_tg}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyRichiesta)
    })
    .then((response)=>{
        console.log(response);
        return response.json();
    })
    .then((data)=>{
        sendMessagerisposta.textContent=JSON.stringify(data,null,2); //in teoria la risposta è la copia del mess inviato
    })
    .catch(error =>sendMessagerisposta.textContent ='Errore: '+error.message)
});

bottoniemoji.forEach(btn => {
    btn.addEventListener('click', () => {
        testoMessaggio.value += btn.getAttribute('data-emoji');
    });
});

//sendDocument -> https://core.telegram.org/bots/api#senddocument
sendDocumentbtn.addEventListener('click', () => {
    const chatId = idchat2.value;
    const testo = testoMessaggio2.value;
    const file = fileInput.files[0]; //solo un file per comodità
    
    if (!chatId || !file) {
        sendDocumentRisposta.textContent = 'ERRORE: Inserisci Chat ID e seleziona un File.';
        return;
    }

    const formData = new FormData();
    formData.append('chat_id', chatId);
    if (testo) {
        formData.append('caption', testo);
    }
    formData.append('document', file);
    
    let testoformData="";
    for (const [chiave, valore] of formData.entries()) {
        if (valore instanceof File) {
            testoformData=testoformData+`\n[FILE] Chiave: ${chiave}`;
            testoformData=testoformData+`\n       Nome: ${valore.name}`;
            testoformData=testoformData+`\n       Tipo: ${valore.type}`;
            testoformData=testoformData+`\n       Dimensione: ${valore.size} bytes`;
        } else testoformData=testoformData+`\nChiave: ${chiave}, Valore: ${valore}`;
    }

    sendDocumentRisposta.textContent = "File inviato in formato multipart/form-data\n" + testoformData;
    
    fetch(`${url_api_tg}/sendDocument`, {
        method: 'POST',
        body: formData 
    })
    .then((response) => {return response.json();})
    .then((data) => {
        let testo=sendDocumentRisposta.textContent;
        sendDocumentRisposta.textContent = testo+"\n\n Risposta API con ID file per recupero più facile:\n"+JSON.stringify(data, null, 2); //in teoria la risposta è la copia del mess inviato
    })
    .catch(error => sendDocumentRisposta.textContent = 'Errore: ' + error.message);
});

//getUpdates -> https://core.telegram.org/bots/api#getupdates
getUpdatesbtn.addEventListener('click',()=>{
    getUpdatesrisposta.textContent = 'Caricamento...';
    let url2="/getUpdates";
    if(ultimo_offset!==-1)  url2=url2+"?offset="+ultimo_offset;

    fetch(`${url_api_tg}${url2}`)
    .then((response) => {
        console.log(response);
        return response.json();
    })
    .then((data) => {
        if(data.result.length>0){
            console.log("Vecchio Ultimo offset: "+ultimo_offset);
            data.result.forEach((oggUpdate)=>{
                ultimo_offset=oggUpdate.update_id;
            });
            ultimo_offset++;
            console.log("Nuovo Ultimo offset: "+ultimo_offset);
        }
        getUpdatesrisposta.textContent = JSON.stringify(data, null, 2);
    })
    .catch(error =>getUpdatesrisposta.textContent ='Errore: '+error.message);
})



//Simulo il polling 
setInterval(()=>{
    console.log("GIROOOOO");
    let url2="/getUpdates";
    if(ultimo_offset!==-1)  url2=url2+"?offset="+ultimo_offset;

    fetch(`${url_api_tg}${url2}`)
    .then(response => {return response.json();})
    .then(data => {
        if (data.result.length > 0) {
            data.result.forEach(oggUpdate => {
                ultimo_offset=oggUpdate.update_id; 
                
                if (oggUpdate.message && oggUpdate.message.text) {
                    const message = oggUpdate.message;
                    const chatId = message.chat.id;
                    const testo = message.text.toLowerCase().trim();
                    const userId = message.from.id;
                    const nome = message.from.first_name || 'Amico';
                    
                    const isNuovoUtente = salvaUtente(userId, nome);
                    
                    if (testo === '/start') {
                        if (isNuovoUtente) {
                            inviaMessaggio(chatId, `🎉 <b>Benvenuto, ${nome}!</b> Sei un nuovo utente. La tua interazione è stata salvata.`, 'HTML');
                        } else {
                            inviaMessaggio(chatId, `👋 Ciao di nuovo, <b>${nome}</b>! Sei già nel nostro sistema.`, 'HTML');
                        }
                    } else if (testo === '/ciaociao') {
                        inviaMessaggio(chatId, `😭 Addio, <b>${nome}</b>! Spero di sentirti presto.`, 'HTML');
                    } else {
                        const testoPulito = testo.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        inviaMessaggio(chatId, `Non capisco il comando <code>"${testoPulito}"</code>. Prova /start o /ciaociao.`, 'HTML');
                    }
                }
            });  
            ultimo_offset++;      
        } 
    })
    .catch(error => {
        console.error('Errore nel ciclo di polling:', error.message);
    });
},5000);
function inviaMessaggio(chatId, text, parseMode = 'HTML') {
    const bodyRichiesta = {
        chat_id: chatId,
        text: text,
        parse_mode: parseMode
    };

    fetch(`${url_api_tg}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyRichiesta)
    })
    .then(response => response.json())
    .then(data => console.log('Risposta inviata:', data))
    .catch(error => console.error('Errore invio messaggio:', error));
}

// "DB" Utenti simulato tramite localStorage
const DB_KEY = 'telegram_bot_users';
function salvaUtente(userId, nome) {
    let utenti = JSON.parse(localStorage.getItem(DB_KEY) || '{}');
    dbUser.textContent=JSON.stringify(utenti,null,2);
    if (!utenti[userId]) {
        utenti[userId] = { 
            first_name: nome, 
            joined_at: new Date().toISOString() 
        };
        localStorage.setItem(DB_KEY, JSON.stringify(utenti));
        return true;
    }
    return false; 
}