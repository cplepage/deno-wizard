// This is just a sample app. You can structure your Neutralinojs app code as you wish.
// This example app is written with vanilla JavaScript and HTML.
// Feel free to use any frontend framework you like :)
// See more details: https://neutralino.js.org/docs/how-to/use-a-frontend-library

async function showInfo() {
    const test = await Neutralino.os.execCommand("deno --version", {});
    document.getElementById("is-install").innerHTML = test.stdOut
        ? "✅"
        : "❌";

    document.body.innerHTML += `<div style="text-align: left; margin: 0 auto; max-width: 400px; margin-top: 24px">Currrent Version: <pre>${test.stdOut}</pre></div>`
}

function darwinDenoInstall(){
    return new Promise(async resolve => {
        let nodeProc = await Neutralino.os.spawnProcess("curl -fsSL https://deno.land/x/install/install.sh | sh");

        Neutralino.events.on('spawnedProcess', (evt) => {
            if(nodeProc.id === evt.detail.id) {
                switch(evt.detail.action) {
                    case 'stdOut':
                        console.log(evt.detail.data); // 10
                        break;
                    case 'stdErr':
                        console.error(evt.detail.data);
                        break;
                    case 'exit':
                        resolve();
                        break;
                }
            }
        });
    })
}

async function installDeno(){
    console.log("Launching Deno Installation");
    await darwinDenoInstall();
    const command = `echo export DENO_INSTALL="/Users/${await Neutralino.os.getEnv('USER')}/.deno" >> $HOME/.zshrc`;
    const command2 = `echo export PATH="\\$DENO_INSTALL/bin:\\$PATH" >> $HOME/.zshrc`;
    await Neutralino.os.execCommand(command, {});
    await Neutralino.os.execCommand(command2, {});
}

function openDocs() {
    Neutralino.os.open("https://neutralino.js.org/docs");
}

function openTutorial() {
    Neutralino.os.open("https://www.youtube.com/watch?v=txDlNNsgSh8&list=PLvTbqpiPhQRb2xNQlwMs0uVV0IN8N-pKj");
}

function setTray() {
    if(NL_MODE != "window") {
        console.log("INFO: Tray menu is only available in the window mode.");
        return;
    }
    let tray = {
        icon: "/resources/icons/trayIcon.png",
        menuItems: [
            {id: "VERSION", text: "Get version"},
            {id: "SEP", text: "-"},
            {id: "QUIT", text: "Quit"}
        ]
    };
    Neutralino.os.setTray(tray);
}

function onTrayMenuItemClicked(event) {
    switch(event.detail.id) {
        case "VERSION":
            Neutralino.os.showMessageBox("Version information",
                `Neutralinojs server: v${NL_VERSION} | Neutralinojs client: v${NL_CVERSION}`);
            break;
        case "QUIT":
            Neutralino.app.exit();
            break;
    }
}

function onWindowClose() {
    Neutralino.app.exit();
}

Neutralino.init();
Neutralino.window.setTitle('Deno Wizard');

Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
Neutralino.events.on("windowClose", onWindowClose);

if(NL_OS != "Darwin") { // TODO: Fix https://github.com/neutralinojs/neutralinojs/issues/615
    setTray();
}

showInfo();
