let currentGraph = localStorage.getItem("currentGraph") || "Daniel Lago's Socials";
let isSearchMode = false;

function makeId(name){
    return name.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
}

function getGraphKey(name){
    return "graph_" + name;
}

function getGraphNames(){
    let graphs = JSON.parse(localStorage.getItem("graphNames"));

    if(!graphs){
        graphs = ["Daniel Lago's Socials"];
        localStorage.setItem("graphNames", JSON.stringify(graphs));
    }

    return graphs;
}

const defaultData = [
    { data:{ id:'daniel_lago', label:'Daniel Lago', type:'user' } },
    { data:{ id:'john_cruz', label:'John Cruz' } },
    { data:{ id:'jade_cristian', label:'Jade Cristian' } },

    { data:{ id:'e1', source:'daniel_lago', target:'john_cruz', platform:'Facebook' } },
    { data:{ id:'e2', source:'daniel_lago', target:'jade_cristian', platform:'Instagram' } }
];

let networkData = [];

const cy = cytoscape({
    container: document.getElementById('cy'),
    elements: networkData,

    style:[
        {
            selector:'node',
            style:{
                'background-color':'#4a90e2',
                'label':'data(label)',
                'text-valign':'center',
                'text-halign':'center',
                'color':'#222',
                'width':65,
                'height':65
            }
        },
        {
            selector:'node[type="user"]',
            style:{
                'background-color':'#e67e22',
                'width':80,
                'height':80,
                'font-weight':'bold'
            }
        },
        {
            selector:'edge',
            style:{
                'width':5,
                'curve-style':'bezier'
            }
        },
        {
            selector:'edge[platform="Facebook"]',
            style:{ 'line-color':'#1877F2' }
        },
        {
            selector:'edge[platform="Instagram"]',
            style:{ 'line-color':'#C13584' }
        },
        {
            selector:'edge[platform="TikTok"]',
            style:{ 'line-color':'#000000' }
        },
        {
            selector:'edge[platform="X"]',
            style:{ 'line-color':'#666666' }
        },
        {
            selector:'node.highlighted',
            style:{
                'background-color':'#2ecc71',
                'border-width':4,
                'border-color':'#27ae60'
            }
        },
        {
            selector:'edge.highlighted',
            style:{
                'width':8
            }
        }
    ],

    layout:{
        name:'cose',
        animate:true,
        padding:50
    }
});

let selectedNodeId = null;

cy.on('tap','node',function(evt){
    const node = evt.target;
    if(selectedNodeId === node.id()){
        cy.elements().removeClass('highlighted');
        selectedNodeId = null;
        document.getElementById('details').innerHTML =
            "Click a person to view connections.";
    }
    else{
        selectedNodeId = node.id();
        showNodeDetails(node);
    }
});

cy.on('tap',function(evt){
    if(evt.target === cy){
        cy.elements().removeClass('highlighted');
        selectedNodeId = null;
        document.getElementById('details').innerHTML =
            "Click a person to view connections.";
    }
});

function showNodeDetails(node){
    cy.elements().removeClass('highlighted');

    node.addClass('highlighted');
    node.connectedEdges().addClass('highlighted');
    node.neighborhood('node').addClass('highlighted');

    let connectionList = "";

    node.connectedEdges().forEach(edge => {
        const otherPerson =
            edge.source().id() === node.id()
            ? edge.target().data('label')
            : edge.source().data('label');

        connectionList += `
            <div>
                <b>${otherPerson}</b><br>
                Platform: ${edge.data('platform')}<br>

                <button class="remove" onclick="removeConnection('${edge.id()}')">
                    Remove Connection
                </button>
            </div>
            <hr>
        `;
    });

    document.getElementById('details').innerHTML = `
        <h3>${node.data('label')}</h3>
        Direct Connections: ${node.degree()}
        <hr>
        ${connectionList || "No connections found."}
    `;
}

function addConnection(){
    if(isSearchMode){
        openFullCurrentGraph();
    }

    const p1 = document.getElementById('person1').value.trim();
    const p2 = document.getElementById('person2').value.trim();
    const platform = document.getElementById('platform').value;

    if(!p1 || !p2){
        alert("Enter both names.");
        return;
    }

    const id1 = makeId(p1);
    const id2 = makeId(p2);

    if(id1 === id2){
        alert("You cannot connect the same person to themselves.");
        return;
    }

    if(cy.getElementById(id1).length === 0){
        cy.add({
            group:'nodes',
            data:{ id:id1, label:p1 }
        });
    }

    if(cy.getElementById(id2).length === 0){
        cy.add({
            group:'nodes',
            data:{ id:id2, label:p2 }
        });
    }

    cy.add({
        group:'edges',
        data:{
            id:'edge_' + Date.now(),
            source:id1,
            target:id2,
            platform:platform
        }
    });

    runLayout();
    saveCurrentGraph();

    document.getElementById('person1').value = "";
    document.getElementById('person2').value = "";
}

