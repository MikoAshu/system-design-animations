const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const valueInput = document.getElementById("value-input");
const nodeInput = document.getElementById("node-input");
const valueButton = document.getElementById("value-button");
const nodeButton = document.getElementById("node-button");
const positionInput = document.getElementById("position-input");
const addNodeButton = document.getElementById("add-node-button");
const tableBody = document.getElementById("table-body");

let NUM_BUCKETS = 6, BUCKET_WIDTH = 360 / NUM_BUCKETS;
const buckets = [];

const circle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 150,
    startAngle: 0,
    endAngle: 0
};

for (let i = 0; i < NUM_BUCKETS; i++) {
    buckets.push({
        start: BUCKET_WIDTH * i,
        end: BUCKET_WIDTH * (i + 1),
        values: []
    });
}

function hash(value) {
    let sum = 0;
    for (let i = 0; i < value.length; i++) {
        sum += value.charCodeAt(i);
    }
    const bucket = Math.floor((sum / (value.length * 64)) * NUM_BUCKETS);

    return bucket % NUM_BUCKETS;
}

function showNodeMapTable() {
    const nodeMapTable = document.getElementById("tableNodeMapping-body");
    nodeMapTable.innerHTML = "";
    for (let i = 0; i < NUM_BUCKETS; i++) {
        const row = document.createElement("tr");
        const nodeCell = document.createElement("td");
        const hashCell = document.createElement("td");
        
        nodeCell.textContent = i;
        hashCell.textContent = buckets[i].start + " - " + buckets[i].end;

        row.appendChild(nodeCell);
        row.appendChild(hashCell);
        nodeMapTable.appendChild(row);
    }
}

function addValue(value) {
    const bucket = hash(value);
    buckets[bucket].values.push(value);

    const row = document.createElement("tr");
    const valueCell = document.createElement("td");
    const hashCell = document.createElement("td");
    valueCell.style.fontWeight = "bold";
    hashCell.style.fontWeight = "bold";

    valueCell.textContent = value;
    hashCell.textContent = bucket;

    row.appendChild(valueCell);
    row.appendChild(hashCell);
    tableBody.appendChild(row);
}


function addNewNode(position) {
    NUM_BUCKETS++;
    BUCKET_WIDTH = 360 / NUM_BUCKETS;

    const newBucket = {
        start: BUCKET_WIDTH * (position - 1),
        end: BUCKET_WIDTH * position,
        values: []
    };

    buckets.splice(position - 1, 0, newBucket);

    for (let i = 0; i < NUM_BUCKETS - 1; i++) {
        buckets[i].start = BUCKET_WIDTH * i;
        buckets[i].end = BUCKET_WIDTH * (i + 1);
        console.log(i + " " + buckets[i].start + " " + buckets[i].end);
    }

    for (let i = position - 1; i < position + 1 && i < NUM_BUCKETS; i++) {
        console.log(i + " " + buckets[i].start + " " + buckets[i].end);
        const values = buckets[i].values;
        buckets[i].values = [];
        values.forEach((value) => {
            const bucket = hash(value);
            buckets[bucket].values.push(value);
        });
    }

    const rows = tableBody.getElementsByTagName("tr");
    for (let i = 0; i < rows.length; i++) {

        const row = rows[i];
        const oldValueCell = row.getElementsByTagName("td")[0];
        const hashedValueCell = row.getElementsByTagName("td")[1];

        const oldValue = oldValueCell.textContent;
        let hashedValue = hash(oldValue);

        console.log("Comparision " + hashedValueCell.textContent + " " + hashedValue);

        if(hashedValueCell.textContent != position - 1) {
            continue;
        }
        const newValueCell = row.insertCell(1);
        
        oldValueCell.style.fontWeight = "bold";
        hashedValueCell.style.fontWeight = "normal";
        newValueCell.style.fontWeight = "bold";

        newValueCell.textContent = hashedValue;
    }

    drawCircle();
}


function drawCircle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.lineWidth = 2;

    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";

    const padding = 10;
    const textRadius = circle.radius + padding;

    ctx.paintText = function (text, angle) {
        const x = circle.x + textRadius * Math.cos(angle * (Math.PI / 180));
        const y = circle.y + textRadius * Math.sin(angle * (Math.PI / 180));
        ctx.fillText(text, x, y);
    };

    for (let i = 0; i < NUM_BUCKETS; i++) {
        const angle = (buckets[i].start + buckets[i].end) / 2;
        const x = circle.x + circle.radius * Math.cos(angle * (Math.PI / 180));
        const y = circle.y + circle.radius * Math.sin(angle * (Math.PI / 180));

        ctx.fillStyle = "black";
        ctx.fillRect(x - 10, y - 10, 20, 20);

        ctx.fillStyle = "white";
        ctx.fillText(i, x, y);

    }

    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "black";

    for (let i = 0; i < NUM_BUCKETS; i++) {
        buckets[i].values.forEach((value, index) => {
            const angle = buckets[i].start + (BUCKET_WIDTH / (buckets[i].values.length + 1)) * (index + 1);
            const x = circle.x + (circle.radius + 20) * Math.cos(angle * (Math.PI / 180));
            const y = circle.y + (circle.radius + 20) * Math.sin(angle * (Math.PI / 180));
            if (angle > 100 && angle < 250) {
                ctx.textAlign = "right";
            } else {
                ctx.textAlign = "left";
            }
            ctx.fillText(value, x, y);
        });
    }
    // showNodeMapTable();
}

valueButton.addEventListener("click", function () {
    const value = valueInput.value;
    if (value) {
        addValue(value);
        valueInput.value = "";
    }
});

addNodeButton.addEventListener("click", () => {
    const position = Number(positionInput.value);
    addNewNode(position);
});

// document.querySelector('.cursor-pointer')
//     .addEventListener('click', function () {
//         this.nextElementSibling.classList.toggle('hidden');
//         this.querySelector('i').classList.toggle('fa-angle-down');
//         this.querySelector('i').classList.toggle('fa-angle-up');
//     });


function animate() {
    circle.startAngle += 0.01;
    circle.endAngle += 0.01;
    drawCircle();
    requestAnimationFrame(animate);
}

drawCircle();
animate();
