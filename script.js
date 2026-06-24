let defaultSocialData = {

    "Regine": {
        "Facebook": [
            "April",
            "Craig",
            "Cresa",
            "Elmie",
            "Jenelyn",
            "Josefl",
            "Kelly Grace",
            "Kyrl",
            "Nylvia",
            "Phoeboy",
            "Row",
            "Steven",
            "Viel Son"
        ]
    },


    "April": {
        "Facebook": [
            "Regine",
            "Ariane",
            "Craig",
            "Daniel",
            "Kelly"
        ],
        "Instagram": [
            "Ariane",
            "Daniel"
        ],
        "TikTok": [
            "Kelly"
        ]
    },


    "Daniel": {
        "Facebook": [
            "April",
            "Nylvia",
            "Phoeboy"
        ],
        "Instagram": [
            "April"
        ],
        "TikTok": [
            "Kelly",
            "Viel"
        ]
    },


    "Ariane": {
        "Facebook": [
            "April"
        ],
        "Instagram": [
            "Daniel"
        ]
    },


    "Craig": {
        "Facebook": [
            "April",
            "Regine"
        ]
    },


    "Kelly": {
        "Facebook": [
            "April",
            "Nylvia"
        ],
        "TikTok": [
            "Daniel"
        ]
    },


    "Viel": {
        "Facebook": [
            "Mark"
        ],
        "TikTok": [
            "Daniel",
            "Vince"
        ]
    },


    "Adrian": {
        "Facebook": [
            "Dunavan",
            "Juhan"
        ]
    },


    "Althea": {
        "Facebook": [
            "Nylvia"
        ]
    },


    "Bin": {
        "Facebook": [
            "Adrian",
            "James",
            "Johan",
            "Mark"
        ]
    },


    "Cresa": {
        "Facebook": [
            "Regine",
            "Ivan"
        ]
    },


    "Dunavan": {
        "Facebook": [
            "Adrian"
        ]
    },


    "Elmie": {
        "Facebook": [
            "Regine"
        ]
    },


    "Gian": {
        "Facebook": [
            "Josefl"
        ]
    },


    "Ivan": {
        "Facebook": [
            "Cresa"
        ]
    },


    "James": {
        "Facebook": [
            "Bin"
        ]
    },


    "Jenelyn": {
        "Facebook": [
            "Regine",
            "Joshua"
        ]
    },


    "Josefl": {
        "Facebook": [
            "Regine",
            "Gian",
            "Mark"
        ]
    },


    "Johan": {
        "Facebook": [
            "Bin"
        ]
    },


    "Joshua": {
        "Facebook": [
            "Jenelyn"
        ]
    },


    "Juhan": {
        "Facebook": [
            "Adrian"
        ]
    },


    "Kelly": {
        "Facebook": [
            "Regine",
            "Nylvia",
            "Phoeboy",
            "Daniel"
        ]
    },


    "Kyrl": {
        "Facebook": [
            "Regine"
        ]
    },


    "Mark": {
        "Facebook": [
            "Bin"
        ]
    },


    "Mark": {
        "Facebook": [
            "Josefl",
            "Viel"
        ]
    },


    "Nylvia": {
        "Facebook": [
            "Regine",
            "Daniel",
            "Kelly",
            "Althea"
        ]
    },


    "Phoeboy": {
        "Facebook": [
            "Regine",
            "Daniel",
            "Nylvia"
        ]
    },


    "Row": {
        "Facebook": [
            "Regine"
        ]
    },


    "Steven": {
        "Facebook": [
            "Regine"
        ]
    },


    "Viel": {
        "Facebook": [
            "Regine"
        ]
    },


    "Vince": {
        "Facebook": [
            "Viel"
        ]
    },


    "Zeeshan": {
        "Facebook": [
            "Daniel",
            "Regine"
        ]
    }

};


let socialData =
    JSON.parse(localStorage.getItem("socialData"))
    || defaultSocialData;


let selectedNodeId = null;


const cy = cytoscape({

    container:document.getElementById("cy"),

    elements:[],

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
                "line-color":"#000"
            }
        },

        {
            selector:'edge[platform="X"]',
            style:{
                "line-color":"#777"
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

    ]

});


function makeId(name){

    return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g,"_");

}


function saveData(){

    localStorage.setItem(
        "socialData",
        JSON.stringify(socialData)
    );

    loadSocialFolders();

}


function addSocialConnection(){

    let person =
    document.getElementById("mainPerson").value.trim();

    let friend =
    document.getElementById("connectedPerson").value.trim();

    let platform =
    document.getElementById("platform").value;


    if(!person || !friend){

        alert("Complete the fields");

        return;

    }


    if(!socialData[person]){

        socialData[person] = {};

    }


    if(!socialData[person][platform]){

        socialData[person][platform] = [];

    }


    socialData[person][platform].push(friend);



    if(!socialData[friend]){

        socialData[friend] = {};

    }


    if(!socialData[friend][platform]){

        socialData[friend][platform] = [];

    }


    socialData[friend][platform].push(person);



    saveData();

    buildGraph(person);


    document.getElementById("mainPerson").value = "";

    document.getElementById("connectedPerson").value = "";

}



