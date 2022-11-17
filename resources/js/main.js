// This is just a sample app. You can structure your Neutralinojs app code as you wish.
// This example app is written with vanilla JavaScript and HTML.
// Feel free to use any frontend framework you like :)
// See more details: https://neutralino.js.org/docs/how-to/use-a-frontend-library

let commands;
async function initCommands(){
    commands = {
        checkVersion: {
            Darwin: "deno --version",
            Windows: "deno --version"
        },
        downloadAndInstall: {
            Darwin: "curl -fsSL https://deno.land/x/install/install.sh | sh",
            Windows: "powershell -command \"irm https://deno.land/install.ps1 | iex\""
        },
        postInstall: {
            Darwin: "echo export DENO_INSTALL=\"/Users/" + await Neutralino.os.getEnv('USER') + "/.deno\" >> $HOME/.zshrc && echo export PATH=\"\\$DENO_INSTALL/bin:\\$PATH\" >> $HOME/.zshrc",
            Windows: "setx /M path \"%path%;C:\\Users\\" +  await Neutralino.os.getEnv('USER') + "\\.deno\\bin\\deno.exe\""
        }
    }
}

function getCommand(cmd){
    const osCommands = commands[cmd];

    if(!osCommands)
        throw Error(`Unknown command: ${cmd}`);

    const specificCommand = osCommands[NL_OS];

    if(!specificCommand)
        throw Error(`Command not implemented for OS: ${cmd} [${NL_OS}]`);

    return specificCommand;
}

async function showInfo() {
    fetch("https://api.github.com/repos/denoland/deno/releases/latest")
        .then(res => res.json())
        .then(latestRelease => {
            document.querySelector("#latest-version").innerHTML = `Latest Version: ${latestRelease.tag_name}`;
        });

    const test = await Neutralino.os.execCommand(getCommand("checkVersion"), {});
    console.log(test)
    document.getElementById("is-install").innerHTML = test.stdOut
        ? "✅"
        : "❌";

    document.querySelector("#version").innerHTML = `<div style="text-align: left; margin: 0 auto; max-width: 400px; margin-top: 24px">Installed Version: <pre>${test.stdOut}</pre></div>`
}

function denoInstall(){
    return new Promise(async resolve => {
        let nodeProc = await Neutralino.os.spawnProcess(getCommand("downloadAndInstall"));

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

async function shouldProcessWithPostInstall(){
    if(NL_OS === "Darwin") {
        const zshrcContent = (await Neutralino.os.execCommand(`cat $HOME/.zshrc`, {})).stdOut;
        return !zshrcContent.match(/DENO_INSTALL=/g);
    }else if(NL_OS === "Windows"){
        const pathContent = (await Neutralino.os.execCommand(`path`, {})).stdOut;
        return !pathContent.match(/bin\\deno.exe/g)
    }

    return false;
}

async function installDeno(){
    console.log("Launching Deno Installation");
    await denoInstall();

    if(await shouldProcessWithPostInstall()) {
        await Neutralino.os.execCommand(getCommand("postInstall"), {});
    }

    await Neutralino.app.exit(0);
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

initCommands().then(showInfo)