function removeConnection(edgeId){
    if(isSearchMode){
        openFullCurrentGraph();
    }

    const edge = cy.getElementById(edgeId);

    if(edge.length > 0){
        const sourceNode = edge.source();
        const targetNode = edge.target();

        edge.remove();

        if(sourceNode.degree() === 0 && sourceNode.data('type') !== 'user'){
            sourceNode.remove();
        }

        if(targetNode.degree() === 0 && targetNode.data('type') !== 'user'){
            targetNode.remove();
        }
    }

    runLayout();
    saveCurrentGraph();

    document.getElementById('details').innerHTML =
        "Connection removed.";
}

function searchPerson(){
    const searchValue = document.getElementById("searchName").value.trim();

    if(!searchValue){
        alert("Enter a name to search.");
        return;
    }

    const searchId = makeId(searchValue);
    const graphs = getGraphNames();

    for(let graphName of graphs){
        const savedGraph = localStorage.getItem(getGraphKey(graphName));

        if(!savedGraph){
            continue;
        }

        const data = JSON.parse(savedGraph);

        const foundNode = data.find(item =>
            item.data.id === searchId && !item.data.source
        );

        if(foundNode){
            currentGraph = graphName;
            localStorage.setItem("currentGraph", currentGraph);

            const connectedEdges = data.filter(item =>
                item.data.source === searchId ||
                item.data.target === searchId
            );

            const connectedNodeIds = new Set();
            connectedNodeIds.add(searchId);

            connectedEdges.forEach(edge => {
                connectedNodeIds.add(edge.data.source);
                connectedNodeIds.add(edge.data.target);
            });

            const connectedNodes = data.filter(item =>
                !item.data.source && connectedNodeIds.has(item.data.id)
            );

            cy.elements().remove();
            cy.add([...connectedNodes, ...connectedEdges]);

            isSearchMode = true;

            loadGraphList();
            runLayout();

            const node = cy.getElementById(searchId);

            cy.elements().removeClass("highlighted");

            node.addClass("highlighted");
            node.connectedEdges().addClass("highlighted");
            node.neighborhood("node").addClass("highlighted");

            cy.animate({
                center: { eles: node },
                zoom: 1.5
            }, {
                duration: 700
            });

            showNodeDetails(node);
            return;
        }
    }

    cy.elements().remove();

    document.getElementById("details").innerHTML =
        "Person not found in any saved graph: " + searchValue;
}

function openFullCurrentGraph(){
    const savedGraph = localStorage.getItem(getGraphKey(currentGraph));

    if(savedGraph){
        cy.elements().remove();
        cy.add(JSON.parse(savedGraph));
        runLayout();
    }

    isSearchMode = false;
}

function runLayout(){
    cy.layout({
        name:'cose',
        animate:true,
        padding:50
    }).run();
}

function saveCurrentGraph(){
    if(isSearchMode){
        return;
    }

    if(cy.elements().length === 0){
        return;
    }

    localStorage.setItem(
        getGraphKey(currentGraph),
        JSON.stringify(cy.elements().jsons())
    );
}

function saveData(){
    if(isSearchMode){
        openFullCurrentGraph();
    }

    saveCurrentGraph();
    alert(currentGraph + " saved.");
}

function createGraph(){
    if(isSearchMode){
        openFullCurrentGraph();
    }

    let name = document.getElementById("graphName").value.trim();

    if(!name){
        alert("Enter a graph name.");
        return;
    }

    if(!name.toLowerCase().includes("socials")){
        name = name + "'s Socials";
    }

    let graphs = getGraphNames();

    if(graphs.includes(name)){
        alert("Graph already exists.");
        return;
    }

    saveCurrentGraph();

    graphs.push(name);
    localStorage.setItem("graphNames", JSON.stringify(graphs));

    currentGraph = name;
    localStorage.setItem("currentGraph", currentGraph);

    cy.elements().remove();

    const personName = name.replace("'s Socials", "");

    cy.add([
        {
            data:{
                id: makeId(personName),
                label: personName,
                type: "user"
            }
        }
    ]);

    isSearchMode = false;

    runLayout();
    saveCurrentGraph();

    document.getElementById("graphName").value = "";

    loadGraphList();
    loadSocialFolders();

    document.getElementById("details").innerHTML =
        "New graph created: " + name;
}

function switchGraph(){
    const selected = document.getElementById("graphList").value;

    if(!selected){
        return;
    }

    if(!isSearchMode){
        saveCurrentGraph();
    }

    currentGraph = selected;
    localStorage.setItem("currentGraph", currentGraph);

    const savedGraph = localStorage.getItem(getGraphKey(currentGraph));

    cy.elements().remove();

    if(savedGraph){
        const graphData = JSON.parse(savedGraph);

        if(graphData.length > 0){
            cy.add(graphData);
        }else{
            createMainPersonNode(currentGraph);
        }
    }else{
        createMainPersonNode(currentGraph);
    }

    isSearchMode = false;
    runLayout();

    showSavedSocials();
}