function buildGraph(person){


    cy.elements().remove();


    let nodes = new Map();

    let edges = [];


    nodes.set(

        makeId(person),

        {
            data:{
                id:makeId(person),
                label:person
            }
        }

    );


    for(let platform in socialData[person]){


        socialData[person][platform].forEach(friend=>{


            nodes.set(

                makeId(friend),

                {
                    data:{
                        id:makeId(friend),
                        label:friend
                    }
                }

            );


            edges.push({

                data:{

                    id:
                    makeId(person)+
                    makeId(friend)+
                    platform,


                    source:makeId(person),

                    target:makeId(friend),

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
        animate:true
    }).run();


    showDetails(person);

}

function applyVertexColoring(){

    let colors = [
        "#e74c3c",
        "#3498db",
        "#2ecc71",
        "#f1c40f",
        "#9b59b6",
        "#e67e22"
    ];

    cy.nodes().forEach(node=>{

        let usedColors = [];

        node.neighborhood("node").forEach(neighbor=>{

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


function showDetails(person){

    if(!socialData[person]){

        document.getElementById("details").innerHTML =
        "No saved data for " + person;

        return;

    }

    let html = `
        <h3>${person}</h3>
        <hr>
    `;

    for(let platform in socialData[person]){

        html += `<b>${platform}</b><br>`;

        socialData[person][platform].forEach(friend=>{

            html += `
                <div style="margin-bottom:10px;">
                    ${friend}<br>
                    <button class="remove"
                    onclick="removeConnection('${person}','${friend}','${platform}')">
                        Remove Connection
                    </button>
                </div>
            `;

        });

        html += "<hr>";

    }

    document.getElementById("details").innerHTML = html;

}


function removeConnection(person, friend, platform){

    socialData[person][platform] =
    socialData[person][platform].filter(name=>name !== friend);

    socialData[friend][platform] =
    socialData[friend][platform].filter(name=>name !== person);

    if(socialData[person][platform].length === 0){

        delete socialData[person][platform];

    }

    if(socialData[friend][platform].length === 0){

        delete socialData[friend][platform];

    }

    saveData();

    buildGraph(person);

}


function searchPerson(){

    let search =
    document.getElementById("searchName").value.trim();

    if(!search){

        alert("Enter a name");

        return;

    }

    let found = null;

    for(let person in socialData){

        if(person.toLowerCase() === search.toLowerCase()){

            found = person;

        }

    }

    if(!found){

        cy.elements().remove();

        document.getElementById("details").innerHTML =
        "Person not found: " + search;

        return;

    }

    buildGraph(found);

}


cy.on("tap", "node", function(evt){

    let node = evt.target;

    let name = node.data("label");


    if(selectedNodeId === node.id()){

        cy.nodes().removeClass("highlighted");

        selectedNodeId = null;

        document.getElementById("details").innerHTML =
        "Click a person to view connections.";

    }
    else{

        selectedNodeId = node.id();

        cy.nodes().removeClass("highlighted");

        node.addClass("highlighted");

        node.neighborhood("node").addClass("highlighted");

        showDetails(name);

    }

});


cy.on("tap", function(evt){

    if(evt.target === cy){

        cy.nodes().removeClass("highlighted");

        selectedNodeId = null;

    }

});


function toggleMenu(){

    let menu =
    document.getElementById("sideMenu");

    menu.style.display =
    menu.style.display === "block" ? "none" : "block";

}


function closeMenu(){

    document.getElementById("sideMenu").style.display =
    "none";

}


function toggleSocialFolder(){

    let folder =
    document.getElementById("socialFolder");

    let arrow =
    document.getElementById("folderArrow");

    if(folder.style.display === "block"){

        folder.style.display = "none";

        arrow.innerHTML = "▶";

    }
    else{

        folder.style.display = "block";

        arrow.innerHTML = "▼";

    }

}


function loadSocialFolders(){
    let folder = document.getElementById("socialFolder");
    folder.innerHTML = "";

    Object.keys(socialData).sort().forEach(person => {
        let row = document.createElement("div");
        row.className = "folder-row";

        let item = document.createElement("div");
        item.className = "folder folder-name";
        item.innerHTML = "📁 " + person + "'s Socials";

        item.onclick = function(){
            buildGraph(person);
            closeMenu();
        };

        let deleteButton = document.createElement("button");
        deleteButton.className = "delete-folder";
        deleteButton.innerHTML = "🗑️";

        deleteButton.onclick = function(event){
            event.stopPropagation();
            deletePerson(person);
        };

        row.appendChild(item);
        row.appendChild(deleteButton);
        folder.appendChild(row);
    });
}


function deletePerson(person){

    let confirmDelete =
    confirm("Delete " + person + "'s socials?");

    if(!confirmDelete){

        return;

    }

    delete socialData[person];

    for(let otherPerson in socialData){

        for(let platform in socialData[otherPerson]){

            socialData[otherPerson][platform] =
            socialData[otherPerson][platform]
            .filter(name=>name !== person);

        }

    }

    saveData();

    cy.elements().remove();

    document.getElementById("details").innerHTML =
    person + "'s socials deleted.";

}


function resetData(){

    let confirmReset =
    confirm("Reset all saved data?");

    if(!confirmReset){

        return;

    }

    localStorage.removeItem("socialData");

    socialData =
    JSON.parse(JSON.stringify(defaultSocialData));

    cy.elements().remove();

    loadSocialFolders();

    document.getElementById("details").innerHTML =
    "Default data loaded again.";

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
