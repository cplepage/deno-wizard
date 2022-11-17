// This is just a sample app. You can structure your Neutralinojs app code as you wish.
// This example app is written with vanilla JavaScript and HTML.
// Feel free to use any frontend framework you like :)
// See more details: https://neutralino.js.org/docs/how-to/use-a-frontend-library

async function showInfo() {
    fetch("https://api.github.com/repos/denoland/deno/releases/latest")
        .then(res => res.json())
        .then(latestRelease => {
            document.querySelector("#latest-version").innerHTML = `Latest Version: ${latestRelease.tag_name}`;
        })

    const test = await Neutralino.os.execCommand("source ~/.zshrc && deno --version", {});
    console.log(test)
    console.log(await Neutralino.os.execCommand(" echo $PATH", {}));
    console.log(await Neutralino.os.execCommand("echo $USER", {}));
    document.getElementById("is-install").innerHTML = test.stdOut
        ? "✅"
        : "❌";

    document.querySelector("#version").innerHTML = `<div style="text-align: left; margin: 0 auto; max-width: 400px; margin-top: 24px">Installed Version: <pre>${test.stdOut}</pre></div>`
}

function darwinDenoInstall(){
    return new Promise(async resolve => {
        let nodeProc = await Neutralino.os.spawnProcess("curl -fsSL https://deno.land/x/install/install.sh | sh");

        Neutralino.events.on('spawnedProcess', (evt) => {
            if(nodeProc.id === evt.detail.id) {
                switch(evt.detail.action) {
                    case 'stdOut':
                        document.querySelector("#logs").innerHTML += evt.detail.data;
                        break;
                    case 'stdErr':
                        document.querySelector("#logs").innerHTML += evt.detail.data;
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

    const zshrcContent = (await Neutralino.os.execCommand(`cat $HOME/.zshrc`, {})).stdOut;
    if(!zshrcContent.match(/DENO_INSTALL=/g)){
        const command = `echo export DENO_INSTALL="/Users/${await Neutralino.os.getEnv('USER')}/.deno" >> $HOME/.zshrc`;
        const command2 = `echo export PATH="\\$DENO_INSTALL/bin:\\$PATH" >> $HOME/.zshrc`;
        await Neutralino.os.execCommand(command, {});
        await Neutralino.os.execCommand(command2, {});
    }

    await Neutralino.app.restartProcess({});
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
