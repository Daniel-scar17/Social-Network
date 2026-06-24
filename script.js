let defaultSocialData = {

    "April": {
        "Facebook": [
            "Arianne",
            "Craig",
            "Daniel",
            "Kelly",
            "Viel"
        ],
        "TikTok": [
            "Daniel",
            "Kelly"
        ],
        "X": [
            "Craig"
        ]
    },

    "Arianne": {
        "Facebook": [
            "April"
        ],
        "Instagram": [
            "Daniel"
        ],
        "TikTok": [
            "Viel"
        ]
    },

    "Craig": {
        "Facebook": [
            "April"
        ],
        "X": [
            "April",
            "Kelly"
        ]
    },

    "Daniel": {
        "Facebook": [
            "April"
        ],
        "Instagram": [
            "Arianne"
        ],
        "TikTok": [
            "April",
            "Viel"
        ]
    },

    "Kelly": {
        "Facebook": [
            "April"
        ],
        "TikTok": [
            "April"
        ],
        "X": [
            "Craig"
        ]
    },

    "Viel": {
        "Facebook": [
            "April"
        ],
        "TikTok": [
            "Daniel",
            "Arianne"
        ]
    }

};

let socialData =
    JSON.parse(localStorage.getItem("socialData"))
    || defaultSocialData;

let currentPerson = null;
let selectedNodeId = null;

const cy = cytoscape({
    container: document.getElementById("cy"),
    elements: [],

    style:[
        {
            selector:"node",
            style:{
                "background-color":"data(color)",
                "label":"data(label)",
                "text-valign":"center",
                "text-halign":"center",
                "color":"#222",
                "width":65,
                "height":65
            }
        },
        {
            selector:"edge",
            style:{
                "width":5,
                "curve-style":"bezier",
                "line-color":"#ccc"
            }
        },
        {
            selector:'edge[platform="Facebook"]',
            style:{
                "line-color":"#1877F2"
            }
        },
        {
            selector:'edge[platform="Instagram"]',
            style:{
                "line-color":"#C13584"
            }
        },
        {
            selector:'edge[platform="TikTok"]',
            style:{
                "line-color":"#000000"
            }
        },
        {
            selector:'edge[platform="X"]',
            style:{
                "line-color":"#666666"
            }
        },
        {
            selector:"node.highlighted",
            style:{
                "background-color":"#2ecc71",
                "border-width":4,
                "border-color":"#27ae60"
            }
        }
    ],

    layout:{
        name:"cose",
        animate:true,
        padding:50
    }
});

function makeId(name){
    return name.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
}

function saveData(){
    localStorage.setItem("socialData", JSON.stringify(socialData));
    loadSocialFolders();
    alert("Data saved.");
}

function addSocialConnection(){
    const mainPerson =
        document.getElementById("mainPerson").value.trim();

    const connectedPerson =
        document.getElementById("connectedPerson").value.trim();

    const platform =
        document.getElementById("platform").value;

    if(!mainPerson || !connectedPerson){
        alert("Enter main person and connected person.");
        return;
    }

    if(mainPerson.toLowerCase() === connectedPerson.toLowerCase()){
        alert("A person cannot connect to themselves.");
        return;
    }

    if(!socialData[mainPerson]){
        socialData[mainPerson] = {};
    }

    if(!socialData[mainPerson][platform]){
        socialData[mainPerson][platform] = [];
    }

    if(!socialData[mainPerson][platform].includes(connectedPerson)){
        socialData[mainPerson][platform].push(connectedPerson);
    }

    if(!socialData[connectedPerson]){
        socialData[connectedPerson] = {};
    }

    if(!socialData[connectedPerson][platform]){
        socialData[connectedPerson][platform] = [];
    }

    if(!socialData[connectedPerson][platform].includes(mainPerson)){
        socialData[connectedPerson][platform].push(mainPerson);
    }

    currentPerson = mainPerson;

    saveData();
    buildGraph(mainPerson);

    document.getElementById("mainPerson").value = "";
    document.getElementById("connectedPerson").value = "";
}

function buildGraph(personName){
    cy.elements().remove();

    if(!socialData[personName]){
        document.getElementById("details").innerHTML =
            "No saved data for " + personName;
        return;
    }

    const nodes = new Map();
    const edges = [];

    nodes.set(makeId(personName), {
        data:{
            id:makeId(personName),
            label:personName
        }
    });

    const platforms = socialData[personName];

    for(let platform in platforms){

        platforms[platform].forEach(connection => {

            nodes.set(makeId(connection), {
                data:{
                    id:makeId(connection),
                    label:connection
                }
            });

            edges.push({
                data:{
                    id:
                        makeId(personName) + "_" +
                        makeId(connection) + "_" +
                        platform,

                    source:makeId(personName),
                    target:makeId(connection),
                    platform:platform
                }
            });

        });

    }

    cy.add([
        ...nodes.values(),
        ...edges
    ]);

    applyVertexColoring();

    cy.layout({
        name:"cose",
        animate:true,
        padding:50
    }).run();

    showPersonDetails(personName);
}

function applyVertexColoring(){
    const colors = [
        "#e74c3c",
        "#3498db",
        "#2ecc71",
        "#f1c40f",
        "#9b59b6",
        "#e67e22"
    ];

    cy.nodes().forEach(node => {
        let usedColors = [];

        node.neighborhood("node").forEach(neighbor => {
            if(neighbor.data("color")){
                usedColors.push(neighbor.data("color"));
            }
        });

        for(let color of colors){
            if(!usedColors.includes(color)){
                node.data("color", color);
                break;
            }
        }
    });
}