function createMainPersonNode(graphName){
    const personName = graphName.replace("'s Socials", "");

    cy.add([
        {
            data:{
                id: makeId(personName),
                label: personName,
                type:"user"
            }
        }
    ]);

    saveCurrentGraph();
}

function loadGraphList(){
    const graphList = document.getElementById("graphList");
    graphList.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select Socials";
    placeholder.selected = true;
    placeholder.disabled = true;
    graphList.appendChild(placeholder);

    const graphs = getGraphNames();

    graphs.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        graphList.appendChild(option);
    });
}

function toggleMenu(){
    const menu = document.getElementById("sideMenu");

    menu.style.display =
        menu.style.display === "block"
        ? "none"
        : "block";
}

function closeMenu(){
    document.getElementById("sideMenu").style.display = "none";
}

function toggleSocialFolder(){

    const folder =
        document.getElementById("socialFolder");

    const arrow =
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

function showClearSearch(){

    const search =
        document.getElementById("searchName");

    const clear =
        document.getElementById("clearSearch");


    if(search.value.length > 0){

        clear.style.display = "block";

    }
    else{

        clear.style.display = "none";

    }

}



function clearSearchText(){

    document.getElementById("searchName").value = "";

    document.getElementById("clearSearch").style.display =
        "none";

}

function loadSocialFolders(){
    const socialFolder = document.getElementById("socialFolder");
    socialFolder.innerHTML = "";

    const graphs = getGraphNames();

    graphs.forEach(name => {
        const row = document.createElement("div");
        row.className = "folder-row";

        const folder = document.createElement("div");
        folder.className = "folder folder-name";
        folder.innerHTML = "📁 " + name;

        folder.onclick = function(){
            openGraphFromFolder(name);
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-folder";
        deleteBtn.innerHTML = "🗑️";

        deleteBtn.onclick = function(event){
            event.stopPropagation();
            deleteGraph(name);
        };

        row.appendChild(folder);
        row.appendChild(deleteBtn);
        socialFolder.appendChild(row);
    });
}

function deleteGraph(name){
    const confirmDelete = confirm("Delete " + name + "?");

    if(!confirmDelete){
        return;
    }

    let graphs = getGraphNames();
    graphs = graphs.filter(graph => graph !== name);

    localStorage.setItem("graphNames", JSON.stringify(graphs));
    localStorage.removeItem(getGraphKey(name));

    currentGraph = graphs[0] || "Daniel Lago's Socials";
    localStorage.setItem("currentGraph", currentGraph);

    const savedGraph = localStorage.getItem(getGraphKey(currentGraph));

    cy.elements().remove();

    if(savedGraph){
        cy.add(JSON.parse(savedGraph));
    }

    isSearchMode = false;

    runLayout();
    loadGraphList();
    loadSocialFolders();

    document.getElementById("details").innerHTML =
        name + " was deleted.";
}

function openGraphFromFolder(name){
    if(!isSearchMode){
        saveCurrentGraph();
    }

    currentGraph = name;
    localStorage.setItem("currentGraph", currentGraph);

    loadGraphList();

    const savedGraph = localStorage.getItem(getGraphKey(currentGraph));

    cy.elements().remove();

    if(savedGraph){
        cy.add(JSON.parse(savedGraph));
    }

    isSearchMode = false;

    runLayout();
    showSavedSocials();

    document.getElementById("sideMenu").style.display = "none";
}

function showSavedSocials(){
    const savedData = localStorage.getItem(getGraphKey(currentGraph));

    if(!savedData){
        document.getElementById('details').innerHTML =
            "No saved socials yet.";
        return;
    }

    const data = JSON.parse(savedData);

    const nodes = data.filter(item => !item.data.source);
    const edges = data.filter(item => item.data.source && item.data.target);

    let result = `
        <h3>📁 ${currentGraph}</h3>
        <hr>
    `;

    if(edges.length === 0){
        result += "No connections saved yet.";
    }

    edges.forEach(edge => {
        const source = nodes.find(n => n.data.id === edge.data.source);
        const target = nodes.find(n => n.data.id === edge.data.target);

        if(source && target){
            result += `
                <p>
                    <b>${source.data.label}</b>
                    connected to
                    <b>${target.data.label}</b><br>
                    Platform: ${edge.data.platform}
                </p>
                <hr>
            `;
        }
    });

    document.getElementById('details').innerHTML = result;
}

loadGraphList();
loadSocialFolders();

document.getElementById("details").innerHTML =
    "No graph opened yet. Search a name, create a graph, or open one from the menu.";

window.addEventListener("beforeunload", function(){
    saveCurrentGraph();
});

document.getElementById("searchName").addEventListener("keydown", function(event){
    if(event.key === "Enter"){
        searchPerson();
    }
});