function showPersonDetails(personName){
    const data = socialData[personName];

    if(!data){
        document.getElementById("details").innerHTML =
            "No saved data for " + personName;
        return;
    }

    let totalConnections = 0;

    for(let platform in data){
        totalConnections += data[platform].length;
    }

    let html = `
        <h3>${personName}</h3>
        Direct Connections: ${totalConnections}
        <hr>
    `;

    for(let platform in data){

        html += `<b>${platform}</b><br>`;

        data[platform].forEach(connection => {
            html += `
                <div style="margin-bottom:10px;">
                    ${connection}
                    <br>
                    <button class="remove"
                    onclick="removeConnection('${personName}', '${connection}', '${platform}')">
                        Remove Connection
                    </button>
                </div>
            `;
        });

        html += "<hr>";
    }

    document.getElementById("details").innerHTML = html;
}

function removeConnection(person, connection, platform){

    if(socialData[person] && socialData[person][platform]){
        socialData[person][platform] =
            socialData[person][platform].filter(name => name !== connection);

        if(socialData[person][platform].length === 0){
            delete socialData[person][platform];
        }
    }

    if(socialData[connection] && socialData[connection][platform]){
        socialData[connection][platform] =
            socialData[connection][platform].filter(name => name !== person);

        if(socialData[connection][platform].length === 0){
            delete socialData[connection][platform];
        }
    }

    saveData();
    buildGraph(person);
}

function searchPerson(){
    const searchValue =
        document.getElementById("searchName").value.trim();

    if(!searchValue){
        alert("Enter a name.");
        return;
    }

    let foundName = null;

    for(let person in socialData){
        if(person.toLowerCase() === searchValue.toLowerCase()){
            foundName = person;
            break;
        }
    }

    if(!foundName){
        cy.elements().remove();

        document.getElementById("details").innerHTML =
            "Person not found: " + searchValue;

        return;
    }

    currentPerson = foundName;

    buildGraph(foundName);
}

cy.on("tap", "node", function(evt){

    const node = evt.target;
    const name = node.data("label");

    if(selectedNodeId === node.id()){

        cy.nodes().removeClass("highlighted");

        selectedNodeId = null;

        document.getElementById("details").innerHTML =
            "Click a person to view connections.";

    }else{

        selectedNodeId = node.id();

        cy.nodes().removeClass("highlighted");

        node.addClass("highlighted");

        node.neighborhood("node").addClass("highlighted");

        showPersonDetails(name);

    }

});

cy.on("tap", function(evt){

    if(evt.target === cy){

        cy.nodes().removeClass("highlighted");

        selectedNodeId = null;

    }

});

function toggleMenu(){
    const menu =
        document.getElementById("sideMenu");

    menu.style.display =
        menu.style.display === "block"
        ? "none"
        : "block";
}

function closeMenu(){
    document.getElementById("sideMenu").style.display =
        "none";
}

function toggleSocialFolder(){
    const folder =
        document.getElementById("socialFolder");

    const arrow =
        document.getElementById("folderArrow");

    if(folder.style.display === "block"){
        folder.style.display = "none";
        arrow.innerHTML = "▶";
    }else{
        folder.style.display = "block";
        arrow.innerHTML = "▼";
    }
}

function loadSocialFolders(){
    const folder =
        document.getElementById("socialFolder");

    folder.innerHTML = "";

    Object.keys(socialData).forEach(person => {

        const row =
            document.createElement("div");

        row.className = "folder-row";

        const item =
            document.createElement("div");

        item.className = "folder folder-name";

        item.innerHTML =
            "📁 " + person + "'s Socials";

        item.onclick = function(){
            currentPerson = person;
            buildGraph(person);
            closeMenu();
        };

        const deleteBtn =
            document.createElement("button");

        deleteBtn.className = "delete-folder";

        deleteBtn.innerHTML = "🗑️";

        deleteBtn.onclick = function(event){
            event.stopPropagation();
            deletePersonData(person);
        };

        row.appendChild(item);
        row.appendChild(deleteBtn);
        folder.appendChild(row);

    });
}

function deletePersonData(person){
    const confirmDelete =
        confirm("Delete " + person + "'s saved socials?");

    if(!confirmDelete){
        return;
    }

    delete socialData[person];

    for(let otherPerson in socialData){

        for(let platform in socialData[otherPerson]){

            socialData[otherPerson][platform] =
                socialData[otherPerson][platform]
                .filter(name => name !== person);

            if(socialData[otherPerson][platform].length === 0){
                delete socialData[otherPerson][platform];
            }

        }

    }

    saveData();

    cy.elements().remove();

    document.getElementById("details").innerHTML =
        person + "'s socials deleted.";
}

function resetData(){
    const confirmReset =
        confirm("Reset all saved data and load the default people?");

    if(!confirmReset){
        return;
    }

    localStorage.removeItem("socialData");

    socialData =
        JSON.parse(JSON.stringify(defaultSocialData));

    cy.elements().remove();

    loadSocialFolders();

    document.getElementById("details").innerHTML =
        "Default data loaded again. Search a person or open a saved social folder.";

    alert("Data reset successfully.");
}

function clearSearchText(){
    document.getElementById("searchName").value = "";

    document.getElementById("clearSearch").style.display =
        "none";
}

document.getElementById("searchName")
.addEventListener("input", function(){

    document.getElementById("clearSearch").style.display =
        this.value.length > 0 ? "block" : "none";

});

document.getElementById("searchName")
.addEventListener("keydown", function(event){

    if(event.key === "Enter"){
        searchPerson();
    }

});

loadSocialFolders();

document.getElementById("details").innerHTML =
    "Search a person or open a saved social folder.";
